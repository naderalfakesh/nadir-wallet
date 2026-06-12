import AVFoundation
import MLKitFaceDetection
import MLKitVision
import NitroModules
import VisionCamera

class HybridFaceLiveness: HybridFaceLivenessSpec {
  private lazy var detector: FaceDetector = {
    let options = FaceDetectorOptions()
    options.performanceMode = .fast
    options.landmarkMode = .none
    options.contourMode = .none
    options.classificationMode = .all // eye-open probabilities
    options.minFaceSize = 0.15
    return FaceDetector.faceDetector(options: options)
  }()

  func detect(frame: any HybridFrameSpec) throws -> FaceObservation {
    guard let nativeFrame = frame as? any NativeFrame,
          let sampleBuffer = nativeFrame.sampleBuffer else {
      throw RuntimeError.error(withMessage: "Frame is not a valid NativeFrame!")
    }

    let orientation = frame.orientation
    let isMirrored = frame.isMirrored
    let bufferWidth = CGFloat(frame.width)
    let bufferHeight = CGFloat(frame.height)
    let timestampMs = frame.timestamp * 1000

    let image = VisionImage(buffer: sampleBuffer)
    image.orientation = Self.uiImageOrientation(for: orientation, isMirrored: isMirrored)

    let faces = try detector.results(in: image)
    guard let face = Self.mostProminent(of: faces) else {
      return Self.noFace(timestampMs: timestampMs)
    }

    // ML Kit returns the face frame in raw buffer coordinates. Rotate into
    // upright space, then mirror X so coordinates match the selfie preview.
    let bounds = Self.normalizedUprightBounds(
      face.frame,
      bufferWidth: bufferWidth,
      bufferHeight: bufferHeight,
      orientation: orientation,
      mirrored: isMirrored
    )

    return FaceObservation(
      hasFace: true,
      yaw: face.hasHeadEulerAngleY ? Double(face.headEulerAngleY) : 0,
      pitch: face.hasHeadEulerAngleX ? Double(face.headEulerAngleX) : 0,
      roll: face.hasHeadEulerAngleZ ? Double(face.headEulerAngleZ) : 0,
      leftEyeOpen: face.hasLeftEyeOpenProbability ? Double(face.leftEyeOpenProbability) : -1,
      rightEyeOpen: face.hasRightEyeOpenProbability ? Double(face.rightEyeOpenProbability) : -1,
      x: bounds.origin.x,
      y: bounds.origin.y,
      width: bounds.size.width,
      height: bounds.size.height,
      timestampMs: timestampMs
    )
  }

  private static func noFace(timestampMs: Double) -> FaceObservation {
    return FaceObservation(
      hasFace: false, yaw: 0, pitch: 0, roll: 0,
      leftEyeOpen: -1, rightEyeOpen: -1,
      x: 0, y: 0, width: 0, height: 0,
      timestampMs: timestampMs
    )
  }

  private static func mostProminent(of faces: [Face]) -> Face? {
    return faces.max { a, b in
      a.frame.width * a.frame.height < b.frame.width * b.frame.height
    }
  }

  private static func uiImageOrientation(
    for orientation: CameraOrientation,
    isMirrored: Bool
  ) -> UIImage.Orientation {
    // Mirroring flips the rotation direction, hence right <-> left swaps.
    switch orientation {
    case .up: return isMirrored ? .upMirrored : .up
    case .right: return isMirrored ? .leftMirrored : .right
    case .down: return isMirrored ? .downMirrored : .down
    case .left: return isMirrored ? .rightMirrored : .left
    }
  }

  /// Maps a rect in raw buffer coordinates to normalized (0..1) coordinates
  /// in the upright display space, optionally mirrored horizontally.
  private static func normalizedUprightBounds(
    _ rect: CGRect,
    bufferWidth: CGFloat,
    bufferHeight: CGFloat,
    orientation: CameraOrientation,
    mirrored: Bool
  ) -> CGRect {
    var upright: CGRect
    var uprightWidth: CGFloat
    var uprightHeight: CGFloat

    switch orientation {
    case .up:
      upright = rect
      uprightWidth = bufferWidth
      uprightHeight = bufferHeight
    case .down: // 180°
      upright = CGRect(
        x: bufferWidth - rect.maxX,
        y: bufferHeight - rect.maxY,
        width: rect.width,
        height: rect.height
      )
      uprightWidth = bufferWidth
      uprightHeight = bufferHeight
    case .right: // buffer must rotate 90° CW to be upright
      upright = CGRect(
        x: bufferHeight - rect.maxY,
        y: rect.minX,
        width: rect.height,
        height: rect.width
      )
      uprightWidth = bufferHeight
      uprightHeight = bufferWidth
    case .left: // 90° CCW
      upright = CGRect(
        x: rect.minY,
        y: bufferWidth - rect.maxX,
        width: rect.height,
        height: rect.width
      )
      uprightWidth = bufferHeight
      uprightHeight = bufferWidth
    }

    if mirrored {
      upright.origin.x = uprightWidth - upright.maxX
    }

    return CGRect(
      x: upright.origin.x / uprightWidth,
      y: upright.origin.y / uprightHeight,
      width: upright.width / uprightWidth,
      height: upright.height / uprightHeight
    )
  }
}

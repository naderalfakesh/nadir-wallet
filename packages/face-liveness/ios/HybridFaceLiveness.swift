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
    options.classificationMode = .none
    return FaceDetector.faceDetector(options: options)
  }()

  func detectFaceCount(frame: any HybridFrameSpec) throws -> Double {
    guard let nativeFrame = frame as? any NativeFrame else {
      throw RuntimeError.error(withMessage: "Frame is not a NativeFrame!")
    }
    guard let sampleBuffer = nativeFrame.sampleBuffer else {
      throw RuntimeError.error(withMessage: "Frame has no CMSampleBuffer!")
    }
    let image = VisionImage(buffer: sampleBuffer)
    // Spike: assumes portrait + front camera. Proper orientation handling
    // (device rotation x sensor orientation) lands with the real plugin.
    image.orientation = .leftMirrored
    let faces = try detector.results(in: image)
    return Double(faces.count)
  }
}

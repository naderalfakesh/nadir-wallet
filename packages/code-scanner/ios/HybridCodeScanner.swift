import AVFoundation
import MLKitBarcodeScanning
import MLKitVision
import NitroModules
import VisionCamera

class HybridCodeScanner: HybridCodeScannerSpec {
  private lazy var scanner: BarcodeScanner = {
    let options = BarcodeScannerOptions(formats: .qrCode)
    return BarcodeScanner.barcodeScanner(options: options)
  }()

  func scan(frame: any HybridFrameSpec) throws -> [String] {
    guard let nativeFrame = frame as? any NativeFrame,
          let sampleBuffer = nativeFrame.sampleBuffer else {
      throw RuntimeError.error(withMessage: "Frame is not a valid NativeFrame!")
    }
    let image = VisionImage(buffer: sampleBuffer)
    image.orientation = Self.uiOrientation(frame.orientation, mirrored: frame.isMirrored)
    let barcodes = try scanner.results(in: image)
    return barcodes.compactMap { $0.rawValue }
  }

  private static func uiOrientation(
    _ orientation: CameraOrientation,
    mirrored: Bool
  ) -> UIImage.Orientation {
    switch orientation {
    case .up: return mirrored ? .upMirrored : .up
    case .right: return mirrored ? .leftMirrored : .right
    case .down: return mirrored ? .downMirrored : .down
    case .left: return mirrored ? .rightMirrored : .left
    }
  }
}

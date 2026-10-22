package com.margelo.nitro.codescanner

import androidx.annotation.Keep
import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import com.facebook.proguard.annotations.DoNotStrip
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.public.NativeFrame

// Nitro's C++ OnLoad creates this class by its JNI name, so R8 must keep it.
@DoNotStrip
@Keep
class HybridCodeScanner : HybridCodeScannerSpec() {
  private val scanner = BarcodeScanning.getClient(
    BarcodeScannerOptions.Builder()
      .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
      .build()
  )

  @DoNotStrip
  @Keep
  @OptIn(ExperimentalGetImage::class)
  override fun scan(frame: HybridFrameSpec): Array<String> {
    val nativeFrame = frame as? NativeFrame
      ?: throw Error("Frame is not a NativeFrame!")
    val mediaImage = nativeFrame.image.image
      ?: throw Error("Frame has no underlying Image!")
    val input = InputImage.fromMediaImage(mediaImage, nativeFrame.image.imageInfo.rotationDegrees)
    val barcodes = Tasks.await(scanner.process(input))
    return barcodes.mapNotNull { it.rawValue }.toTypedArray()
  }

  override fun dispose() {
    scanner.close()
    super.dispose()
  }
}

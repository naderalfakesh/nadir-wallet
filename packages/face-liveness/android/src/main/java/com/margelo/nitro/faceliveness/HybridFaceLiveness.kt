package com.margelo.nitro.faceliveness

import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.public.NativeFrame

class HybridFaceLiveness : HybridFaceLivenessSpec() {
  private val detector = FaceDetection.getClient(
    FaceDetectorOptions.Builder()
      .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
      .build()
  )

  @OptIn(ExperimentalGetImage::class)
  override fun detectFaceCount(frame: HybridFrameSpec): Double {
    val nativeFrame = frame as? NativeFrame
      ?: throw Error("Frame is not a NativeFrame!")
    val mediaImage = nativeFrame.image.image
      ?: throw Error("Frame has no underlying Image!")
    val input = InputImage.fromMediaImage(
      mediaImage,
      nativeFrame.image.imageInfo.rotationDegrees,
    )
    // Spike: blocking the camera worklet thread is acceptable for a stub;
    // the real plugin keeps detection synchronous per-frame by design.
    val faces = Tasks.await(detector.process(input))
    return faces.size.toDouble()
  }

  override fun dispose() {
    detector.close()
    super.dispose()
  }
}

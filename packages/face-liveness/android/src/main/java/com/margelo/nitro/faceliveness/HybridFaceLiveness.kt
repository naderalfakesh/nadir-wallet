package com.margelo.nitro.faceliveness

import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.Face
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.public.NativeFrame

class HybridFaceLiveness : HybridFaceLivenessSpec() {
  private val detector = FaceDetection.getClient(
    FaceDetectorOptions.Builder()
      .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
      .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL) // eye-open probabilities
      .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_NONE)
      .setContourMode(FaceDetectorOptions.CONTOUR_MODE_NONE)
      .setMinFaceSize(0.15f)
      .build()
  )

  @OptIn(ExperimentalGetImage::class)
  override fun detect(frame: HybridFrameSpec): FaceObservation {
    val nativeFrame = frame as? NativeFrame
      ?: throw Error("Frame is not a NativeFrame!")
    val mediaImage = nativeFrame.image.image
      ?: throw Error("Frame has no underlying Image!")
    val rotation = nativeFrame.image.imageInfo.rotationDegrees
    val timestampMs = nativeFrame.image.imageInfo.timestamp / 1_000_000.0

    val input = InputImage.fromMediaImage(mediaImage, rotation)
    // Synchronous wait is intentional: we are on the camera worklet thread and
    // the contract is one observation per frame; ML Kit fast mode keeps this
    // well under a frame interval on recent devices.
    val faces = Tasks.await(detector.process(input))
    val face = mostProminent(faces) ?: return noFace(timestampMs)

    // ML Kit reports coordinates in the upright (rotation-applied) space, so
    // swap the buffer dimensions for 90°/270° rotations before normalizing.
    val uprightWidth = (if (rotation % 180 == 0) input.width else input.height).toDouble()
    val uprightHeight = (if (rotation % 180 == 0) input.height else input.width).toDouble()

    val box = face.boundingBox
    var x = box.left.toDouble()
    val y = box.top.toDouble()
    val w = box.width().toDouble()
    val h = box.height().toDouble()
    // Android front-camera buffers are not mirrored, but the preview is.
    // Mirror X so coordinates match what the user sees.
    x = uprightWidth - (x + w)

    return FaceObservation(
      hasFace = true,
      yaw = face.headEulerAngleY.toDouble(),
      pitch = face.headEulerAngleX.toDouble(),
      roll = face.headEulerAngleZ.toDouble(),
      leftEyeOpen = face.leftEyeOpenProbability?.toDouble() ?: -1.0,
      rightEyeOpen = face.rightEyeOpenProbability?.toDouble() ?: -1.0,
      smile = face.smilingProbability?.toDouble() ?: -1.0,
      x = (x / uprightWidth).coerceIn(0.0, 1.0),
      y = (y / uprightHeight).coerceIn(0.0, 1.0),
      width = (w / uprightWidth).coerceIn(0.0, 1.0),
      height = (h / uprightHeight).coerceIn(0.0, 1.0),
      timestampMs = timestampMs,
    )
  }

  private fun noFace(timestampMs: Double) = FaceObservation(
    hasFace = false, yaw = 0.0, pitch = 0.0, roll = 0.0,
    leftEyeOpen = -1.0, rightEyeOpen = -1.0, smile = -1.0,
    x = 0.0, y = 0.0, width = 0.0, height = 0.0,
    timestampMs = timestampMs,
  )

  private fun mostProminent(faces: List<Face>): Face? =
    faces.maxByOrNull { it.boundingBox.width() * it.boundingBox.height() }

  override fun dispose() {
    detector.close()
    super.dispose()
  }
}

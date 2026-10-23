# Pixel 9 Android device verification

Status: **Android done, iOS deferred.**

Date: 2026-10-23. Google Pixel 9, Android 17. Release APKs with R8 on, signed
with the debug key, installed over the earlier build. Driven over wireless
adb; the owner did the fingerprint, face, camera and permission taps.
Testnet throwaway data only.

| APK sha256  | Commit    | Use                                     |
| ----------- | --------- | --------------------------------------- |
| `010e8481…` | `ee62b96` | First run (SDK 58 `main`)               |
| `1df5d086…` | `358ad91` | Fixes below, checked again on the phone |

## Passed

- Cold start shows the lock screen and hides wallet content (owner).
- Installing over the earlier broken build kept the wallet.
- QR scan with the real camera from Send: a valid payment QR fills
  `0x1111…` on Sepolia; an invalid one is refused with a plain sentence and
  the recipient stays unchanged.
- Liveness with a real face passes (owner). A timeout fails with a plain
  sentence and Try again / Cancel (owner).
- Revealing the recovery phrase needs device authentication, and liveness as
  well when "Liveness before reveal" is on. The phrase stays behind "Tap to
  reveal". There is no Copy for the phrase anywhere; a code read confirmed
  `copyText` is used only for the address, receive and transactions.

## Findings

| ID    | Severity | Finding                                                                                                        | Fix                  |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------- | -------------------- |
| NW-H1 | High     | The recovery phrase screens allowed screenshots, screen recording and the Recents thumbnail (no `FLAG_SECURE`) | `6621ed6`            |
| NW-F1 | Medium   | Home "Scan QR code" opened a static placeholder sheet; the real scanner was only reachable from Send           | `1ac3e99`, `023b3f4` |
| NW-L1 | Low      | The Android biometric prompt was titled "Unlock with Face ID"                                                  | `be14263`, `3dc515f` |
| NW-L2 | Low      | Security activity said "Face ID" on Android and showed demo entries dated in the future                        | `039a623`, `358ad91` |

Checked on the phone with APK `1df5d086…`:

- On the reveal screen a screenshot comes out black and the Recents card is
  blank; capture works again after leaving the screen.
- Home scan opens the real scanner: an invalid QR is refused, a valid one
  goes to Send with `0x1111…` on Sepolia.
- Biometric wording is neutral.

## Deferred

- iOS Face ID, the iPhone camera (QR scan and liveness) and the iOS blur over
  the app switcher: the owner deferred iPhone testing.
- TalkBack.

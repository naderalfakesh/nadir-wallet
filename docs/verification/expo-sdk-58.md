# Expo SDK 58 upgrade: verification

Status: **machine checks green, native QA pending.**

Date: 2026-10-22. Branch `chore/expo-sdk58`, based on `main` at `453baf2`
(Expo SDK 57.0.30).

## Versions

| Package                      | Before  | After   |
| ---------------------------- | ------- | ------- |
| expo                         | 57.0.30 | 58.0.17 |
| react-native                 | 0.86.3  | 0.88.0  |
| react / react-dom            | 19.2.3  | 19.3.0  |
| expo-router                  | 57.0.28 | 58.0.25 |
| react-native-reanimated      | 4.5.1   | 4.7.1   |
| react-native-worklets        | 0.10.1  | 0.13.0  |
| react-native-screens         | 4.26.2  | 4.30.0  |
| react-native-gesture-handler | 2.32.x  | 3.3.0   |
| react-native-vision-camera   | 5.2.3   | 5.2.3   |
| react-native-nitro-modules   | 0.37.1  | 0.37.1  |

The other `expo-*` packages moved to the versions `expo install --fix`
picks for 58.0.17. `packages/code-scanner` and `packages/face-liveness` had
their React and React Native dev dependencies moved to match.

Expo 58.0.17 and some of its dependencies were less than a day old at
install time, so pnpm's `minimumReleaseAge` check rejected them. pnpm added
them by exact version to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`.
They all pass the default one-day age after 2026-10-22 19:20 UTC, and the
list can be removed after that.

## Code changes

- Custom tab bar: expo-router 58 passes `emitter` and `navigateToTab(routeKey)`
  to `tabBar` instead of `navigation`. `Tabs` no longer accepts
  `initialRouteName`. Home is the first declared tab, so it is still the
  default.
- Intro screen: the title ref is typed `ComponentRef<typeof View>` for the
  stricter React Native 0.88 ref types.
- `expo-build-properties` `ios.enableSceneSupport` removed. It does nothing on
  SDK 58, and the generated iOS app already uses `SceneDelegate`.
- Android release builds keep R8 on, with added keep rules (below).

Checked and unchanged:

- `Stack.Protected`: the only screen at `/` is the unguarded `index`
  redirect. The guarded screens are at `/onboarding`, `/lock`, `/home`,
  `/send` and so on, so no two guarded screens share a URL.
- `expo-file-system` and `expo-sqlite` are not used.
- `expo-secure-store` `deleteItemAsync` now rejects on iOS when the keychain
  refuses a delete. The only callers are in `storage.clearWallet`, and both
  already catch the error. Behaviour is the same as before: a refused delete is
  ignored.

## R8 keep rules

Two things in the camera plugins are only reached by name, so R8 can't see that
they are used.

**Nitro hybrid objects.** The generated C++ `OnLoad` creates
`com.margelo.nitro.codescanner.HybridCodeScanner` and
`com.margelo.nitro.faceliveness.HybridFaceLiveness` by JNI name, through their
no-argument constructors. Nothing in Kotlin references them, so the first R8
build removed both classes. `createHybridObject` would then fail, and the scanner
and liveness screens would show "unavailable". Both classes and their
`scan`/`detect` overrides now carry `@Keep` and `@DoNotStrip`. Each package also
ships `android/consumer-rules.pro` (wired through `consumerProguardFiles`), so
any app using the package keeps the class. The generated `*Spec`, `*Spec$CxxPart`
and `FaceObservation` classes, the other JNI lookups, already carry
`@Keep`/`@DoNotStrip` from nitrogen.

**ML Kit registrars.** ML Kit reads its `ComponentRegistrar` class names from the
manifest and creates each one through its no-argument constructor. ML Kit pulls
in `firebase-components` 16.1.0, whose rule keeps those classes but not their
constructors. An earlier R8-on build logged
`NoSuchMethodException ... CommonComponentRegistrar.<init> []` for all four
registrars. Both consumer files and `apps/mobile/app.json`
(`android.extraProguardRules`, which `expo prebuild --clean` writes into
`android/app/proguard-rules.pro`) add the two lines `firebase-components` 19.0.0
ships:

```
-keep class * implements com.google.firebase.components.ComponentRegistrar { void <init>(); }
-keep,allowshrinking interface com.google.firebase.components.ComponentRegistrar
```

A blanket `-keep class com.google.mlkit.** { *; }` is not needed.

## Machine checks

| Check                                                         | Result                          |
| ------------------------------------------------------------- | ------------------------------- |
| `npx expo install --check`                                    | Dependencies are up to date     |
| `npx expo-doctor` (after a clean frozen install)              | 20/20 checks passed             |
| `pnpm install --frozen-lockfile`                              | passes                          |
| `pnpm lint`                                                   | pass                            |
| `pnpm typecheck`                                              | pass (7 packages)               |
| `pnpm test`                                                   | 25 files, 307 tests pass        |
| `npx expo prebuild --clean`                                   | pass, pods installed            |
| Android `./gradlew assembleRelease --max-workers=4` (JDK 17)  | BUILD SUCCESSFUL, R8 on         |
| iOS `xcodebuild` Release, iOS Simulator, Xcode 27.1 (27A9275) | BUILD SUCCEEDED, arm64 + x86_64 |

These are the checks CI runs too. On `main`, `prettier --check` already
reported files that need formatting before this change, so it is not part of the
gate.

R8 evidence from the release build (APK sha256 `60beea37…9614a`):

- `:app:minifyReleaseWithR8` ran. The mapping header reads `compiler: R8`,
  `compiler_version: 9.2.14`. `configuration.txt` contains the app rules and
  both consumer files.
- `seeds.txt` keeps `HybridCodeScanner` and `HybridFaceLiveness`, their
  constructors, `scan`/`detect`/`dispose`, both `*Spec` classes, and
  `*Spec$CxxPart.initHybrid()`.
- `dexdump` finds these classes under their original names:
  - `Lcom/margelo/nitro/codescanner/HybridCodeScanner;` with `<init>`, `scan`
    and `dispose`.
  - `Lcom/margelo/nitro/faceliveness/HybridFaceLiveness;` with `<init>`,
    `detect` and `dispose`.
  - Both `*Spec` and `*Spec$CxxPart` classes, with the `initHybrid` native, and
    `FaceObservation`.
- The four ML Kit registrars in the merged manifest (`CommonComponentRegistrar`,
  `BarcodeRegistrar`, `VisionCommonRegistrar`, `FaceRegistrar`) keep their names
  and `void <init>()`.
- The dynamite entry points `ThickBarcodeScannerCreator` and
  `ThickFaceDetectorCreator` and both `ModuleDescriptor`s are kept by ML Kit's
  own rules.
- The static facades `BarcodeScanning` and `FaceDetection` are inlined into the
  hybrid constructors (the mapping shows their `getClient` and builder calls
  folded into `<init>`). Nothing looks them up by name.

No simulator, emulator or device was booted or addressed for these checks.

The R8 fixes touch only Android files, so the iOS build above was not repeated.

`545a93e` (the dependency bump) does not typecheck on its own. The tab bar fix
that it needs lands in `449bbdb`. The branch was left as it is, with no history
rewrite.

## Native QA (pending)

None of these have been run on this branch yet:

- [ ] Auth gate on cold start and on resume. Biometric cancel and biometric
      failure fall back to the passcode, with no phrase read.
- [ ] Passcode fallback: a wrong passcode, then the right one, and the lockout
      escalation.
- [ ] Protected routes: the tabs, back navigation, and a `nadirwallet://send`
      deep link while locked, which stays on the lock screen. The same link
      before onboarding lands on onboarding.
- [ ] Onboarding intro: paging, focus moving to the title, and finishing into
      create or import.
- [ ] QR scan through the emulator's `-camera-back imagefile:` route, with a
      valid payment QR filling the recipient and an invalid one rejected.
- [ ] Liveness flow up to the camera: permission, preview and the face-in-oval
      gate.
- [ ] A simulated send: risk check, simulation and outcome copy, with nothing
      signed or broadcast.
- [ ] Android R8-on release APK: launches, the scanner opens, and logcat shows
      no `ComponentDiscovery` or `NoSuchMethodException` lines.
- [ ] iOS Release simulator build: launches and covers the same non-camera
      flows.

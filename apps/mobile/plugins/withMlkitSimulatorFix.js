const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Google ML Kit ships static frameworks with no arm64-simulator slice and pins
// EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64 in its podspecs. Xcode 26 removed
// Rosetta simulator support, so an x86_64 simulator app can no longer install -
// without this fix there is no usable simulator destination at all.
//
// The hooks injected below run on every `pod install`:
//   1. post_integrate strips the EXCLUDED_ARCHS override from all generated
//      xcconfigs. It must run after integration because CocoaPods writes the
//      app's aggregate xcconfigs (Pods-<App>.*.xcconfig) after post_install.
//   2. post_install deletes LC_BUILD_VERSION from the arm64 objects of the
//      MLKit frameworks that carry one (platform-agnostic objects link for
//      device AND simulator, matching how Google already ships
//      MLKitBarcodeScanning/FaceDetection).
const POST_INTEGRATE_BLOCK = `  # ML Kit arm64-simulator fix (injected by plugins/withMlkitSimulatorFix.js)
  post_integrate do |installer|
    Dir.glob(File.join(installer.sandbox.root, 'Target Support Files', '**', '*.xcconfig')).each do |f|
      txt = File.read(f)
      out = txt.gsub(/^EXCLUDED_ARCHS\\[sdk=iphonesimulator\\*\\] = arm64\\n/, '')
      File.write(f, out) if out != txt
    end
  end

`;

const POST_INSTALL_SNIPPET = `
    mlkit_patch = File.expand_path('../plugins/mlkit-sim-patch.py', installer.sandbox.root.dirname)
    %w[MLKitCommon MLKitVision MLImage].each do |fw|
      bin = File.join(installer.sandbox.root, fw, 'Frameworks', "#{fw}.framework", fw)
      next unless File.exist?(bin)
      system('python3', mlkit_patch, bin, '0') or raise "mlkit-sim-patch.py failed for #{fw}"
    end
`;

module.exports = function withMlkitSimulatorFix(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfile = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes('ML Kit arm64-simulator fix')) {
        const anchor = /( *)(post_install do \|installer\|\n)/;
        if (!anchor.test(contents)) {
          throw new Error('withMlkitSimulatorFix: no post_install block found in Podfile');
        }
        contents = contents.replace(anchor, `${POST_INTEGRATE_BLOCK}$1$2${POST_INSTALL_SNIPPET}`);
        fs.writeFileSync(podfile, contents);
      }
      return config;
    },
  ]);
};

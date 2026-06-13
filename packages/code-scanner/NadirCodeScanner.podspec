require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "NadirCodeScanner"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  # GoogleMLKit/BarcodeScanning 8.0.0 requires iOS >= 15.5; the app targets 16.4.
  s.platforms    = { :ios => "16.4" }
  s.source       = { :git => package["repository"]["url"], :tag => "#{s.version}" }

  s.source_files = [
    "ios/**/*.{swift,m,mm}",
  ]
  s.frameworks = ["AVFoundation"]

  load 'nitrogen/generated/ios/NadirCodeScanner+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  s.dependency 'GoogleMLKit/BarcodeScanning', '8.0.0'
  s.dependency 'VisionCamera'
  install_modules_dependencies(s)
end

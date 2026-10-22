# Nitro's C++ OnLoad looks this class up by its JNI name
# ("Lcom/margelo/nitro/codescanner/HybridCodeScanner;") and creates it through its no-argument
# constructor, so nothing in Java or Kotlin references it.
-keep class com.margelo.nitro.codescanner.HybridCodeScanner { *; }

# ML Kit creates its components by reflection from the manifest. The rule in the
# firebase-components version ML Kit pulls in keeps these classes but not their
# no-argument constructors.
-keep class * implements com.google.firebase.components.ComponentRegistrar { void <init>(); }
-keep,allowshrinking interface com.google.firebase.components.ComponentRegistrar

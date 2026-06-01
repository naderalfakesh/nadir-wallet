// Custom entry: the getRandomValues polyfill MUST run before any module that
// reads `globalThis.crypto` at load time (@noble/hashes, pulled in via viem,
// captures it at import). Importing it in a screen/layout is too late because
// expo-router evaluates route modules first. Keep this the very first import.
import "react-native-get-random-values";
import "expo-router/entry";

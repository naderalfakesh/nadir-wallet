// Demo-only recovery phrase. No real key generation or storage happens in this
// app — this fixed phrase exists purely to drive the backup/verify UI.
// TODO(pass 3): replace with on-device BIP39 generation behind secure storage.
export const DEMO_RECOVERY_PHRASE = [
  "velvet",
  "harbor",
  "glide",
  "pioneer",
  "meadow",
  "signal",
  "tangle",
  "orbit",
  "crimson",
  "linen",
  "quartz",
  "summit",
];

// Accepted as the demo "valid" import phrase; anything else fails the mock check.
export const DEMO_IMPORT_WORDS = new Set(DEMO_RECOVERY_PHRASE);

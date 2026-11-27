import type { SavedRecipient } from "../types";

// Full 40-char addresses so the live risk API (which validates address format)
// returns the intended low/medium/high for each sample recipient.
export const RECIPIENTS: SavedRecipient[] = [
  {
    addr: "0x6b2fA0e1c4D9b8721a3F5e0c91A4D3b21f9C0e57",
    label: "demo.eth",
    network: "ethereum",
    known: true,
  },
  {
    addr: "0x44Ae7C13b9F02d6E8a51c0937dD7c1A2b3C4D5e6",
    label: null,
    network: "polygon",
    known: false,
  },
  {
    addr: "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
    label: "Reported address",
    network: "ethereum",
    known: false,
    flagged: true,
  },
];

// The real address comes from prefs.walletAddress (derived on-device); this is
// just the display name shown alongside it.
export const ACCOUNT = {
  label: "Main Wallet",
  caption: "Testnet account",
} as const;

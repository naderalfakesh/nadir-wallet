import type { SavedRecipient } from "../types";

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

export const ACCOUNT = {
  label: "Main Wallet",
  caption: "Testnet account",
} as const;

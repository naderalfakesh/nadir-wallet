// Base URL for the Nadir Wallet API.
//
// On a simulator `localhost` reaches the dev machine, but on a physical device
// it does not - set EXPO_PUBLIC_API_URL to the machine's LAN address
// (e.g. http://192.168.1.20:8787) in apps/mobile/.env so the device can connect.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

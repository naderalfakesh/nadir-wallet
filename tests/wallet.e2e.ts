import { test } from "@e2e-dev/mobile";
import { expect } from "e2e";

test.describe("Nadir Wallet", () => {
  const pin = "123456";

  test.beforeEach(async ({ app, screen }) => {
    await app.clearState();
    await screen.getByRole("button", "Skip", { exact: true }).tap();
    await screen.getByRole("button", "I already have a wallet").tap();
    await screen.getByRole("button", "Generate sample").tap();
    await expect(screen.getByText("12 words", { exact: true })).toBeVisible();

    const importWallet = screen.getByTestId("import-wallet");
    await screen.scrollUntilVisible(importWallet);
    await importWallet.tap();

    for (const stage of ["Create a passcode", "Confirm passcode"]) {
      await expect(screen.getByText(stage, { exact: true })).toBeVisible();
      for (const digit of pin) {
        await screen.getByLabel(digit, { exact: true }).tap();
      }
    }
    await screen.getByRole("button", "Set up later").tap();
    await screen.getByRole("button", "Open wallet").tap();
    await expect(screen.getByText("Total balance", { exact: true })).toBeVisible();
  });

  test("locks on restart and unlocks with the app passcode", async ({ app, screen }) => {
    await app.restart();
    await expect(screen.getByText("Enter passcode", { exact: true })).toBeVisible();
    await expect(screen.getByText("Total balance", { exact: true })).not.toBeVisible();

    for (const digit of pin) {
      await screen.getByLabel(digit, { exact: true }).tap();
    }
    await expect(screen.getByText("Total balance", { exact: true })).toBeVisible();
  });

  test("rejects a partial address and shows the API fee on Send review", async ({ screen }) => {
    await screen.getByText("Send", { exact: true }).tap();
    const recipient = screen.getByTestId("send-recipient");
    await recipient.fill("0x123456");

    await expect(
      screen.getByText("Not a valid wallet address or ENS name.", { exact: true }),
    ).toBeVisible();
    await expect(screen.getByText(/Risk check unavailable/)).not.toBeVisible();

    await recipient.fill("0x1111111111111111111111111111111111111111");
    await screen.getByRole("button", "Continue", { exact: true }).tap();

    for (const key of ["Decimal point", "0", "1"]) {
      await screen.getByLabel(key, { exact: true }).tap();
    }
    await screen.getByRole("button", "Review", { exact: true }).tap();

    await expect(screen.getByText("Network fee", { exact: true })).toBeVisible();
    await expect(screen.getByText("0.0000525 ETH", { exact: true }).first()).toBeVisible();
    await expect(screen.getByRole("button", "Confirm simulated send")).toBeVisible();
  });

  test("switches to bundled data and changes the Receive QR network", async ({ screen }) => {
    await screen.getByTestId("tab-settings").tap();
    const liveApi = screen.getByTestId("live-api-data");
    await screen.scrollUntilVisible(liveApi);
    await liveApi.tap();
    await expect(screen.getByText("Using bundled demo data", { exact: true })).toBeVisible();

    await screen.getByTestId("tab-home").tap();
    await screen.getByText("Receive", { exact: true }).tap();
    await expect(screen.getByText("Ethereum Sepolia payment QR", { exact: true })).toBeVisible();
    await screen.getByText("Polygon Amoy", { exact: true }).tap();
    await expect(screen.getByText("Polygon Amoy payment QR", { exact: true })).toBeVisible();
  });
});

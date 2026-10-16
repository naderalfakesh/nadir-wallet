import { Redirect } from "expo-router";
import { useApp } from "@/providers/AppProvider";
import { entryHref } from "@/features/lock/routeAccess";

// Route on launch, and whenever a route group closes, to the one group that is
// open: first run → onboarding, a locked session → lock (biometric if enabled,
// passcode fallback either way), an unlocked session → the wallet.
export default function Index() {
  const { prefs, sessionUnlocked } = useApp();
  return <Redirect href={entryHref({ onboarded: prefs.onboardingCompleted, unlocked: sessionUnlocked })} />;
}

import { Redirect } from "expo-router";
import { useApp } from "@/providers/AppProvider";

// Route on launch from persisted state: first run → onboarding, otherwise lock
// before the wallet (biometric if enabled, passcode fallback either way).
export default function Index() {
  const { prefs } = useApp();
  if (!prefs.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/lock" />;
}

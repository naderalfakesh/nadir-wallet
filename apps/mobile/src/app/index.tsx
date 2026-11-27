import { Redirect } from "expo-router";
import { entryHref } from "@/features/lock/routeAccess";
import { useApp } from "@/providers/AppProvider";

export default function Index() {
  const { prefs, sessionUnlocked } = useApp();
  return (
    <Redirect
      href={entryHref({ onboarded: prefs.onboardingCompleted, unlocked: sessionUnlocked })}
    />
  );
}

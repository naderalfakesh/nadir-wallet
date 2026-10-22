// Note: the crypto.getRandomValues polyfill is loaded in the app entry
// (index.js), which must run before any module that reads crypto at import time.
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { WalletDataProvider } from "@/providers/WalletDataProvider";
import { AutoLock } from "@/features/lock/AutoLock";
import { groupGuards } from "@/features/lock/routeAccess";
import { loadPersistedState, type PersistedState } from "@/services/storage";
import { loadBiometryKind } from "@/services/auth/biometry";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from "@expo-google-fonts/ibm-plex-mono";
import { ThemeProvider, useThemeControls } from "@/theme";
import { DemoStateProvider } from "@/providers/DemoStateProvider";
import { SheetProvider } from "@/providers/SheetProvider";
import { SheetHost } from "@/features/sheets/SheetHost";

SplashScreen.preventAutoHideAsync();

function ThemedStatusBar() {
  const { scheme } = useThemeControls();
  return <StatusBar style={scheme === "light" ? "dark" : "light"} />;
}

// Each group is registered only while it is open (see routeAccess). A closed
// group's screens leave the navigator, so a cold-start or warm deep link to
// one can't mount it, and closing a group (lock, reset) unmounts its screens
// and falls back to `index`, which redirects to whichever group is open.
function RootStack() {
  const { prefs, sessionUnlocked } = useApp();
  const guard = groupGuards({ onboarded: prefs.onboardingCompleted, unlocked: sessionUnlocked });

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
        <Stack.Protected guard={guard.onboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={guard.lock}>
          <Stack.Screen name="lock" options={{ animation: "slide_from_bottom" }} />
        </Stack.Protected>
        <Stack.Protected guard={guard.wallet}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="send" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="token/[id]" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="backup" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="reveal" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="change-passcode" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="liveness" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="scan" options={{ animation: "slide_from_bottom" }} />
        </Stack.Protected>
      </Stack>
      <SheetHost walletOpen={guard.wallet} />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  const [boot, setBoot] = useState<PersistedState | null>(null);

  useEffect(() => {
    // Resolve the biometry name before the first screen renders its strings.
    Promise.all([loadPersistedState(), loadBiometryKind()]).then(([state]) => setBoot(state));
  }, []);

  const ready = loaded && boot != null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready || !boot) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider initial={boot}>
          <ThemeProvider initialScheme={boot.theme}>
            <DemoStateProvider initial={boot.demo}>
              <WalletDataProvider>
                <SheetProvider>
                  <ThemedStatusBar />
                  <RootStack />
                  <AutoLock />
                </SheetProvider>
              </WalletDataProvider>
            </DemoStateProvider>
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

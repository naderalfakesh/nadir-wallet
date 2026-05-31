import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider } from "@/providers/AppProvider";
import { loadPersistedState, type PersistedState } from "@/services/storage";
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
    loadPersistedState().then(setBoot);
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
              <SheetProvider>
              <ThemedStatusBar />
              <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="lock" options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="send" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="token/[id]" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="backup" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="reveal" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="change-passcode" options={{ animation: "slide_from_right" }} />
              </Stack>
                <SheetHost />
              </SheetProvider>
            </DemoStateProvider>
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

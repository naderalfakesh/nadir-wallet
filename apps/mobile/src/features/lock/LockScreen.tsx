import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, Brandmark, AppText, Button, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";

export function LockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);

  const unlock = () => {
    setScanning(true);
    setTimeout(() => router.replace("/home"), 1200);
  };

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", paddingTop: insets.top + 72 }}>
        <Brandmark size={58} />
        <AppText weight="bold" size={22} style={{ marginTop: 18, letterSpacing: -0.4 }}>
          {t("common.appName")}
        </AppText>
        <AppText size={14} muted style={{ marginTop: 6 }}>
          {t("lock.welcomeBack")}
        </AppText>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 30,
              backgroundColor: theme.colors.accentDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="faceid" size={50} stroke={1.8} color={theme.colors.accent} />
          </View>
          <AppText weight="bold" size={21} style={{ marginTop: 26 }}>
            {t("lock.locked")}
          </AppText>
          <AppText size={14} muted style={{ marginTop: 6 }}>
            {scanning ? t("lock.scanning") : t("lock.unlockFaceId")}
          </AppText>
          {!scanning && (
            <Button
              label={t("lock.useFaceId")}
              icon="faceid"
              variant="soft"
              onPress={unlock}
              height={48}
              style={{ marginTop: 26, paddingHorizontal: 26, alignSelf: "center" }}
            />
          )}
        </View>

        <View
          style={{
            paddingBottom: insets.bottom + 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="lock" size={17} color={theme.colors.textMuted} />
          <AppText size={14} muted onPress={unlock}>
            {t("lock.usePasscode")}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

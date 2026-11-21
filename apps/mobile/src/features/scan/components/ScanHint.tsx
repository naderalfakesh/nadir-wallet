import React, { useEffect } from "react";
import { AccessibilityInfo, Platform, StyleSheet, View } from "react-native";
import { AppText } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/theme";
import type { ScanFeedback } from "../scanBridge";

interface ScanHintProps {
  bottomInset: number;
  found: boolean;
  rejection: ScanFeedback | null;
}

export function ScanHint({ bottomInset, found, rejection }: ScanHintProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const showRejection = !found && rejection !== null;
  const rejectionText = showRejection ? t(`scan.reject.${rejection}`) : null;

  // `accessibilityLiveRegion` is Android-only; VoiceOver needs an explicit announcement.
  useEffect(() => {
    if (Platform.OS === "ios" && rejectionText) {
      AccessibilityInfo.announceForAccessibility(rejectionText);
    }
  }, [rejectionText]);

  return (
    <View style={[styles.bottom, { paddingBottom: bottomInset + 24 }]}>
      <AppText
        weight="semibold"
        size={15}
        color={showRejection ? colors.warn : "#FFFFFF"}
        style={styles.hint}
        accessibilityLiveRegion="polite"
      >
        {found ? t("scan.found") : (rejectionText ?? t("scan.hint"))}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
  },
  hint: {
    textAlign: "center",
  },
});

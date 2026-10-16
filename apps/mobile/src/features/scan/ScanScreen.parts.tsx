import React, { useEffect } from "react";
import { AccessibilityInfo, Platform, Pressable, View, type ViewStyle } from "react-native";
import { AppText, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { scanStyles as styles } from "./ScanScreen.styles";
import type { ScanFeedback } from "./scanBridge";

export function ScanHeader({ topInset, onCancel }: { topInset: number; onCancel: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={[styles.header, { top: topInset + 8 }]}>
      <Pressable
        onPress={onCancel}
        style={styles.close}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t("common.actions.close")}
      >
        <Icon name="close" size={20} color="#FFFFFF" />
      </Pressable>
      <View style={styles.pill}>
        <AppText weight="semibold" size={12.5} color="#FFFFFF">
          {t("scan.title")}
        </AppText>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

type CornerPosition = "tl" | "tr" | "bl" | "br";

const CORNER_EDGES: Record<CornerPosition, ViewStyle> = {
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 },
};

function Corner({ position, color }: { position: CornerPosition; color: string }) {
  return <View style={[styles.corner, { borderColor: color }, CORNER_EDGES[position]]} />;
}

export function ScanReticle({ found }: { found: boolean }) {
  const { colors } = useTheme();
  const cornerColor = found ? colors.pos : colors.accent;

  return (
    <View style={styles.reticleWrap} pointerEvents="none">
      <View style={[styles.reticle, { borderColor: found ? colors.pos : "#FFFFFF" }]}>
        <Corner position="tl" color={cornerColor} />
        <Corner position="tr" color={cornerColor} />
        <Corner position="bl" color={cornerColor} />
        <Corner position="br" color={cornerColor} />
      </View>
    </View>
  );
}

export function ScanHint({
  bottomInset,
  found,
  rejection,
}: {
  bottomInset: number;
  found: boolean;
  rejection: ScanFeedback | null;
}) {
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

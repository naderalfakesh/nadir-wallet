import React from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { AppText, Button, Icon } from "@/components";
import { alpha, useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { scanStyles as styles } from "./ScanScreen.styles";

export function PermissionPanel({ onRequestPermission }: { onRequestPermission: () => void }) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.permission}>
      <Icon name="scan" size={36} color={colors.accent} />
      <AppText weight="bold" size={18} color="#FFFFFF" style={styles.permissionTitle}>
        {t("scan.permissionTitle")}
      </AppText>
      <AppText size={13.5} color={alpha("#FFFFFF", 0.7)} style={styles.permissionBody}>
        {t("scan.permissionBody")}
      </AppText>
      <Button label={t("scan.grant")} onPress={onRequestPermission} style={styles.permissionButton} />
    </View>
  );
}

export function ScanHeader({ topInset, onCancel }: { topInset: number; onCancel: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={[styles.header, { top: topInset + 8 }]}>
      <Pressable onPress={onCancel} style={styles.close} hitSlop={10}>
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

export function ScanHint({ bottomInset, found }: { bottomInset: number; found: boolean }) {
  const { t } = useTranslation();

  return (
    <View style={[styles.bottom, { paddingBottom: bottomInset + 24 }]}>
      <AppText weight="semibold" size={15} color="#FFFFFF" style={styles.hint}>
        {found ? t("scan.found") : t("scan.hint")}
      </AppText>
    </View>
  );
}

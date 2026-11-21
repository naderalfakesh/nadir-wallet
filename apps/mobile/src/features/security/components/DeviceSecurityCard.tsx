import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, Icon, MiniIcon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/theme";
import { DEVICE_CHECK_KEYS } from "../data";

export function DeviceSecurityCard() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Card padding={16}>
      <View style={styles.cardRow}>
        <MiniIcon name="device" tone="pos" />
        <View style={styles.cardRowBody}>
          <AppText weight="bold" size={15}>
            {t("security.device.secure")}
          </AppText>
          <AppText size={12.5} muted style={styles.cardRowSub}>
            {t("security.device.lastChecked")}
          </AppText>
        </View>
      </View>
      <View style={styles.deviceChecks}>
        {DEVICE_CHECK_KEYS.map((key) => (
          <View key={key} style={styles.deviceCheck}>
            <Icon name="checkCircle" size={17} color={colors.pos} />
            <AppText size={12.5} muted>
              {t(`security.device.checks.${key}`)}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  cardRowBody: {
    flex: 1,
  },
  cardRowSub: {
    marginTop: 1,
  },
  deviceChecks: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  deviceCheck: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
});

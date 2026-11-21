import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";
import { Icon, type IconName } from "./Icon";
import { AppText } from "./Text";

type Tone = "warn" | "neg" | "info";

interface NoticeAction {
  label: string;
  icon?: IconName;
  onPress?: () => void;
}

interface StatusNoticeProps {
  tone?: Tone;
  icon?: IconName;
  title: string;
  detail?: string;
  actions?: NoticeAction[];
}

export function StatusNotice({
  tone = "warn",
  icon = "info",
  title,
  detail,
  actions,
}: StatusNoticeProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const c = tone === "neg" ? colors.neg : tone === "info" ? colors.accent : colors.warn;

  return (
    <View
      style={[styles.container, { backgroundColor: alpha(c, 0.12), borderColor: alpha(c, 0.28) }]}
    >
      <View style={styles.header}>
        <Icon name={icon} size={20} color={c} />
        <View style={styles.body}>
          <AppText weight="bold" size={13.5}>
            {title}
          </AppText>
          {detail && (
            <AppText size={12} muted style={styles.detail}>
              {detail}
            </AppText>
          )}
        </View>
      </View>
      {actions && actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((a, i) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={a.onPress}
              style={[
                styles.action,
                { backgroundColor: i === 0 ? alpha(c, 0.2) : colors.surface2 },
              ]}
            >
              {a.icon && <Icon name={a.icon} size={15} color={i === 0 ? c : colors.text} />}
              <AppText weight="semibold" size={13} color={i === 0 ? c : colors.text}>
                {a.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: 13,
      borderRadius: 14,
      borderWidth: 1,
    },
    header: { flexDirection: "row", gap: 11 },
    body: { flex: 1, minWidth: 0 },
    detail: { marginTop: 2, lineHeight: 17 },
    actions: { flexDirection: "row", gap: 8, marginTop: 11 },
    action: {
      height: 34,
      paddingHorizontal: 14,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
  });

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import type { HomeQuickAction } from "../home.types";

interface QuickActionsProps {
  actions: HomeQuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.quickActions}>
      {actions.map((action) => (
        <Pressable key={action.icon} onPress={action.onPress} style={styles.quickAction}>
          <View
            style={[
              styles.quickActionIcon,
              action.primary ? styles.primaryActionIcon : styles.secondaryActionIcon,
              action.primary && theme.shadows.accentGlow,
            ]}
          >
            <Icon
              name={action.icon}
              size={25}
              stroke={2.2}
              color={action.primary ? theme.colors.accentInk : theme.colors.text}
            />
          </View>
          <AppText weight="semibold" size={12.5} muted>
            {action.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    quickActions: {
      flexDirection: "row",
      gap: 6,
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 20,
      paddingBottom: 4,
    },
    quickAction: {
      flex: 1,
      alignItems: "center",
      gap: 8,
    },
    quickActionIcon: {
      width: 58,
      height: 58,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryActionIcon: {
      backgroundColor: theme.colors.surface2,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    primaryActionIcon: {
      backgroundColor: theme.colors.accent,
    },
  });

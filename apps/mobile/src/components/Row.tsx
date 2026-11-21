import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { Icon } from "./Icon";
import { AppText } from "./Text";

interface RowProps {
  left?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  rightSub?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  last?: boolean;
}

export function Row({ left, title, sub, right, rightSub, onPress, chevron, last }: RowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const content = (
    <View style={[styles.container, { borderBottomWidth: last ? 0 : 1 }]}>
      {left}
      <View style={styles.main}>
        {typeof title === "string" ? (
          <AppText weight="semibold" size={16} numberOfLines={1}>
            {title}
          </AppText>
        ) : (
          title
        )}
        {sub != null &&
          (typeof sub === "string" ? (
            <AppText size={13} muted style={styles.subSpacing}>
              {sub}
            </AppText>
          ) : (
            <View style={styles.subSpacing}>{sub}</View>
          ))}
      </View>
      {(right != null || rightSub != null) && (
        <View style={styles.trailing}>
          {right != null &&
            (typeof right === "string" ? (
              <AppText weight="semibold" size={15.5} tnum numberOfLines={1}>
                {right}
              </AppText>
            ) : (
              right
            ))}
          {rightSub != null &&
            (typeof rightSub === "string" ? (
              <AppText size={13} muted tnum numberOfLines={1} style={styles.subSpacing}>
                {rightSub}
              </AppText>
            ) : (
              <View style={styles.subSpacing}>{rightSub}</View>
            ))}
        </View>
      )}
      {chevron && <Icon name="chevronR" size={18} color={theme.colors.textFaint} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => pressed && styles.pressed}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      paddingVertical: 13,
      borderBottomColor: theme.colors.hairline,
    },
    main: { flex: 1, minWidth: 0 },
    trailing: { alignItems: "flex-end" },
    subSpacing: { marginTop: 2 },
    pressed: { opacity: 0.6 },
  });

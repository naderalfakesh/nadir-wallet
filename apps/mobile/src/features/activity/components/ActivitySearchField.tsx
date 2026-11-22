import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface ActivitySearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
}

export function ActivitySearchField({ value, onChangeText }: ActivitySearchFieldProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <Icon name="search" size={18} color={theme.colors.textFaint} />
      <TextInput
        testID="activity-search"
        value={value}
        onChangeText={onChangeText}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        returnKeyType="search"
        placeholder={t("activity.search.placeholder")}
        placeholderTextColor={theme.colors.textFaint}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("activity.search.clear")}
        >
          <Icon name="close" size={16} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: theme.spacing.pad,
      marginBottom: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      backgroundColor: theme.colors.surface,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontFamily: theme.font.regular,
      fontSize: 15,
      paddingVertical: 12,
    },
  });

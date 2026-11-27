import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components";
import { useThemedStyles, type Theme } from "@/theme";

interface WordSuggestionsProps {
  suggestions: string[];
  onSelect: (word: string) => void;
}

export function WordSuggestions({ suggestions, onSelect }: WordSuggestionsProps) {
  const styles = useThemedStyles(createStyles);

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.suggestions}>
      {suggestions.map((word) => (
        <Pressable
          key={word}
          accessibilityRole="button"
          onPress={() => onSelect(word)}
          style={styles.suggestion}
        >
          <AppText mono size={13}>
            {word}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    suggestion: {
      backgroundColor: theme.colors.surface2,
      borderRadius: theme.radius.chip,
      padding: 10,
    },
  });

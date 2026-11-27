import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Screen, ScreenHeader } from "@/components";
import { useThemedStyles, type Theme } from "@/theme";

interface SeedStepFrameProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function SeedStepFrame({ title, subtitle, onBack, children }: SeedStepFrameProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Screen>
      <ScreenHeader title={title} subtitle={subtitle} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
    },
  });

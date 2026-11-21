import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Button, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";

interface SeedGridProps {
  words: string[];
}

function SeedGrid({ words }: SeedGridProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.grid}>
      {words.map((w, i) => (
        <View key={`${w}-${i}`} style={styles.cell}>
          <AppText weight="semibold" size={12.5} faint tnum style={styles.index}>
            {i + 1}
          </AppText>
          <AppText mono weight="semibold" size={14.5}>
            {w}
          </AppText>
        </View>
      ))}
    </View>
  );
}

interface SeedRevealProps {
  words: string[];
  onContinue: () => void;
  ctaLabel: string;
}

export function SeedReveal({ words, onContinue, ctaLabel }: SeedRevealProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  return (
    <View>
      <View style={styles.warning}>
        <Icon name="alert" size={20} color={theme.colors.warn} />
        <AppText size={12.5} muted style={styles.warningText}>
          {t("onboarding.reveal.warning")}
        </AppText>
      </View>

      <View>
        <SeedGrid words={revealed ? words : words.map(() => "••••••")} />
        {!revealed && (
          <Pressable onPress={() => setRevealed(true)} style={styles.cover}>
            <Icon name="eye" size={26} />
            <AppText weight="bold" size={14}>
              {t("onboarding.reveal.tapToReveal")}
            </AppText>
          </Pressable>
        )}
      </View>

      <Button label={ctaLabel} disabled={!revealed} onPress={onContinue} style={styles.cta} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    cell: {
      width: "47.8%",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      borderRadius: 13,
    },
    index: { width: 16, textAlign: "right" },
    warning: {
      flexDirection: "row",
      gap: 11,
      padding: 14,
      borderRadius: 16,
      marginBottom: 16,
      backgroundColor: alpha(theme.colors.warn, 0.11),
      borderWidth: 1,
      borderColor: alpha(theme.colors.warn, 0.26),
    },
    warningText: { flex: 1, lineHeight: 19 },
    cover: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 14,
      backgroundColor: alpha(theme.colors.bg, 0.7),
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    cta: { marginTop: 18 },
  });

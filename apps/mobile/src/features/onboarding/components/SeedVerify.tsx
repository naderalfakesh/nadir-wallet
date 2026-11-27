import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components";
import { useTimeout } from "@/hooks";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";
import { buildSeedQuizRounds } from "../seedQuiz";

const WRONG_FLASH_MS = 600;

interface SeedVerifyProps {
  words: string[];
  onContinue: () => void;
}

export function SeedVerify({ words, onContinue }: SeedVerifyProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { schedule, cancel } = useTimeout();

  const rounds = useMemo(() => buildSeedQuizRounds(words), [words]);
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const current = rounds[round];

  if (!current) return null;

  const pick = (opt: string) => {
    if (opt === current.correct) {
      cancel();
      setWrong(null);
      if (round + 1 >= rounds.length) onContinue();
      else setRound(round + 1);
    } else {
      setWrong(opt);
      schedule(() => setWrong(null), WRONG_FLASH_MS);
    }
  };

  return (
    <View>
      <View style={styles.progress}>
        {rounds.map((r, i) => (
          <View
            key={r.pos}
            style={[
              styles.progressBar,
              { backgroundColor: i <= round ? theme.colors.accent : theme.colors.surface3 },
            ]}
          />
        ))}
      </View>
      <AppText weight="semibold" size={13} muted>
        {t("onboarding.verify.confirmWord")}
      </AppText>
      <AppText weight="bold" size={28} style={styles.prompt}>
        {t("onboarding.verify.prompt", { n: current.pos + 1 })}
      </AppText>
      <View style={styles.options}>
        {current.options.map((opt) => {
          const isWrong = wrong === opt;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              onPress={() => pick(opt)}
              style={[
                styles.option,
                {
                  backgroundColor: isWrong ? alpha(theme.colors.neg, 0.18) : theme.colors.surface,
                  borderColor: isWrong ? theme.colors.neg : theme.colors.hairline,
                },
              ]}
            >
              <AppText mono weight="semibold" size={16}>
                {opt}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    progress: { flexDirection: "row", gap: 5, marginBottom: 22 },
    progressBar: { flex: 1, height: 3, borderRadius: 9 },
    prompt: { marginTop: 4, marginBottom: 24 },
    options: { gap: 10 },
    option: {
      height: 56,
      borderRadius: theme.radius.btn,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
  });

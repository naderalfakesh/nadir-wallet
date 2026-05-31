import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { AppText, Button, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";

function SeedGrid({ words }: { words: string[] }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {words.map((w, i) => (
        <View
          key={`${w}-${i}`}
          style={{
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
          }}
        >
          <AppText weight="semibold" size={12.5} faint tnum style={{ width: 16, textAlign: "right" }}>
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

export function SeedReveal({
  words,
  onContinue,
  ctaLabel,
}: {
  words: string[];
  onContinue: () => void;
  ctaLabel: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: 11,
          padding: 14,
          borderRadius: 16,
          marginBottom: 16,
          backgroundColor: alpha(theme.colors.warn, 0.11),
          borderWidth: 1,
          borderColor: alpha(theme.colors.warn, 0.26),
        }}
      >
        <Icon name="alert" size={20} color={theme.colors.warn} />
        <AppText size={12.5} muted style={{ flex: 1, lineHeight: 19 }}>
          {t("onboarding.reveal.warning")}
        </AppText>
      </View>

      <View>
        <SeedGrid words={words} />
        {!revealed && (
          <Pressable
            onPress={() => setRevealed(true)}
            style={{
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
            }}
          >
            <Icon name="eye" size={26} />
            <AppText weight="bold" size={14}>
              {t("onboarding.reveal.tapToReveal")}
            </AppText>
          </Pressable>
        )}
      </View>

      {revealed && (
        <Pressable
          onPress={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, height: 44, marginTop: 8 }}
        >
          <Icon name={copied ? "check" : "copy"} size={18} color={theme.colors.accent} />
          <AppText weight="semibold" size={14} color={theme.colors.accent}>
            {copied ? t("onboarding.reveal.copied") : t("onboarding.reveal.copy")}
          </AppText>
        </Pressable>
      )}

      <Button label={ctaLabel} disabled={!revealed} onPress={onContinue} style={{ marginTop: revealed ? 6 : 18 }} />
    </View>
  );
}

const QUIZ_POSITIONS = [2, 6, 9];

export function SeedVerify({ words, onContinue }: { words: string[]; onContinue: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();

  // Deterministic distractors and ordering keep render pure (no Math.random),
  // while still placing the correct answer in a different slot each round.
  const rounds = useMemo(
    () =>
      QUIZ_POSITIONS.map((pos) => {
        const correct = words[pos];
        const opts = [correct, words[(pos + 4) % words.length], words[(pos + 7) % words.length]];
        const rot = pos % 3;
        return { pos, correct, options: [...opts.slice(rot), ...opts.slice(0, rot)] };
      }),
    [words],
  );

  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const current = rounds[round];

  const pick = (opt: string) => {
    if (opt === current.correct) {
      setWrong(null);
      if (round + 1 >= rounds.length) onContinue();
      else setRound(round + 1);
    } else {
      setWrong(opt);
      setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 5, marginBottom: 22 }}>
        {rounds.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 9,
              backgroundColor: i <= round ? theme.colors.accent : theme.colors.surface3,
            }}
          />
        ))}
      </View>
      <AppText weight="semibold" size={13} muted>
        {t("onboarding.verify.confirmWord")}
      </AppText>
      <AppText weight="bold" size={28} style={{ marginTop: 4, marginBottom: 24 }}>
        {t("onboarding.verify.prompt", { n: current.pos + 1 })}
      </AppText>
      <View style={{ gap: 10 }}>
        {current.options.map((opt) => {
          const isWrong = wrong === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => pick(opt)}
              style={{
                height: 56,
                borderRadius: theme.radius.btn,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isWrong ? alpha(theme.colors.neg, 0.18) : theme.colors.surface,
                borderWidth: 1,
                borderColor: isWrong ? theme.colors.neg : theme.colors.hairline,
              }}
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

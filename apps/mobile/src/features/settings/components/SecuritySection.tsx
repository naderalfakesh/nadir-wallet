import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Card, MiniIcon, Row, SectionLabel } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useThemedStyles, type Theme } from "@/theme";

export function SecuritySection() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <SectionLabel>{t("settings.security.section")}</SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        <Row
          onPress={() => router.push("/reveal")}
          left={<MiniIcon name="key" />}
          title={t("settings.security.recovery")}
          chevron
          last
        />
      </Card>
    </>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    cardInset: { paddingHorizontal: 16 },
  });

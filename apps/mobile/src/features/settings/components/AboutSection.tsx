import React from "react";
import { StyleSheet } from "react-native";
import { Card, MiniIcon, Row, SectionLabel } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useThemedStyles, type Theme } from "@/theme";

export function AboutSection() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <>
      <SectionLabel>{t("settings.about.section")}</SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        <Row
          left={<MiniIcon name="globe" />}
          title={t("settings.about.version")}
          right="v1.0.0"
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

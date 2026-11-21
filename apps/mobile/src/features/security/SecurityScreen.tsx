import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  Row,
  MiniIcon,
  Toggle,
  SectionLabel,
} from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp, useSecurityEvents } from "@/providers/AppProvider";
import { useSheets } from "@/providers/SheetProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { DeviceSecurityCard } from "./components/DeviceSecurityCard";
import { ScoreCard } from "./components/ScoreCard";
import { SecurityEventRow } from "./components/SecurityEventRow";
import { SecurityModelCard } from "./components/SecurityModelCard";
import { TxProtectionCard } from "./components/TxProtectionCard";
import { eventWhen } from "./events";
import { useSecurityChecklist } from "./useSecurityChecklist";

export function SecurityScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const sheets = useSheets();
  const { prefs, setPref } = useApp();
  const events = useSecurityEvents();
  // Re-read the clock whenever the tab gains focus so "Today" rolls over.
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(useCallback(() => setNow(new Date()), []));
  const styles = useThemedStyles(createStyles);

  const { items, score, total, pct, tier } = useSecurityChecklist();

  return (
    <Screen bottomInset={false}>
      <ScreenHeader title={t("security.title")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.scoreWrap}>
          <ScoreCard
            score={score}
            total={total}
            pct={pct}
            tier={tier}
            backedUp={prefs.backupConfirmed}
          />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.model.title")}</SectionLabel>
          <SecurityModelCard />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.protection.title")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            {items.map((it, i) => (
              <Row
                key={it.key}
                last={i === items.length - 1}
                onPress={it.onPress}
                left={
                  <MiniIcon
                    name={it.done ? "checkCircle" : "alert"}
                    tone={it.done ? "pos" : "warn"}
                  />
                }
                title={it.label}
                sub={it.sub}
                right={
                  it.toggle ? (
                    <Toggle label={it.label} on={it.done} onChange={it.toggle} />
                  ) : it.onPress ? undefined : (
                    <AppText weight="semibold" size={13} color={it.done ? colors.pos : colors.warn}>
                      {it.done ? t("security.protection.on") : t("security.protection.off")}
                    </AppText>
                  )
                }
                chevron={!!it.onPress}
              />
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.stepup.title")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            <Row
              left={<MiniIcon name="faceid" tone="accent" />}
              title={t("security.stepup.revealLabel")}
              sub={t("security.stepup.revealSub")}
              right={
                <Toggle
                  on={prefs.requireLivenessReveal}
                  onChange={() => setPref("requireLivenessReveal", !prefs.requireLivenessReveal)}
                />
              }
            />
            <Row
              last
              left={<MiniIcon name="faceid" tone="accent" />}
              title={t("security.stepup.sendLabel")}
              sub={t("security.stepup.sendSub")}
              right={
                <Toggle
                  on={prefs.requireLivenessSend}
                  onChange={() => setPref("requireLivenessSend", !prefs.requireLivenessSend)}
                />
              }
            />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.device.title")}</SectionLabel>
          <DeviceSecurityCard />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.txProtection.title")}</SectionLabel>
          <TxProtectionCard
            on={prefs.txProtection}
            onToggle={() => setPref("txProtection", !prefs.txProtection)}
          />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.events.title")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            {events.map((ev, i) => (
              <SecurityEventRow
                key={ev.id}
                event={{ ...ev, when: eventWhen(ev, now) }}
                last={i === events.length - 1}
              />
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.advanced.title")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            <Row
              onPress={() => router.push("/liveness")}
              left={<MiniIcon name="faceid" />}
              title={t("security.advanced.liveness")}
              sub={t("security.advanced.livenessSub")}
              chevron
            />
            <Row
              onPress={() => router.push("/reveal")}
              left={<MiniIcon name="key" />}
              title={t("security.advanced.reveal")}
              sub={t("security.advanced.revealSub")}
              chevron
            />
            <Row
              onPress={() => sheets.open("soon", { title: t("security.advanced.connected") })}
              left={<MiniIcon name="link" />}
              title={t("security.advanced.connected")}
              sub={t("security.advanced.connectedSub")}
              chevron
            />
            <Row
              onPress={() => router.push("/change-passcode")}
              left={<MiniIcon name="lock" />}
              title={t("security.advanced.changePin")}
              chevron
              last
            />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      paddingBottom: 24,
    },
    scoreWrap: {
      paddingHorizontal: theme.spacing.pad,
    },
    section: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 18,
    },
    cardInset: {
      paddingHorizontal: 16,
    },
  });

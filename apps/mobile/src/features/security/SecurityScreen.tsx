import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  Row,
  MiniIcon,
  Toggle,
  SectionLabel,
  SecurityEventRow,
} from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useApp } from "@/providers/AppProvider";
import { useSecurityChecklist } from "./useSecurityChecklist";
import { eventWhen } from "./events";
import { createSecurityStyles } from "./SecurityScreen.styles";
import { DeviceSecurityCard, ScoreCard, SecurityModelCard, TxProtectionCard } from "./SecurityScreen.parts";

export function SecurityScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const router = useRouter();
  const sheets = useSheets();
  const { prefs, setPref, events } = useApp();
  const now = new Date();
  const [txProtection, setTxProtection] = useState(true);
  const styles = useMemo(() => createSecurityStyles(theme), [theme]);

  const { items, score, total, pct, tier } = useSecurityChecklist();

  return (
    <Screen>
      <ScreenHeader title={t("security.title")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: theme.spacing.pad }}>
          <ScoreCard score={score} total={total} pct={pct} tier={tier} backedUp={prefs.backupConfirmed} />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.model.title")}</SectionLabel>
          <SecurityModelCard />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.protection.title")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            {items.map((it, i) => (
              <Row
                key={it.key}
                last={i === items.length - 1}
                onPress={it.onPress}
                left={<MiniIcon name={it.done ? "checkCircle" : "alert"} tone={it.done ? "pos" : "warn"} />}
                title={it.label}
                sub={it.sub}
                right={
                  it.toggle ? (
                    <Toggle on={it.done} onChange={it.toggle} />
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
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
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
          <TxProtectionCard on={txProtection} onToggle={() => setTxProtection((v) => !v)} />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.events.title")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
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
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            <Row onPress={() => router.push("/liveness")} left={<MiniIcon name="faceid" />} title={t("security.advanced.liveness")} sub={t("security.advanced.livenessSub")} chevron />
            <Row
              onPress={() => router.push("/reveal")}
              left={<MiniIcon name="key" />}
              title={t("security.advanced.reveal")}
              sub={t("security.advanced.revealSub")}
              chevron
            />
            <Row onPress={() => sheets.open("soon", { title: t("security.advanced.connected") })} left={<MiniIcon name="link" />} title={t("security.advanced.connected")} sub={t("security.advanced.connectedSub")} chevron />
            <Row onPress={() => router.push("/change-passcode")} left={<MiniIcon name="lock" />} title={t("security.advanced.changePin")} chevron last />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

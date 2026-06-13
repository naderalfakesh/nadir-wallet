import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  Row,
  Icon,
  type IconName,
  MiniIcon,
  Toggle,
  SectionLabel,
  SecurityEventRow,
} from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useApp } from "@/providers/AppProvider";
import { DEVICE_CHECK_KEYS } from "./data";

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;
const AUTO_LOCK_OPTIONS = [1, 5, 15];

export function SecurityScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const router = useRouter();
  const sheets = useSheets();
  const { prefs, setPref, events, logEvent } = useApp();
  const [txProtection, setTxProtection] = useState(true);

  const toggleBiometric = () => {
    const next = !prefs.biometricEnabled;
    setPref("biometricEnabled", next);
    logEvent(next ? "biometric_on" : "biometric_off");
  };

  const cycleAutoLock = () => {
    const idx = AUTO_LOCK_OPTIONS.indexOf(prefs.autoLockMinutes);
    const next = AUTO_LOCK_OPTIONS[(idx + 1) % AUTO_LOCK_OPTIONS.length];
    setPref("autoLockMinutes", next);
    logEvent("autolock", { detailVars: { min: next } });
  };

  type Item = {
    key: string;
    label: string;
    done: boolean;
    sub: string;
    onPress?: () => void;
    toggle?: () => void;
    cycle?: boolean;
  };
  const items: Item[] = [
    {
      key: "backup",
      label: t("security.protection.backup"),
      done: prefs.backupConfirmed,
      sub: prefs.backupConfirmed ? t("security.protection.backupDone") : t("security.protection.backupTodo"),
      onPress: () => router.push("/backup"),
    },
    { key: "bio", label: t("security.protection.biometric"), done: prefs.biometricEnabled, sub: t("security.protection.biometricSub"), toggle: toggleBiometric },
    { key: "pin", label: t("security.protection.pin"), done: true, sub: t("security.protection.pinSub") },
    { key: "autolock", label: t("security.protection.autolock"), done: true, sub: t("security.protection.autolockSub", { min: prefs.autoLockMinutes }), onPress: cycleAutoLock, cycle: true },
    { key: "signing", label: t("security.protection.signing"), done: true, sub: t("security.protection.signingSub") },
  ];
  const score = items.filter((i) => i.done).length;
  const pct = score / items.length;
  const tier =
    pct >= 1
      ? { c: colors.pos, label: t("security.score.excellent") }
      : pct >= 0.7
        ? { c: colors.warn, label: t("security.score.actionNeeded") }
        : { c: colors.neg, label: t("security.score.atRisk") };

  const modelRows: { icon: IconName; title: string; body: string }[] = [
    { icon: "key", title: t("security.model.keysTitle"), body: t("security.model.keysBody") },
    { icon: "faceid", title: t("security.model.signTitle"), body: t("security.model.signBody") },
    { icon: "globe", title: t("security.model.backendTitle"), body: t("security.model.backendBody") },
  ];

  const riskLevels: { color: string; label: string; body: string }[] = [
    { color: colors.pos, label: t("security.txProtection.low"), body: t("security.txProtection.lowBody") },
    { color: colors.warn, label: t("security.txProtection.caution"), body: t("security.txProtection.cautionBody") },
    { color: colors.neg, label: t("security.txProtection.high"), body: t("security.txProtection.highBody") },
  ];

  const section = { paddingHorizontal: theme.spacing.pad, paddingTop: 18 } as const;

  return (
    <Screen>
      <ScreenHeader title={t("security.title")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* score */}
        <View style={{ paddingHorizontal: theme.spacing.pad }}>
          <Card padding={20}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <View style={{ width: 116, height: 116 }}>
                <Svg width={116} height={116} viewBox="0 0 116 116">
                  <Circle cx={58} cy={58} r={RING_R} fill="none" stroke={colors.surface3} strokeWidth={9} />
                  <Circle
                    cx={58}
                    cy={58}
                    r={RING_R}
                    fill="none"
                    stroke={tier.c}
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - pct)}
                    rotation={-90}
                    origin="58, 58"
                  />
                </Svg>
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
                  <AppText weight="bold" size={30} tnum>
                    {score}
                    <AppText size={16} faint>
                      /{items.length}
                    </AppText>
                  </AppText>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <AppText weight="semibold" size={12.5} muted>
                  {t("security.score.label")}
                </AppText>
                <AppText weight="bold" size={21} color={tier.c} style={{ marginVertical: 2 }}>
                  {tier.label}
                </AppText>
                <AppText size={13} muted style={{ lineHeight: 18 }}>
                  {prefs.backupConfirmed ? t("security.score.protected") : t("security.score.finishBackup")}
                </AppText>
              </View>
            </View>
          </Card>
        </View>

        {/* security model */}
        <View style={section}>
          <SectionLabel>{t("security.model.title")}</SectionLabel>
          <Card padding={16}>
            <View style={{ gap: 13 }}>
              {modelRows.map((r) => (
                <View key={r.title} style={{ flexDirection: "row", gap: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      backgroundColor: colors.accentDim,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={r.icon} size={19} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText weight="bold" size={14}>
                      {r.title}
                    </AppText>
                    <AppText size={12.5} muted style={{ lineHeight: 18, marginTop: 2 }}>
                      {r.body}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* protection checklist */}
        <View style={section}>
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

        {/* step-up verification */}
        <View style={section}>
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

        {/* device security */}
        <View style={section}>
          <SectionLabel>{t("security.device.title")}</SectionLabel>
          <Card padding={16}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
              <MiniIcon name="device" tone="pos" />
              <View style={{ flex: 1 }}>
                <AppText weight="bold" size={15}>
                  {t("security.device.secure")}
                </AppText>
                <AppText size={12.5} muted style={{ marginTop: 1 }}>
                  {t("security.device.lastChecked")}
                </AppText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 16 }}>
              {DEVICE_CHECK_KEYS.map((key) => (
                <View
                  key={key}
                  style={{ width: "50%", flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5 }}
                >
                  <Icon name="checkCircle" size={17} color={colors.pos} />
                  <AppText size={12.5} muted>
                    {t(`security.device.checks.${key}`)}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* transaction protection */}
        <View style={section}>
          <SectionLabel>{t("security.txProtection.title")}</SectionLabel>
          <Card padding={16}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
              <MiniIcon name="radar" tone="accent" />
              <View style={{ flex: 1 }}>
                <AppText weight="bold" size={15}>
                  {t("security.txProtection.heading")}
                </AppText>
                <AppText size={12.5} muted style={{ marginTop: 1 }}>
                  {t("security.txProtection.sub")}
                </AppText>
              </View>
              <Toggle
                on={txProtection}
                onChange={() => setTxProtection((v) => !v)}
              />
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline, marginTop: 14, paddingTop: 14, gap: 9 }}>
              <AppText weight="bold" size={11.5} faint style={{ letterSpacing: 0.3 }}>
                {t("security.txProtection.riskLevels")}
              </AppText>
              {riskLevels.map((r) => (
                <View key={r.label} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                  <View
                    style={{
                      width: 64,
                      paddingVertical: 3,
                      borderRadius: 7,
                      backgroundColor: alpha(r.color, 0.14),
                      alignItems: "center",
                    }}
                  >
                    <AppText weight="bold" size={11.5} color={r.color}>
                      {r.label}
                    </AppText>
                  </View>
                  <AppText size={12.5} muted style={{ flex: 1, lineHeight: 17 }}>
                    {r.body}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* recent security activity */}
        <View style={section}>
          <SectionLabel>{t("security.events.title")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            {events.map((ev, i) => (
              <SecurityEventRow key={ev.id} event={ev} last={i === events.length - 1} />
            ))}
          </Card>
        </View>

        {/* advanced */}
        <View style={section}>
          <SectionLabel>{t("security.advanced.title")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            <Row onPress={() => router.push("/liveness")} left={<MiniIcon name="faceid" />} title={t("security.advanced.liveness")} sub={t("security.advanced.livenessSub")} chevron />
            <Row
              onPress={() => router.push(prefs.requireLivenessReveal ? "/liveness?next=/reveal" : "/reveal")}
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

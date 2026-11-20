import React, { useMemo } from "react";
import { View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme } from "@/theme";
import { fmtToken } from "@/utils/format";
import type { DemoToken } from "@/features/wallet/data";
import { createSendStyles } from "./SendScreen.styles";
import type { SimulationStatus } from "./send.types";

interface FooterButtonProps {
  children: React.ReactNode;
}

export function FooterButton({ children }: FooterButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);

  return (
    <View style={styles.footer}>
      {children}
    </View>
  );
}

export function OfflineRiskNote({ text }: { text: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);

  return (
    <View style={styles.offlineNote}>
      <Icon name="wifiOff" size={17} color={theme.colors.textFaint} />
      <AppText size={12.5} muted style={styles.offlineText}>
        {text}
      </AppText>
    </View>
  );
}

interface RecipientIconProps {
  flagged?: boolean;
}

export function RecipientIcon({ flagged }: RecipientIconProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const color = flagged ? theme.colors.neg : theme.colors.textMuted;
  const backgroundColor = flagged ? alpha(theme.colors.neg, 0.16) : theme.colors.surface3;

  return (
    <View style={[styles.recipientIcon, { backgroundColor }]}>
      <Icon name={flagged ? "shield" : "user"} size={20} color={color} />
    </View>
  );
}

interface SimulationCardProps {
  status: SimulationStatus;
  token: DemoToken;
  balanceAfter: number;
  fee: string | null;
  loading: boolean;
  warnings?: string[];
}

export function SimulationCard({
  status,
  token,
  balanceAfter,
  fee,
  loading,
  warnings = [],
}: SimulationCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const { t } = useTranslation();
  const tone =
    status === "failed" ? theme.colors.neg : status === "unavailable" ? theme.colors.textFaint : theme.colors.pos;
  const pill =
    loading ? t("send.sim.loading") : status === "failed" ? t("send.sim.failed") : status === "unavailable" ? t("send.sim.unavailable") : t("send.sim.passed");
  const icon = loading ? "refresh" : status === "failed" ? "alert" : status === "unavailable" ? "wifiOff" : "checkCircle";

  const rows: [string, string][] = [
    [t("send.sim.estFee"), fee ?? t("send.sim.unavailable")],
    [t("send.sim.balanceAfter"), fmtToken(balanceAfter, token.symbol)],
    [t("send.sim.contract"), t("send.sim.contractNone")],
  ];

  return (
    <View style={[styles.simulationCard, { borderColor: alpha(tone, 0.26) }]}>
      <View style={styles.simulationHeader}>
        <Icon name={icon} size={19} color={tone} />
        <AppText weight="bold" size={14} style={styles.simulationTitle}>
          {t("send.sim.title")}
        </AppText>
        <View style={[styles.simulationPill, { backgroundColor: alpha(tone, 0.15) }]}>
          <AppText weight="bold" size={11.5} color={tone}>
            {pill}
          </AppText>
        </View>
      </View>
      {loading ? null : status === "failed" ? (
        <AppText size={12.5} muted style={styles.simulationBody}>
          {t("send.sim.failedBody")}
        </AppText>
      ) : status === "unavailable" ? (
        <AppText size={12.5} muted style={styles.simulationBody}>
          {t("send.sim.unavailableBody")}
        </AppText>
      ) : (
        <View style={styles.simulationRows}>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.simulationRow}>
              <AppText size={12.5} muted>
                {label}
              </AppText>
              <AppText size={12.5} tnum>
                {value}
              </AppText>
            </View>
          ))}
        </View>
      )}
      {warnings.map((warning, index) => (
        <AppText key={`${index}-${warning}`} size={12.5} muted style={styles.simulationBody}>
          {warning}
        </AppText>
      ))}
      <View style={styles.simulationNote}>
        <AppText faint size={11} style={styles.simulationNoteText}>
          {t("send.sim.note")}
        </AppText>
      </View>
    </View>
  );
}

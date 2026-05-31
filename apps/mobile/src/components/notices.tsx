import React from "react";
import { Pressable, View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { t } from "@/i18n";
import type { BackendStatus, PriceStatus, SecurityEvent } from "@/types/status";
import { AppText } from "./Text";
import { Icon, type IconName } from "./Icon";

type Tone = "warn" | "neg" | "info";

interface NoticeAction {
  label: string;
  icon?: IconName;
  onPress?: () => void;
}

export function StatusNotice({
  tone = "warn",
  icon = "info",
  title,
  detail,
  actions,
}: {
  tone?: Tone;
  icon?: IconName;
  title: string;
  detail?: string;
  actions?: NoticeAction[];
}) {
  const { colors } = useTheme();
  const c = tone === "neg" ? colors.neg : tone === "info" ? colors.accent : colors.warn;

  return (
    <View
      style={{
        padding: 13,
        borderRadius: 14,
        backgroundColor: alpha(c, 0.12),
        borderWidth: 1,
        borderColor: alpha(c, 0.28),
      }}
    >
      <View style={{ flexDirection: "row", gap: 11 }}>
        <Icon name={icon} size={20} color={c} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText weight="bold" size={13.5}>
            {title}
          </AppText>
          {detail && (
            <AppText size={12} muted style={{ marginTop: 2, lineHeight: 17 }}>
              {detail}
            </AppText>
          )}
        </View>
      </View>
      {actions && actions.length > 0 && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 11 }}>
          {actions.map((a, i) => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              style={{
                height: 34,
                paddingHorizontal: 14,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: i === 0 ? alpha(c, 0.2) : colors.surface2,
              }}
            >
              {a.icon && <Icon name={a.icon} size={15} color={i === 0 ? c : colors.text} />}
              <AppText weight="semibold" size={13} color={i === 0 ? c : colors.text}>
                {a.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function BackendNotice({
  status,
  onRetry,
}: {
  status: BackendStatus;
  onRetry?: () => void;
}) {
  if (status === "api_unavailable") {
    return (
      <StatusNotice
        tone="warn"
        icon="wifiOff"
        title={t("status.backend.apiTitle")}
        detail={t("status.backend.apiBody")}
        actions={[
          { label: t("status.backend.retry"), icon: "refresh", onPress: onRetry },
          { label: t("status.backend.demoMode"), onPress: onRetry },
        ]}
      />
    );
  }
  if (status === "rpc_unavailable") {
    return (
      <StatusNotice
        tone="warn"
        icon="globe"
        title={t("status.backend.rpcTitle")}
        detail={t("status.backend.rpcBody")}
        actions={[
          { label: t("status.backend.retry"), icon: "refresh", onPress: onRetry },
          { label: t("status.backend.viewCached"), onPress: onRetry },
        ]}
      />
    );
  }
  return null;
}

export function PriceFreshness({
  status = "fresh",
  onRetry,
}: {
  status?: PriceStatus;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();

  if (status === "unavailable") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
        <Icon name="alert" size={14} color={colors.neg} />
        <AppText weight="semibold" size={11.5} color={colors.neg}>
          {t("status.price.unavailable")}
        </AppText>
        {onRetry && (
          <Pressable onPress={onRetry}>
            <AppText weight="semibold" size={11.5} color={colors.accent}>
              {t("status.backend.retry")}
            </AppText>
          </Pressable>
        )}
      </View>
    );
  }

  const stale = status === "stale";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: stale ? colors.warn : colors.pos }}
      />
      <AppText
        weight={stale ? "semibold" : "regular"}
        size={11.5}
        color={stale ? colors.warn : colors.textFaint}
      >
        {t(`status.price.${status}`)}
      </AppText>
    </View>
  );
}

export function TrustNote({ children, icon = "lock" }: { children: string; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 9, paddingHorizontal: 2 }}>
      <Icon name={icon} size={15} color={colors.textFaint} />
      <AppText faint size={11.5} style={{ flex: 1, lineHeight: 17 }}>
        {children}
      </AppText>
    </View>
  );
}

const severityTone: Record<SecurityEvent["severity"], { key: "textMuted" | "pos" | "warn" | "neg"; icon: IconName }> = {
  info: { key: "textMuted", icon: "clock" },
  success: { key: "pos", icon: "checkCircle" },
  warning: { key: "warn", icon: "alert" },
  critical: { key: "neg", icon: "shield" },
};

export function SecurityEventRow({ event, last }: { event: SecurityEvent; last?: boolean }) {
  const { colors } = useTheme();
  const tone = severityTone[event.severity];
  const c = colors[tone.key];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.hairline,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: alpha(c, 0.15),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={tone.icon} size={18} color={c} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="semibold" size={14}>
          {event.title}
        </AppText>
        <AppText size={12} muted style={{ marginTop: 1 }}>
          {event.detail}
        </AppText>
      </View>
      <AppText faint size={11.5}>
        {event.when}
      </AppText>
    </View>
  );
}

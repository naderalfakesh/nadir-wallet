import React from "react";
import { View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { AppText } from "./Text";
import { Icon, type IconName } from "./Icon";
import { Button } from "./Button";

type Tone = "muted" | "warn" | "neg";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: Tone;
}

export function EmptyState({ icon, title, body, actionLabel, onAction, tone = "muted" }: EmptyStateProps) {
  const theme = useTheme();
  const c = tone === "neg" ? theme.colors.neg : tone === "warn" ? theme.colors.warn : theme.colors.textMuted;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: theme.spacing.pad }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tone === "muted" ? theme.colors.surface2 : alpha(c, 0.14),
        }}
      >
        <Icon name={icon} size={34} color={c} />
      </View>
      <AppText weight="bold" size={17} style={{ marginTop: 18 }}>
        {title}
      </AppText>
      {body && (
        <AppText size={13.5} muted style={{ marginTop: 7, lineHeight: 20, textAlign: "center", maxWidth: 260 }}>
          {body}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          variant="soft"
          onPress={onAction}
          height={48}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

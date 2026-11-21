import React from "react";
import { StyleSheet, View } from "react-native";
import { BackendNotice } from "@/features/wallet/components/BackendNotice";
import { useThemedStyles, type Theme } from "@/theme";
import type { BackendStatus } from "@/types/status";

interface BackendStatusNoticeProps {
  status: BackendStatus;
  onRetry: () => void;
}

export function BackendStatusNotice({ status, onRetry }: BackendStatusNoticeProps) {
  const styles = useThemedStyles(createStyles);

  if (status === "online") return null;

  return (
    <View style={styles.noticeWrap}>
      <BackendNotice status={status} onRetry={onRetry} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    noticeWrap: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 10,
    },
  });

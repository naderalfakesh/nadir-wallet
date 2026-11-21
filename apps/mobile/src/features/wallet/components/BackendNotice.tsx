import React from "react";
import { StatusNotice } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import type { BackendStatus } from "@/types/status";

// Explains an unreachable API or RPC and offers a retry or the built-in demo data.
export function BackendNotice({
  status,
  onRetry,
}: {
  status: BackendStatus;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const { useDemoData } = useDemoState();
  if (status === "api_unavailable") {
    return (
      <StatusNotice
        tone="warn"
        icon="wifiOff"
        title={t("status.backend.apiTitle")}
        detail={t("status.backend.apiBody")}
        actions={[
          { label: t("status.backend.retry"), icon: "refresh", onPress: onRetry },
          { label: t("status.backend.demoMode"), onPress: useDemoData },
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
          { label: t("status.backend.demoMode"), onPress: useDemoData },
        ]}
      />
    );
  }
  return null;
}

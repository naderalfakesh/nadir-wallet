import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTheme } from "@/theme";
import { AppText, Button } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { BiometricBadge } from "./BiometricBadge";
import { usePulse } from "./usePulse";

interface FaceIDGateProps {
  title: string;
  subtitle: string;
  onDone: () => void;
  auto?: boolean;
}

export function FaceIDGate({ title, subtitle, onDone, auto = false }: FaceIDGateProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const pulse = usePulse(scanning);

  const go = () => setScanning(true);

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(go, 400);
    return () => clearTimeout(id);
  }, [auto]);

  useEffect(() => {
    if (!scanning) return;
    const done = setTimeout(onDone, 1500);
    return () => clearTimeout(done);
  }, [scanning, onDone]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.pad }}>
      <BiometricBadge pulse={pulse} active={scanning} ringSize={116} />
      <AppText weight="bold" size={21} style={{ marginTop: 26 }}>
        {title}
      </AppText>
      <AppText size={14} muted style={{ marginTop: 6 }}>
        {scanning ? t("lock.scanning") : subtitle}
      </AppText>
      {!scanning && (
        <Button
          label={t("lock.useFaceId")}
          icon="faceid"
          variant="soft"
          onPress={go}
          height={48}
          style={{ marginTop: 26, paddingHorizontal: 26 }}
        />
      )}
    </View>
  );
}

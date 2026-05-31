import React, { useEffect, useState } from "react";
import { Animated, View } from "react-native";
import { useTheme } from "@/theme";
import { AppText, Button, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";

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
  const [pulse] = useState(() => new Animated.Value(0.9));

  const go = () => setScanning(true);

  useEffect(() => {
    if (auto) {
      const id = setTimeout(go, 400);
      return () => clearTimeout(id);
    }
  }, [auto]);

  useEffect(() => {
    if (!scanning) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.9, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    const done = setTimeout(onDone, 1500);
    return () => {
      loop.stop();
      clearTimeout(done);
    };
  }, [scanning, pulse, onDone]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.pad }}>
      <View style={{ width: 116, height: 116, alignItems: "center", justifyContent: "center" }}>
        {scanning && (
          <Animated.View
            style={{
              position: "absolute",
              width: 116,
              height: 116,
              borderRadius: 58,
              backgroundColor: theme.colors.accent,
              opacity: 0.18,
              transform: [{ scale: pulse }],
            }}
          />
        )}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 30,
            backgroundColor: theme.colors.accentDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="faceid" size={50} stroke={1.8} color={theme.colors.accent} />
        </View>
      </View>
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

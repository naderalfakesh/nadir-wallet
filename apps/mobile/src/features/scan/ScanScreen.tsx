import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameOutput,
} from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import { createCodeScanner } from "@nadir-wallet/code-scanner";
import { AppText, Button, Icon } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { deliverScan, extractEvmAddress } from "./scanBridge";

/**
 * Full-screen QR scanner. Reads frames through the custom ML Kit barcode Nitro
 * plugin, pulls the first EVM address out of any QR it sees, and hands it back
 * to the opener via {@link scanBridge}. Open it with `beginScan(onResult)` then
 * `router.push("/scan")`.
 */
export function ScanScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const scanner = useMemo(() => createCodeScanner(), []);
  const [found, setFound] = useState(false);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const onCodes = (codes: string[]) => {
    if (handledRef.current) return;
    for (const raw of codes) {
      const addr = extractEvmAddress(raw);
      if (addr) {
        handledRef.current = true;
        setFound(true);
        deliverScan(addr);
        // Brief beat so the success frame is visible, then return.
        setTimeout(() => router.back(), 350);
        return;
      }
    }
  };

  const cancel = () => {
    if (!handledRef.current) {
      handledRef.current = true;
      deliverScan(null);
    }
    router.back();
  };

  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        const g = globalThis as Record<string, unknown>;
        const tick = ((g.__scanTick as number) ?? 0) + 1;
        g.__scanTick = tick;
        if (tick % 4 === 0) {
          const codes = scanner.scan(frame);
          if (codes.length > 0) scheduleOnRN(onCodes, codes);
        }
      } finally {
        frame.dispose();
      }
    },
  });

  return (
    <View style={styles.root}>
      {hasPermission && device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!found}
          outputs={[frameOutput]}
        />
      ) : (
        <View style={styles.permission}>
          <Icon name="scan" size={36} color={colors.accent} />
          <AppText weight="bold" size={18} color="#FFFFFF" style={{ marginTop: 14 }}>
            {t("scan.permissionTitle")}
          </AppText>
          <AppText
            size={13.5}
            color={alpha("#FFFFFF", 0.7)}
            style={{ marginTop: 6, textAlign: "center" }}
          >
            {t("scan.permissionBody")}
          </AppText>
          <Button
            label={t("scan.grant")}
            onPress={requestPermission}
            style={{ marginTop: 20, alignSelf: "stretch" }}
          />
        </View>
      )}

      {/* reticle */}
      {hasPermission && device && (
        <View style={styles.reticleWrap} pointerEvents="none">
          <View style={[styles.reticle, { borderColor: found ? colors.pos : "#FFFFFF" }]}>
            <Corner pos="tl" color={found ? colors.pos : colors.accent} />
            <Corner pos="tr" color={found ? colors.pos : colors.accent} />
            <Corner pos="bl" color={found ? colors.pos : colors.accent} />
            <Corner pos="br" color={found ? colors.pos : colors.accent} />
          </View>
        </View>
      )}

      <View style={[styles.header, { top: insets.top + 8 }]}>
        <Pressable onPress={cancel} style={styles.close} hitSlop={10}>
          <Icon name="close" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={styles.pill}>
          <AppText weight="semibold" size={12.5} color="#FFFFFF">
            {t("scan.title")}
          </AppText>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {hasPermission && device && (
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
          <AppText weight="semibold" size={15} color="#FFFFFF" style={{ textAlign: "center" }}>
            {found ? t("scan.found") : t("scan.hint")}
          </AppText>
        </View>
      )}
    </View>
  );
}

function Corner({ pos, color }: { pos: "tl" | "tr" | "bl" | "br"; color: string }) {
  const base = { position: "absolute" as const, width: 34, height: 34, borderColor: color };
  const map = {
    tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
    tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
    bl: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderBottomLeftRadius: 14,
    },
    br: {
      bottom: 0,
      right: 0,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderBottomRightRadius: 14,
    },
  };
  return <View style={[base, map[pos]]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  permission: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
  reticleWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: { width: 240, height: 240 },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 24 },
});

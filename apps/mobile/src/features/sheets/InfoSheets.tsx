import React from "react";
import { Pressable, View } from "react-native";
import { SheetHeader, AppText, Button, Icon, type IconName, TestnetBadge } from "@/components";
import { useTheme, useThemeControls } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { ColorScheme } from "@/theme";
import type { SheetBodyProps } from "./types";

export function ScanSheet({ close }: SheetBodyProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View>
      <SheetHeader title={t("sheets.scan.title")} onClose={close} />
      <View
        style={{
          aspectRatio: 1,
          borderRadius: 22,
          backgroundColor: theme.colors.bgGrad2,
          borderWidth: 1,
          borderColor: theme.colors.hairline,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ width: "62%", aspectRatio: 1 }}>
          <View style={{ position: "absolute", top: 0, left: 0, width: 36, height: 36, borderTopWidth: 3, borderLeftWidth: 3, borderColor: theme.colors.accent, borderTopLeftRadius: 12 }} />
          <View style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, borderTopWidth: 3, borderRightWidth: 3, borderColor: theme.colors.accent, borderTopRightRadius: 12 }} />
          <View style={{ position: "absolute", bottom: 0, left: 0, width: 36, height: 36, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: theme.colors.accent, borderBottomLeftRadius: 12 }} />
          <View style={{ position: "absolute", bottom: 0, right: 0, width: 36, height: 36, borderBottomWidth: 3, borderRightWidth: 3, borderColor: theme.colors.accent, borderBottomRightRadius: 12 }} />
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: 2,
              backgroundColor: theme.colors.accent,
            }}
          />
        </View>
      </View>
      <AppText size={13.5} muted style={{ textAlign: "center", marginTop: 16 }}>
        {t("sheets.scan.hint")}
      </AppText>
    </View>
  );
}

export function SoonSheet({ params, close }: SheetBodyProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const title = (params?.title as string | undefined) ?? t("sheets.soon.fallback");
  return (
    <View>
      <SheetHeader title={title} onClose={close} />
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: theme.colors.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="clock" size={30} color={theme.colors.textMuted} />
        </View>
        <AppText weight="bold" size={16} style={{ marginTop: 16 }}>
          {t("sheets.soon.heading")}
        </AppText>
        <AppText size={13.5} muted style={{ marginTop: 6, lineHeight: 20, textAlign: "center", maxWidth: 260 }}>
          {t("sheets.soon.body", { title })}
        </AppText>
      </View>
      <Button label={t("sheets.soon.close")} variant="ghost" onPress={close} />
    </View>
  );
}

export function HowItWorksSheet({ close }: SheetBodyProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const points: { icon: IconName; title: string; body: string }[] = [
    { icon: "key", title: t("sheets.howItWorks.localTitle"), body: t("sheets.howItWorks.localBody") },
    { icon: "faceid", title: t("sheets.howItWorks.signTitle"), body: t("sheets.howItWorks.signBody") },
    { icon: "globe", title: t("sheets.howItWorks.backendTitle"), body: t("sheets.howItWorks.backendBody") },
    { icon: "info", title: t("sheets.howItWorks.testnetTitle"), body: t("sheets.howItWorks.testnetBody") },
  ];
  return (
    <View>
      <SheetHeader title={t("sheets.howItWorks.title")} subtitle={t("sheets.howItWorks.sub")} onClose={close} />
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <TestnetBadge label={t("sheets.howItWorks.badge")} />
      </View>
      <View style={{ gap: 12 }}>
        {points.map((p) => (
          <View
            key={p.title}
            style={{
              flexDirection: "row",
              gap: 12,
              padding: 14,
              borderRadius: theme.radius.card,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                backgroundColor: theme.colors.accentDim,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={p.icon} size={20} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" size={14.5}>
                {p.title}
              </AppText>
              <AppText size={12.5} muted style={{ lineHeight: 19, marginTop: 3 }}>
                {p.body}
              </AppText>
            </View>
          </View>
        ))}
      </View>
      <Button label={t("sheets.howItWorks.gotIt")} style={{ marginTop: 16 }} onPress={close} />
    </View>
  );
}

export function ThemeSheet({ close }: SheetBodyProps) {
  const theme = useTheme();
  const { scheme, setScheme } = useThemeControls();
  const { t } = useTranslation();

  const options: { value: ColorScheme; label: string; sub: string; swatch: [string, string] }[] = [
    { value: "dark", label: t("sheets.theme.dark"), sub: t("sheets.theme.darkSub"), swatch: ["#14171d", "#23272f"] },
    { value: "light", label: t("sheets.theme.light"), sub: t("sheets.theme.lightSub"), swatch: ["#ffffff", "#eef0f4"] },
  ];

  return (
    <View>
      <SheetHeader title={t("sheets.theme.title")} subtitle={t("sheets.theme.sub")} onClose={close} />
      <View style={{ gap: 10 }}>
        {options.map((o) => {
          const on = scheme === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => {
                setScheme(o.value);
                setTimeout(close, 220);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 13,
                padding: 14,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.surface,
                borderWidth: 1.5,
                borderColor: on ? theme.colors.accent : theme.colors.hairline,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 13, overflow: "hidden", flexDirection: "row", borderWidth: 1, borderColor: theme.colors.hairline }}>
                <View style={{ flex: 1, backgroundColor: o.swatch[0] }} />
                <View style={{ flex: 1, backgroundColor: o.swatch[1] }} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText weight="bold" size={15.5}>
                  {o.label}
                </AppText>
                <AppText size={12.5} muted style={{ marginTop: 1 }}>
                  {o.sub}
                </AppText>
              </View>
              <Icon name={on ? "checkCircle" : "chevronR"} size={on ? 22 : 18} color={on ? theme.colors.accent : theme.colors.textFaint} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

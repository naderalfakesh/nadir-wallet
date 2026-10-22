import React, { type ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { useTheme } from "@/theme";
import { AppText, Icon, type IconName } from "@/components";
import { useApp } from "@/providers/AppProvider";
import { t } from "@/i18n";

// Derive the exact props expo-router passes to a custom `tabBar` so this stays
// in sync with expo-router's bundled react-navigation types.
type TabBarFn = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type TabBarProps = Parameters<TabBarFn>[0];

const TAB_META: Record<string, { icon: IconName; labelKey: string }> = {
  home: { icon: "home", labelKey: "common.nav.home" },
  activity: { icon: "activity", labelKey: "common.nav.activity" },
  security: { icon: "shield", labelKey: "common.nav.security" },
  settings: { icon: "settings", labelKey: "common.nav.settings" },
};

export function TabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { prefs } = useApp();
  // Nudge the Security tab until the recovery phrase is backed up.
  const securityAlert = !prefs.backupConfirmed;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingTop: 9,
        paddingBottom: insets.bottom + 8,
        backgroundColor: theme.colors.bg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.hairline,
      }}
    >
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const focused = state.index === index;
        const color = focused ? theme.colors.accent : theme.colors.textFaint;

        const onPress = () => {
          const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            style={{ alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <View>
              <Icon name={meta.icon} size={24} stroke={focused ? 2.3 : 2} color={color} />
              {route.name === "security" && securityAlert && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: theme.colors.warn,
                    borderWidth: 1.5,
                    borderColor: theme.colors.bg,
                  }}
                />
              )}
            </View>
            <AppText weight="semibold" size={10.5} color={color}>
              {t(meta.labelKey)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

import React, { type ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { useTheme } from "@/theme";
import { AppText, Icon, type IconName } from "@/components";
import { t } from "@/i18n";

// Derive the exact props expo-router passes to a custom `tabBar` so this stays
// in sync with expo-router's bundled react-navigation types.
type TabBarFn = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type TabBarProps = Parameters<TabBarFn>[0];

const TAB_META: Record<string, { icon: IconName; labelKey: string; alert?: boolean }> = {
  home: { icon: "home", labelKey: "common.nav.home" },
  activity: { icon: "activity", labelKey: "common.nav.activity" },
  // The alert dot reflects the default "not backed up yet" state.
  security: { icon: "shield", labelKey: "common.nav.security", alert: true },
  settings: { icon: "settings", labelKey: "common.nav.settings" },
};

export function TabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
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
              {meta.alert && (
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

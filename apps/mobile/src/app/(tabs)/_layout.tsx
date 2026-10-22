import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/navigation/TabBar";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="security" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

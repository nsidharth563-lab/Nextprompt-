import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router/js-tabs";
import type { ColorValue } from "react-native";
import { C } from "@/components/ui";

type IconName = keyof typeof Ionicons.glyphMap;
function icon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.text,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border },
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.dim,
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Create", headerTitle: "NextPrompt", tabBarIcon: icon("sparkles") }} />
      <Tabs.Screen name="detect" options={{ title: "Detect", headerTitle: "AI Detector", tabBarIcon: icon("search") }} />
      <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: icon("time-outline") }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: icon("settings-outline") }} />
    </Tabs>
  );
}

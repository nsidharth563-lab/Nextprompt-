import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { CreateScreen } from "./src/CreateScreen";
import { DetectScreen } from "./src/DetectScreen";
import { C } from "./src/ui";

type Tab = "create" | "detect";

export default function App() {
  const [tab, setTab] = useState<Tab>("create");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800" }}>
          Next<Text style={{ color: C.accent }}>Prompt</Text>
        </Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {tab === "create" ? <CreateScreen /> : <DetectScreen />}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
        {(
          [
            ["create", "🎬", "Media → Prompt"],
            ["detect", "🕵️", "AI Detector"],
          ] as const
        ).map(([key, icon, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, alignItems: "center", paddingVertical: 12 }}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
            <Text style={{ color: tab === key ? C.accent : C.dim, fontSize: 12, fontWeight: "600" }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

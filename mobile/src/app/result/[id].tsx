import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, View } from "react-native";
import { MediaResultView } from "@/components/MediaResultView";
import { SiteResultView } from "@/components/SiteResultView";
import { C, P } from "@/components/ui";
import { getHistoryItem, type HistoryItem } from "@/lib/storage";

function shareText(item: HistoryItem): string {
  if (item.kind === "media") {
    const d = item.data;
    return [
      `NextPrompt: ${d.summary}`,
      "",
      `Prompt:\n${d.master_prompt}`,
      "",
      "Best platforms:",
      ...d.platforms.map((p, i) => `${i + 1}. ${p.name}: ${p.tailored_prompt}`),
    ].join("\n");
  }
  const d = item.data;
  return [
    `NextPrompt AI check for ${item.source}`,
    `${d.ai_likelihood_percent}% AI likelihood · ${d.detected_platform}`,
    d.summary,
    "",
    `Build your own with ${d.rebuild.best_platform}:`,
    ...d.rebuild.prompts.map((p, i) => `${i + 1}. ${p.stage}: ${p.prompt}`),
  ].join("\n");
}

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<HistoryItem | null | undefined>(undefined);

  useEffect(() => {
    getHistoryItem(id).then((i) => setItem(i ?? null));
  }, [id]);

  if (item === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }
  if (item === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <P dim>This result was deleted.</P>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: item.kind === "media" ? "Your prompts" : "AI check",
          headerRight: () => (
            <Pressable hitSlop={10} accessibilityLabel="Share result" onPress={() => Share.share({ message: shareText(item) }).catch(() => {})}>
              <Ionicons name="share-outline" size={22} color={C.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {item.kind === "media" ? <MediaResultView r={item.data} source={item.source} /> : <SiteResultView r={item.data} source={item.source} />}
      </ScrollView>
    </>
  );
}

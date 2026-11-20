import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useRef, useState } from "react";
import { FlatList, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, C, Gap } from "@/components/ui";
import { PRIVACY_URL, TERMS_URL } from "@/lib/config";
import { setOnboarded } from "@/lib/storage";

const SLIDES: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: "sparkles",
    title: "See it. Get the prompt.",
    body: "Pick any photo or video, or paste a YouTube, TikTok or Instagram link. NextPrompt writes the prompts to make something similar with AI.",
  },
  {
    icon: "rocket-outline",
    title: "Know the best tool",
    body: "Get the best platforms for the job (Veo, Sora, Runway, Kling, Midjourney and more), each with its own prompt and settings.",
  },
  {
    icon: "search",
    title: "Was it made with AI?",
    body: "Paste a website or app link to see if it was built with an AI builder, the evidence, and the steps and prompts to build your own.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList>(null);
  const last = index === SLIDES.length - 1;

  async function finish() {
    await setOnboarded(true);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        ref={list}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.title}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, padding: 32, justifyContent: "center", alignItems: "center", gap: 18 }}>
            <LinearGradient
              colors={[C.accent, C.accent2]}
              style={{ width: 96, height: 96, borderRadius: 28, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name={item.icon} size={46} color="white" />
            </LinearGradient>
            <Text style={{ color: C.text, fontSize: 28, fontWeight: "800", textAlign: "center" }}>{item.title}</Text>
            <Text style={{ color: C.dim, fontSize: 16, lineHeight: 24, textAlign: "center" }}>{item.body}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
        {SLIDES.map((_, i) => (
          <View key={i} style={{ width: i === index ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === index ? C.accent : C.border }} />
        ))}
      </View>
      <View style={{ padding: 24 }}>
        <Button
          title={last ? "Get started" : "Next"}
          onPress={() => (last ? finish() : list.current?.scrollToIndex({ index: index + 1 }))}
        />
        <Gap h={14} />
        <Text style={{ color: C.dim, fontSize: 12, textAlign: "center", lineHeight: 18 }}>
          By continuing you agree to our{" "}
          <Text style={{ color: C.accent }} onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
            Terms
          </Text>{" "}
          and{" "}
          <Text style={{ color: C.accent }} onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </SafeAreaView>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import type { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Button, C, Card, ErrorBox, Gap, GhostButton, H, P, s } from "@/components/ui";
import { assetToFrames, pickMedia, postJson, takePhoto } from "@/lib/api";
import { onSuccess } from "@/lib/feedback";
import { addHistory } from "@/lib/storage";
import type { MediaPromptResult } from "@/lib/types";

type Mode = "upload" | "link";

const STAGES = ["Reading your media…", "Breaking down style & camera…", "Writing prompts…", "Picking the best platforms…"];

export default function CreateScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("upload");
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");

  async function choose(fn: () => Promise<ImagePickerAsset | null>) {
    try {
      setError("");
      const a = await fn();
      if (a) setAsset(a);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function run() {
    setError("");
    setLoading(true);
    setStage(0);
    const timer = setInterval(() => setStage((n) => Math.min(n + 1, STAGES.length - 1)), 7000);
    try {
      let body: Record<string, unknown> = { notes: notes.trim() || undefined };
      let source = "";
      if (mode === "upload") {
        if (!asset) throw new Error("Choose a photo or video first.");
        const { frames, kind } = await assetToFrames(asset);
        body = { ...body, frames, mediaKind: kind };
        source = asset.fileName ?? (kind === "video" ? "Uploaded video" : "Uploaded photo");
      } else {
        if (!url.trim()) throw new Error("Paste a link first.");
        body = { ...body, url: url.trim() };
        source = url.trim();
      }
      const data = await postJson<MediaPromptResult>("/api/media-prompt", body);
      const item = await addHistory({ kind: "media", title: data.summary, source, data });
      onSuccess();
      router.push({ pathname: "/result/[id]", params: { id: item.id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <H size={24}>Turn any photo or video into AI prompts</H>
        <Gap h={4} />
        <P dim>Get the exact prompts and the best AI platform to make something similar.</P>
        <Gap h={16} />
        <Card>
          <View style={{ flexDirection: "row", backgroundColor: "#0B0B12", borderRadius: 12, padding: 4 }}>
            {(["upload", "link"] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === m }}
                style={{ flex: 1, padding: 10, borderRadius: 9, backgroundColor: mode === m ? C.cardHi : "transparent", alignItems: "center" }}
              >
                <Text style={{ color: mode === m ? C.text : C.dim, fontWeight: "600" }}>{m === "upload" ? "Photo / Video" : "Paste link"}</Text>
              </Pressable>
            ))}
          </View>

          {mode === "upload" ? (
            <>
              <Pressable
                onPress={() => choose(pickMedia)}
                accessibilityLabel="Choose a photo or video"
                style={[s.input, { alignItems: "center", paddingVertical: asset ? 12 : 28, borderStyle: "dashed" }]}
              >
                {asset ? (
                  <>
                    <Image source={{ uri: asset.uri }} style={{ width: "100%", height: 220, borderRadius: 10 }} resizeMode="cover" />
                    <Text style={{ color: C.dim, marginTop: 8 }}>
                      {asset.type === "video" ? "🎬 Video" : "🖼️ Photo"} selected · tap to change
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={34} color={C.accent} />
                    <Text style={{ color: C.text, marginTop: 8, fontWeight: "600" }}>Choose from your library</Text>
                    <Text style={{ color: C.dim, marginTop: 2, fontSize: 12 }}>Photos and videos</Text>
                  </>
                )}
              </Pressable>
              <GhostButton title="Take a photo" icon="camera-outline" onPress={() => choose(takePhoto)} />
            </>
          ) : (
            <>
              <TextInput
                style={s.input}
                placeholder="YouTube, TikTok, Instagram or image link"
                placeholderTextColor={C.dim}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                value={url}
                onChangeText={setUrl}
              />
              <P dim small>
                For social videos we use the preview image and caption.
              </P>
            </>
          )}

          <TextInput
            style={[s.input, { minHeight: 70, textAlignVertical: "top" }]}
            multiline
            maxLength={1000}
            placeholder="What do you want? (optional) e.g. 9:16 Reel with my product"
            placeholderTextColor={C.dim}
            value={notes}
            onChangeText={setNotes}
          />
          <Button title={loading ? STAGES[stage] : "Generate prompts"} icon="sparkles" onPress={run} loading={loading} />
          {!!error && <ErrorBox message={error} />}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

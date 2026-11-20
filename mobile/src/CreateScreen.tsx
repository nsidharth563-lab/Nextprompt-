import { useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, Text, TextInput, View } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import { assetToFrames, pickMedia, postJson } from "./api";
import type { MediaPromptResult } from "./types";
import { Button, C, Card, ErrorText, H, P, PromptBox, s } from "./ui";

export function CreateScreen() {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [r, setR] = useState<MediaPromptResult | null>(null);

  async function choose() {
    try {
      setError("");
      const a = await pickMedia();
      if (a) setAsset(a);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function run() {
    setError("");
    setR(null);
    setLoading(true);
    try {
      let body: Record<string, unknown> = { notes: notes.trim() || undefined };
      if (mode === "upload") {
        if (!asset) throw new Error("Choose a photo or video first.");
        const { frames, kind } = await assetToFrames(asset);
        body = { ...body, frames, mediaKind: kind };
      } else {
        if (!url.trim()) throw new Error("Paste a link first.");
        body = { ...body, url: url.trim() };
      }
      setR(await postJson<MediaPromptResult>("/api/media-prompt", body));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Card>
        <H>Media → Prompt</H>
        <P dim>Get prompts and the best AI platform to recreate any photo or video.</P>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["upload", "link"] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: mode === m ? "#24243a" : "transparent", alignItems: "center" }}
            >
              <Text style={{ color: mode === m ? C.text : C.dim, fontWeight: "600" }}>{m === "upload" ? "Upload" : "Paste link"}</Text>
            </Pressable>
          ))}
        </View>
        {mode === "upload" ? (
          <Pressable onPress={choose} style={[s.input, { alignItems: "center", paddingVertical: 20 }]}>
            {asset ? (
              <>
                <Image source={{ uri: asset.uri }} style={{ width: 160, height: 160, borderRadius: 10 }} resizeMode="cover" />
                <Text style={{ color: C.dim, marginTop: 6 }}>{asset.type === "video" ? "🎬 Video selected" : "🖼️ Photo selected"} · tap to change</Text>
              </>
            ) : (
              <Text style={{ color: C.dim }}>📁 Tap to choose a photo or video</Text>
            )}
          </Pressable>
        ) : (
          <TextInput
            style={s.input}
            placeholder="YouTube / TikTok / Instagram / image link"
            placeholderTextColor={C.dim}
            autoCapitalize="none"
            keyboardType="url"
            value={url}
            onChangeText={setUrl}
          />
        )}
        <TextInput
          style={[s.input, { minHeight: 60 }]}
          multiline
          placeholder="What do you want? (optional)"
          placeholderTextColor={C.dim}
          value={notes}
          onChangeText={setNotes}
        />
        <Button title={loading ? "Analyzing…" : "✨ Generate prompts"} onPress={run} disabled={loading} />
        {loading && <ActivityIndicator color={C.accent} />}
        {!!error && <ErrorText message={error} />}
      </Card>

      {r && (
        <>
          <Card>
            <Text style={s.pill}>{r.media_kind}</Text>
            <P>{r.summary}</P>
            {Object.entries(r.breakdown).map(([k, v]) => (
              <Text key={k} style={{ color: C.text, fontSize: 13 }}>
                <Text style={{ color: C.dim }}>{k.replace("_", " ")}: </Text>
                {v}
              </Text>
            ))}
          </Card>
          <PromptBox title="Master prompt" text={r.master_prompt} />
          <View style={{ height: 10 }} />
          <PromptBox title="Negative prompt" text={r.negative_prompt} />
          <View style={{ height: 14 }} />
          {r.similar_variations.length > 0 && <H>Similar variations</H>}
          {r.similar_variations.map((v) => (
            <View key={v.title} style={{ marginTop: 8 }}>
              <PromptBox title={v.title} text={v.prompt} />
            </View>
          ))}
          <View style={{ height: 14 }} />
          <H>Best platforms</H>
          <View style={{ height: 8 }} />
          {r.platforms.map((p, i) => (
            <Card key={p.name}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <H>
                  #{i + 1} {p.name}
                </H>
                {!!p.website && (
                  <Text
                    style={{ color: C.accent }}
                    onPress={() => Linking.openURL(p.website.startsWith("http") ? p.website : `https://${p.website}`)}
                  >
                    Open ↗
                  </Text>
                )}
              </View>
              <P dim>
                {p.category} · {p.difficulty}
              </P>
              <P>{p.why_best}</P>
              <PromptBox title={`${p.name} prompt`} text={p.tailored_prompt} />
              <P dim>Settings: {p.suggested_settings}</P>
            </Card>
          ))}
          <Card>
            <H>Step-by-step</H>
            {r.steps.map((st, i) => (
              <P key={i}>
                {i + 1}. {st}
              </P>
            ))}
            {r.tips.length > 0 && <H>Pro tips</H>}
            {r.tips.map((t, i) => (
              <P key={i} dim>• {t}</P>
            ))}
          </Card>
        </>
      )}
    </View>
  );
}

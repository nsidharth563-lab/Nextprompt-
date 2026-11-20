import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { Button, C, Card, Chip, ErrorBox, Gap, H, P, s } from "@/components/ui";
import { postJson } from "@/lib/api";
import { onSuccess } from "@/lib/feedback";
import { addHistory } from "@/lib/storage";
import type { SiteAnalysisResult } from "@/lib/types";

const EXAMPLES = ["Lovable", "Bolt", "v0", "Base44", "Framer", "Webflow", "Wix", "Shopify"];

export default function DetectScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!url.trim()) {
      setError("Paste a website or app link first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await postJson<SiteAnalysisResult>("/api/analyze-site", { url: url.trim() });
      const item = await addHistory({ kind: "site", title: data.detected_platform + " · " + url.trim(), source: url.trim(), data });
      onSuccess();
      router.push({ pathname: "/result/[id]", params: { id: item.id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <H size={24}>Was it made with AI?</H>
        <Gap h={4} />
        <P dim>Paste a website, App Store or Google Play link. See the evidence, then get the steps and prompts to build your own.</P>
        <Gap h={16} />
        <Card>
          <TextInput
            style={s.input}
            placeholder="https://example.com"
            placeholderTextColor={C.dim}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={run}
            value={url}
            onChangeText={setUrl}
          />
          <Button title={loading ? "Scanning…" : "Analyze"} icon="search" onPress={run} loading={loading} />
          {!!error && <ErrorBox message={error} />}
        </Card>
        <P dim small>
          Detects builders like:
        </P>
        <Gap h={6} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {EXAMPLES.map((e) => (
            <Chip key={e} label={e} color={C.dim} />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

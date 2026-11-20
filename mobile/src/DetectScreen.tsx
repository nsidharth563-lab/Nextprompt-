import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { postJson } from "./api";
import type { SiteAnalysisResult } from "./types";
import { Button, C, Card, ErrorText, H, P, PromptBox, s } from "./ui";

const VERDICT: Record<SiteAnalysisResult["verdict"], { label: string; color: string }> = {
  built_with_ai_builder: { label: "Built with an AI builder", color: C.accent },
  likely_ai_assisted: { label: "Likely AI-assisted", color: "#fbbf24" },
  likely_traditional: { label: "Likely built traditionally", color: "#34d399" },
  inconclusive: { label: "Inconclusive", color: C.dim },
};
const POINTS = { ai: C.accent, traditional: "#34d399", neutral: C.dim };

export function DetectScreen() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [r, setR] = useState<SiteAnalysisResult | null>(null);

  async function run() {
    if (!url.trim()) return;
    setError("");
    setR(null);
    setLoading(true);
    try {
      setR(await postJson<SiteAnalysisResult>("/api/analyze-site", { url: url.trim() }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Card>
        <H>Was it made with AI?</H>
        <P dim>Paste a website, App Store or Google Play link.</P>
        <TextInput
          style={s.input}
          placeholder="https://example.com"
          placeholderTextColor={C.dim}
          autoCapitalize="none"
          keyboardType="url"
          value={url}
          onChangeText={setUrl}
        />
        <Button title={loading ? "Scanning…" : "🔍 Analyze"} onPress={run} disabled={loading} />
        {loading && <ActivityIndicator color={C.accent} />}
        {!!error && <ErrorText message={error} />}
      </Card>

      {r && (
        <>
          <Card>
            <Text style={{ color: VERDICT[r.verdict].color, fontSize: 20, fontWeight: "800" }}>{VERDICT[r.verdict].label}</Text>
            <Text style={{ color: C.text, fontSize: 32, fontWeight: "800" }}>
              {r.ai_likelihood_percent}% <Text style={{ fontSize: 13, color: C.dim }}>AI likelihood (estimate)</Text>
            </Text>
            <P dim>Platform: {r.detected_platform}</P>
            <P>{r.summary}</P>
            {r.tech_stack.length > 0 && <P dim>Stack: {r.tech_stack.join(" · ")}</P>}
          </Card>
          <Card>
            <H>Evidence</H>
            {r.evidence.map((e, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={{ color: POINTS[e.points_to], fontWeight: "700", fontSize: 12 }}>
                  {e.strength.toUpperCase()} · {e.signal}
                </Text>
                <P dim>{e.explanation}</P>
              </View>
            ))}
          </Card>
          <Card>
            <H>Build your own</H>
            <P>
              Best platform: <Text style={{ color: C.accent, fontWeight: "700" }}>{r.rebuild.best_platform}</Text> — {r.rebuild.why}
            </P>
            <P dim>Effort: {r.rebuild.estimated_effort}</P>
            {r.rebuild.alternatives.map((a) => (
              <P key={a.name} dim>• {a.name}: {a.best_for}</P>
            ))}
            {r.rebuild.steps.map((st, i) => (
              <P key={i}>
                {i + 1}. <Text style={{ fontWeight: "700" }}>{st.title}</Text> — {st.detail}
              </P>
            ))}
          </Card>
          {r.rebuild.prompts.map((p, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <PromptBox title={`${i + 1}. ${p.stage}`} text={p.prompt} />
            </View>
          ))}
          {r.caveats.length > 0 && (
            <Card>
              <P dim>Caveats</P>
              {r.caveats.map((c, i) => (
                <P key={i} dim>• {c}</P>
              ))}
            </Card>
          )}
        </>
      )}
    </View>
  );
}

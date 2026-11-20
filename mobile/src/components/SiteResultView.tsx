import { Text, View } from "react-native";
import type { SiteAnalysisResult } from "@/lib/types";
import { ReportButton } from "./ReportButton";
import { C, Card, Chip, Gap, H, P, PromptBox } from "./ui";

export const VERDICT: Record<SiteAnalysisResult["verdict"], { label: string; color: string }> = {
  built_with_ai_builder: { label: "Built with an AI builder", color: C.accent },
  likely_ai_assisted: { label: "Likely AI-assisted", color: C.warn },
  likely_traditional: { label: "Likely built traditionally", color: C.success },
  inconclusive: { label: "Inconclusive", color: C.dim },
};
const POINTS = { ai: C.accent, traditional: C.success, neutral: C.dim };

function Meter({ value }: { value: number }) {
  return (
    <View style={{ height: 10, borderRadius: 5, backgroundColor: C.border, overflow: "hidden" }}>
      <View style={{ width: `${value}%`, height: "100%", backgroundColor: C.accent }} />
    </View>
  );
}

export function SiteResultView({ r, source }: { r: SiteAnalysisResult; source: string }) {
  const v = VERDICT[r.verdict];
  return (
    <View>
      <Card>
        <Text style={{ color: v.color, fontSize: 20, fontWeight: "800" }}>{v.label}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={{ color: C.text, fontSize: 34, fontWeight: "800" }}>{r.ai_likelihood_percent}%</Text>
          <Text style={{ color: C.dim, fontSize: 13 }}>AI likelihood (estimate)</Text>
        </View>
        <Meter value={r.ai_likelihood_percent} />
        <P dim>
          Platform: <Text style={{ color: C.text }}>{r.detected_platform}</Text> · {r.target_kind.replace("_", " ")}
        </P>
        <P>{r.summary}</P>
        {r.tech_stack.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {r.tech_stack.map((t) => (
              <Chip key={t} label={t} color={C.accent2} />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <H>Evidence</H>
        {r.evidence.map((e, i) => (
          <View key={i}>
            <Text style={{ color: POINTS[e.points_to], fontWeight: "700", fontSize: 12 }}>
              {e.strength.toUpperCase()} · {e.signal}
            </Text>
            <P dim small>
              {e.explanation}
            </P>
          </View>
        ))}
      </Card>

      <Card>
        <H>Build your own</H>
        <P>
          Best platform: <Text style={{ color: C.accent, fontWeight: "700" }}>{r.rebuild.best_platform}</Text> — {r.rebuild.why}
        </P>
        <P dim small>
          Estimated effort: {r.rebuild.estimated_effort}
        </P>
        {r.rebuild.alternatives.map((a) => (
          <P key={a.name} dim small>
            • {a.name}: {a.best_for}
          </P>
        ))}
        <Gap h={4} />
        {r.rebuild.steps.map((st, i) => (
          <P key={i}>
            {i + 1}. <Text style={{ fontWeight: "700" }}>{st.title}</Text> — {st.detail}
          </P>
        ))}
      </Card>

      <H>Copy-paste prompts</H>
      <Gap h={8} />
      {r.rebuild.prompts.map((p, i) => (
        <View key={i} style={{ marginBottom: 10 }}>
          <PromptBox title={`${i + 1}. ${p.stage}`} text={p.prompt} />
        </View>
      ))}

      {r.caveats.length > 0 && (
        <Card>
          <P dim small>
            Caveats
          </P>
          {r.caveats.map((c, i) => (
            <P key={i} dim small>
              • {c}
            </P>
          ))}
        </Card>
      )}
      <ReportButton kind="site" source={source} resultSummary={r.summary} />
      <Gap h={8} />
      <P dim small>
        AI detection is an estimate based on public signals, never proof.
      </P>
    </View>
  );
}

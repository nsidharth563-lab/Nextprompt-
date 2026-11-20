import { Linking, Text, View } from "react-native";
import type { MediaPromptResult } from "@/lib/types";
import { ReportButton } from "./ReportButton";
import { C, Card, Chip, Gap, GhostButton, H, P, PromptBox } from "./ui";

export function MediaResultView({ r, source }: { r: MediaPromptResult; source: string }) {
  return (
    <View>
      <Card>
        <Chip label={r.media_kind === "video" ? "Video" : "Photo"} />
        <P>{r.summary}</P>
        {Object.entries(r.breakdown).map(([k, v]) => (
          <Text key={k} style={{ color: C.text, fontSize: 13, lineHeight: 19 }}>
            <Text style={{ color: C.dim, fontWeight: "600" }}>{k.replace("_", " ")}: </Text>
            {v}
          </Text>
        ))}
      </Card>

      <PromptBox title="Master prompt" text={r.master_prompt} />
      <Gap h={10} />
      <PromptBox title="Negative prompt" text={r.negative_prompt} />
      <Gap h={20} />

      {r.similar_variations?.length > 0 && (
        <>
          <H>Similar variations</H>
          <Gap h={8} />
          {r.similar_variations.map((v) => (
            <View key={v.title} style={{ marginBottom: 10 }}>
              <PromptBox title={v.title} text={v.prompt} />
            </View>
          ))}
          <Gap h={10} />
        </>
      )}

      <H>Best platforms to make it</H>
      <Gap h={8} />
      {r.platforms.map((p, i) => (
        <Card key={p.name}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: C.dim, fontWeight: "700" }}>#{i + 1}</Text>
            <H>{p.name}</H>
          </View>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            <Chip label={p.category} color={C.accent2} />
            <Chip label={p.difficulty} color={C.dim} />
          </View>
          <P>{p.why_best}</P>
          <PromptBox title={`${p.name} prompt`} text={p.tailored_prompt} />
          <P dim small>
            Settings: {p.suggested_settings}
          </P>
          {!!p.website && (
            <GhostButton
              title={`Open ${p.name}`}
              icon="open-outline"
              color={C.accent}
              onPress={() => Linking.openURL(p.website.startsWith("http") ? p.website : `https://${p.website}`).catch(() => {})}
            />
          )}
        </Card>
      ))}

      <Card>
        <H>Step-by-step</H>
        {r.steps.map((st, i) => (
          <P key={i}>
            {i + 1}. {st}
          </P>
        ))}
        {r.tips.length > 0 && (
          <>
            <Gap h={4} />
            <H size={16}>Pro tips</H>
            {r.tips.map((t, i) => (
              <P key={i} dim>
                • {t}
              </P>
            ))}
          </>
        )}
      </Card>
      <ReportButton kind="media" source={source} resultSummary={r.summary} />
      <Gap h={8} />
      <P dim small>
        Prompts are AI-generated suggestions. Respect the rights of the original creators.
      </P>
    </View>
  );
}

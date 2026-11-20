"use client";

import { useState } from "react";
import type { SiteAnalysisResult } from "@/lib/schemas";
import { ErrorBox, PromptBox, Spinner, postJson } from "@/components/ui";

const VERDICT: Record<SiteAnalysisResult["verdict"], { label: string; color: string }> = {
  built_with_ai_builder: { label: "Built with an AI builder", color: "text-fuchsia-300 bg-fuchsia-500/15" },
  likely_ai_assisted: { label: "Likely AI-assisted", color: "text-amber-300 bg-amber-500/15" },
  likely_traditional: { label: "Likely built traditionally", color: "text-emerald-300 bg-emerald-500/15" },
  inconclusive: { label: "Inconclusive", color: "text-white/70 bg-white/10" },
};

const POINTS: Record<string, string> = { ai: "text-fuchsia-300", traditional: "text-emerald-300", neutral: "text-white/50" };

export default function DetectPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [r, setR] = useState<SiteAnalysisResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setR(null);
    setLoading(true);
    try {
      setR(await postJson<SiteAnalysisResult>("/api/analyze-site", { url: url.trim() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Was it made with AI?</h1>
        <p className="mt-2 text-white/55">
          Paste a website, App Store or Google Play link. We check builder fingerprints and content, then show you how to build your own.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <input
          className="input flex-1"
          placeholder="https://example.com or https://apps.apple.com/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn" disabled={loading}>{loading ? "Scanning…" : "🔍 Analyze"}</button>
      </form>

      {error && <ErrorBox message={error} />}
      {loading && <Spinner label="Scanning the page and comparing fingerprints…" />}

      {r && (
        <>
          <div className="card grid gap-5 sm:grid-cols-[160px_1fr]">
            <div className="flex flex-col items-center justify-center">
              <Gauge value={r.ai_likelihood_percent} />
              <span className="mt-1 text-xs text-white/45">AI likelihood (estimate)</span>
            </div>
            <div className="space-y-2">
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${VERDICT[r.verdict].color}`}>
                {VERDICT[r.verdict].label}
              </span>
              <p className="text-sm text-white/50">
                Platform: <span className="text-white">{r.detected_platform}</span> · Type: {r.target_kind.replace("_", " ")}
              </p>
              <p className="text-white/80">{r.summary}</p>
              {r.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {r.tech_stack.map((t) => (
                    <span key={t} className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold">Evidence</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {r.evidence.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className={`w-16 shrink-0 text-xs font-semibold uppercase ${POINTS[e.points_to]}`}>{e.strength}</span>
                  <div>
                    <div className="font-medium">{e.signal}</div>
                    <div className="text-white/55">{e.explanation}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Build your own</h2>
              <p className="mt-1 text-sm text-white/60">
                Best platform: <span className="font-semibold text-fuchsia-300">{r.rebuild.best_platform}</span> — {r.rebuild.why}
              </p>
              <p className="mt-1 text-xs text-white/45">Estimated effort: {r.rebuild.estimated_effort}</p>
            </div>
            {r.rebuild.alternatives.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {r.rebuild.alternatives.map((a) => (
                  <span key={a.name} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/65" title={a.best_for}>
                    {a.name} · {a.best_for}
                  </span>
                ))}
              </div>
            )}
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {r.rebuild.steps.map((s, i) => (
                <li key={i}>
                  <span className="font-semibold">{s.title}</span> <span className="text-white/60">— {s.detail}</span>
                </li>
              ))}
            </ol>
            <h3 className="pt-2 font-semibold">Copy-paste prompts</h3>
            {r.rebuild.prompts.map((p, i) => (
              <PromptBox key={i} title={`${i + 1}. ${p.stage}`} text={p.prompt} />
            ))}
          </div>

          {r.caveats.length > 0 && (
            <div className="rounded-xl border border-white/10 p-4 text-xs text-white/50">
              <div className="mb-1 font-semibold text-white/60">Caveats</div>
              <ul className="list-disc space-y-1 pl-4">{r.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const deg = (value / 100) * 360;
  return (
    <div
      className="grid h-28 w-28 place-items-center rounded-full"
      style={{ background: `conic-gradient(#d946ef ${deg}deg, rgba(255,255,255,0.08) ${deg}deg)` }}
    >
      <div className="grid h-22 w-22 place-items-center rounded-full bg-[#0d0d14] text-2xl font-bold">{value}%</div>
    </div>
  );
}

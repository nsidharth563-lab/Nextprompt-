"use client";

import { useState } from "react";
import type { MediaPromptResult } from "@/lib/schemas";
import { imageToFrame, videoToFrames, type Frame } from "@/lib/media";
import { ErrorBox, PromptBox, Spinner, postJson } from "@/components/ui";

type Mode = "upload" | "link";

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MediaPromptResult | null>(null);

  function pick(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      let frames: Frame[] | undefined;
      let mediaKind: "image" | "video" | undefined;
      if (mode === "upload") {
        if (!file) throw new Error("Choose a photo or video first.");
        if (file.type.startsWith("video/")) {
          frames = await videoToFrames(file, 6);
          mediaKind = "video";
        } else if (file.type.startsWith("image/")) {
          frames = [await imageToFrame(file)];
          mediaKind = "image";
        } else throw new Error("Unsupported file type.");
      } else if (!url.trim()) throw new Error("Paste a link first.");
      const data = await postJson<MediaPromptResult>("/api/media-prompt", {
        frames,
        mediaKind,
        url: mode === "link" ? url.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="card h-fit space-y-5 lg:sticky lg:top-6">
        <div>
          <h1 className="text-2xl font-bold">Media → Prompt</h1>
          <p className="mt-1 text-sm text-white/55">Get the prompts and the best AI platform to recreate any photo or video.</p>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/40 p-1 text-sm">
          {(["upload", "link"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg py-2 ${mode === m ? "bg-white/10 font-semibold" : "text-white/60"}`}
            >
              {m === "upload" ? "Upload file" : "Paste link"}
            </button>
          ))}
        </div>

        {mode === "upload" ? (
          <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 p-4 text-center text-sm text-white/60 hover:border-fuchsia-400/60">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            {preview && file ? (
              file.type.startsWith("video/") ? (
                <video src={preview} className="mx-auto max-h-56 rounded-lg" muted controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="mx-auto max-h-56 rounded-lg" />
              )
            ) : (
              <span>📁 Click to choose a photo or video</span>
            )}
            {file && <div className="mt-2 truncate text-xs text-white/40">{file.name}</div>}
          </label>
        ) : (
          <div>
            <label className="label" htmlFor="url">Photo / video link</label>
            <input
              id="url"
              className="input"
              placeholder="https://youtube.com/watch?v=… or image URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="mt-2 text-xs text-white/40">
              Works with image links and YouTube, TikTok, Instagram, Pinterest pages (uses the preview image + caption).
            </p>
          </div>
        )}

        <div>
          <label className="label" htmlFor="notes">What do you want? (optional)</label>
          <textarea
            id="notes"
            className="input min-h-20"
            placeholder="e.g. Make it a 9:16 Reel, swap the product for my sneakers"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button className="btn w-full" disabled={loading}>
          {loading ? "Analyzing…" : "✨ Generate prompts"}
        </button>
      </form>

      <section className="space-y-5">
        {error && <ErrorBox message={error} />}
        {loading && <Spinner label="Reading your media and writing prompts… this can take up to a minute." />}
        {!loading && !result && !error && (
          <div className="card text-white/50">Your prompts, best platforms and step-by-step workflow will appear here.</div>
        )}
        {result && <MediaResult r={result} />}
      </section>
    </div>
  );
}

function MediaResult({ r }: { r: MediaPromptResult }) {
  return (
    <>
      <div className="card">
        <span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-xs text-fuchsia-300">{r.media_kind}</span>
        <p className="mt-3 text-lg">{r.summary}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {Object.entries(r.breakdown).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wider text-white/40">{k.replace("_", " ")}</dt>
              <dd className="text-white/80">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <PromptBox title="Master prompt" text={r.master_prompt} />
      <PromptBox title="Negative prompt" text={r.negative_prompt} />

      <h2 className="pt-2 text-xl font-semibold">Best platforms to make it</h2>
      <div className="space-y-4">
        {r.platforms.map((p, i) => (
          <div key={p.name} className="card space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-white/40">#{i + 1}</span>
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">{p.category}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">{p.difficulty}</span>
              {p.website && (
                <a
                  href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs text-fuchsia-300 hover:underline"
                >
                  Open ↗
                </a>
              )}
            </div>
            <p className="text-sm text-white/65">{p.why_best}</p>
            <PromptBox title={`${p.name} prompt`} text={p.tailored_prompt} />
            <p className="text-xs text-white/50">
              <span className="font-semibold text-white/70">Settings:</span> {p.suggested_settings}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold">Step-by-step</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/75">
          {r.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        {r.tips.length > 0 && (
          <>
            <h3 className="mt-5 font-semibold">Pro tips</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/65">
              {r.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

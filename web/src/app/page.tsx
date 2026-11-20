import Link from "next/link";

const features = [
  {
    href: "/create",
    emoji: "🎬",
    title: "Media → Prompt",
    body: "Upload a photo or video, or paste a YouTube / TikTok / Instagram / image link. Get a full breakdown, a master prompt, tailored prompts for the best AI platforms and a step-by-step workflow.",
    cta: "Generate prompts",
  },
  {
    href: "/detect",
    emoji: "🕵️",
    title: "AI Site & App Detector",
    body: "Paste any website, App Store or Google Play link. See whether it was likely built with an AI builder (Lovable, Bolt, v0, Base44…), the evidence, the tech stack — and the exact prompts to build your own.",
    cta: "Analyze a link",
  },
];

export default function Home() {
  return (
    <>
      <section className="py-16 text-center sm:py-24">
        <p className="mx-auto mb-4 inline-block rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">
          Reverse-engineer anything made with AI
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          See it. Get the prompt.{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Make it yours.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-white/60">
          NextPrompt turns any photo, video, website or app into ready-to-paste AI prompts and tells you which platform is
          best to create it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/create" className="btn">Start with a photo / video</Link>
          <Link href="/detect" className="btn-ghost !px-5 !py-3">Check a website / app</Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="card group transition hover:border-fuchsia-400/50">
            <div className="text-3xl">{f.emoji}</div>
            <h2 className="mt-3 text-xl font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{f.body}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-fuchsia-300 group-hover:underline">{f.cta} →</span>
          </Link>
        ))}
      </section>

      <section className="mt-16 grid gap-4 text-sm sm:grid-cols-3">
        {[
          ["1. Drop it in", "Upload a file or paste any link."],
          ["2. AI breaks it down", "Style, camera, lighting, motion, tech stack and builder fingerprints."],
          ["3. Copy & create", "Platform-tailored prompts and steps you can use immediately."],
        ].map(([t, b]) => (
          <div key={t} className="card">
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-1 text-white/55">{b}</p>
          </div>
        ))}
      </section>
    </>
  );
}

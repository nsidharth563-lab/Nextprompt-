import { z } from "zod";

/* ---------- Feature 1: media -> prompts + best platforms ---------- */

export const MediaPromptSchema = z.object({
  summary: z.string().describe("1-2 sentence description of what the media shows"),
  media_kind: z.enum(["image", "video"]),
  breakdown: z.object({
    subject: z.string(),
    setting: z.string(),
    style: z.string().describe("visual/art style, e.g. cinematic, anime, 3D render, UGC selfie"),
    camera: z.string().describe("shot type, lens, angle and camera movement"),
    lighting: z.string(),
    color_palette: z.string(),
    motion: z.string().describe("what moves and how; 'static' for still images"),
    mood: z.string(),
    audio: z.string().describe("suggested music / SFX / voice-over, or 'none'"),
  }),
  master_prompt: z.string().describe("A detailed, platform-neutral prompt to recreate this"),
  negative_prompt: z.string(),
  similar_variations: z
    .array(z.object({ title: z.string(), prompt: z.string() }))
    .describe("3 prompts that keep the same look and feel but change one thing (subject, setting, season, product...)"),
  platforms: z
    .array(
      z.object({
        name: z.string(),
        website: z.string(),
        category: z.enum(["video", "image", "image-to-video", "avatar/talking-head", "editing"]),
        why_best: z.string(),
        tailored_prompt: z.string().describe("prompt rewritten in this platform's preferred style"),
        suggested_settings: z.string().describe("aspect ratio, duration, model/mode, seed tips"),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      }),
    )
    .describe("3-5 platforms ranked best first"),
  steps: z.array(z.string()).describe("Step-by-step workflow to produce the final result"),
  tips: z.array(z.string()),
});
export type MediaPromptResult = z.infer<typeof MediaPromptSchema>;

/* ---------- Feature 2: website/app -> AI-made? + rebuild guide ---------- */

export const SiteAnalysisSchema = z.object({
  target_kind: z.enum(["website", "web_app", "ios_app", "android_app", "unknown"]),
  verdict: z.enum([
    "built_with_ai_builder",
    "likely_ai_assisted",
    "likely_traditional",
    "inconclusive",
  ]),
  ai_likelihood_percent: z.number().int().describe("0-100 estimate, not a certainty"),
  detected_platform: z
    .string()
    .describe("e.g. Lovable, Bolt, v0, Framer, Webflow, Wix, custom Next.js, or 'Unknown'"),
  summary: z.string(),
  evidence: z.array(
    z.object({
      signal: z.string(),
      strength: z.enum(["strong", "medium", "weak"]),
      points_to: z.enum(["ai", "traditional", "neutral"]),
      explanation: z.string(),
    }),
  ),
  tech_stack: z.array(z.string()),
  rebuild: z.object({
    best_platform: z.string(),
    why: z.string(),
    alternatives: z.array(z.object({ name: z.string(), best_for: z.string() })),
    estimated_effort: z.string(),
    steps: z.array(z.object({ title: z.string(), detail: z.string() })),
    prompts: z
      .array(z.object({ stage: z.string(), prompt: z.string() }))
      .describe("Copy-paste prompts, in order, to rebuild it with the best platform"),
  }),
  caveats: z.array(z.string()),
});
export type SiteAnalysisResult = z.infer<typeof SiteAnalysisSchema>;

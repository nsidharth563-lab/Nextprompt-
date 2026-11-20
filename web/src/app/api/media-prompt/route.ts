import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { runStructured } from "@/lib/claude";
import { errorResponse } from "@/lib/http";
import { MediaPromptSchema } from "@/lib/schemas";
import { safeFetch, UserInputError } from "@/lib/safeFetch";
import { digestHtml } from "@/lib/fingerprints";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 120;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const BodySchema = z.object({
  // Uploaded image, or frames the client extracted from an uploaded video.
  frames: z
    .array(z.object({ mediaType: z.enum(IMAGE_TYPES), data: z.string().max(7_000_000) }))
    .max(8)
    .optional(),
  mediaKind: z.enum(["image", "video"]).optional(),
  url: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
});

const SYSTEM = `You are NextPrompt, an expert AI creative director and prompt engineer for generative image and video tools.
Given an image, or a sequence of frames sampled in order from a video, you reverse-engineer how to recreate it with AI.

- Describe only what is visible; when something is inferred (e.g. audio, camera movement between frames), say so.
- Write prompts the user can paste directly. Tailor each platform's prompt to that tool's conventions
  (e.g. Midjourney parameters like --ar/--style, Runway/Kling/Veo/Sora-style shot descriptions with camera moves, timing and audio cues).
- Recommend 3-5 platforms that best fit THIS content (realism, stylization, motion complexity, people/avatars, audio needs).
  Candidates include Google Veo, OpenAI Sora, Runway, Kling, Luma Dream Machine, Hailuo/MiniMax, Pika, Higgsfield, HeyGen/Synthesia (avatars),
  Midjourney, Ideogram, Flux, Leonardo, Adobe Firefly, CapCut (editing). Prefer what you genuinely judge best; don't invent features or prices.
- If the media shows a real, identifiable person, do not write prompts to impersonate them; describe a similar but generic character instead.
- Steps should cover the full workflow: generating stills/keyframes if useful, animating, upscaling, audio and editing.`;

export async function POST(req: Request) {
  if (!rateLimit(clientIp(req), 8)) {
    return NextResponse.json({ error: "Too many requests, slow down a little." }, { status: 429 });
  }
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { frames = [], url, notes } = parsed.data;
  let mediaKind = parsed.data.mediaKind ?? "image";

  try {
    const content: Anthropic.Beta.BetaContentBlockParam[] = [];
    let context = "";

    if (frames.length) {
      for (const f of frames) {
        content.push({ type: "image", source: { type: "base64", media_type: f.mediaType, data: f.data } });
      }
    } else if (url) {
      const page = await safeFetch(url, "image/*,text/html;q=0.9,*/*;q=0.5");
      const ct = page.contentType.split(";")[0].trim().toLowerCase();
      if ((IMAGE_TYPES as readonly string[]).includes(ct)) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: ct as ImageType, data: page.body.toString("base64") },
        });
      } else if (ct.startsWith("video/")) {
        throw new UserInputError(
          "Direct video files can't be analyzed from a link yet. Download it and use Upload instead — we sample frames from the video in your browser.",
        );
      } else if (ct.includes("html")) {
        // Social/video page (YouTube, TikTok, Instagram, Pinterest...): use its preview image + metadata.
        const d = digestHtml(page.body.toString("utf8"), page.finalUrl);
        const isVideo = /youtube|youtu\.be|tiktok|vimeo|instagram\.com\/(reel|p)|facebook\.com\/.*video|x\.com|twitter\.com/i.test(
          page.finalUrl.hostname + page.finalUrl.pathname,
        );
        if (isVideo) mediaKind = "video";
        context = `Source page: ${page.finalUrl}\nTitle: ${d.title}\nDescription: ${d.description}\n`;
        if (d.ogImage) {
          try {
            const img = await safeFetch(new URL(d.ogImage, page.finalUrl).toString(), "image/*");
            const ict = img.contentType.split(";")[0].trim().toLowerCase();
            if ((IMAGE_TYPES as readonly string[]).includes(ict)) {
              content.push({
                type: "image",
                source: { type: "base64", media_type: ict as ImageType, data: img.body.toString("base64") },
              });
              context += "The attached image is the page's preview thumbnail, not the full video.\n";
            }
          } catch {
            /* fall through to text-only */
          }
        }
        if (!content.length && !d.title && !d.description) {
          throw new UserInputError("Couldn't read any media from that link. Try uploading the file instead.");
        }
      } else {
        throw new UserInputError(`Unsupported content type: ${ct || "unknown"}.`);
      }
    } else {
      throw new UserInputError("Upload a photo/video or paste a link.");
    }

    content.push({
      type: "text",
      text:
        `${context}Media kind: ${mediaKind}${frames.length > 1 ? ` (${frames.length} frames sampled in order from the video)` : ""}.\n` +
        (notes ? `User's goal / notes: ${notes}\n` : "") +
        `Analyze it and produce the prompts, best platforms and step-by-step workflow to recreate it as a ${mediaKind}.`,
    });

    const result = await runStructured({ system: SYSTEM, content, schema: MediaPromptSchema });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

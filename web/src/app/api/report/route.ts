import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const ReportSchema = z.object({
  kind: z.enum(["media", "site"]),
  source: z.string().max(2000),
  reason: z.string().max(200),
  summary: z.string().max(1000).optional(),
});

/**
 * Users can flag AI-generated results (required by Google Play's AI-generated content policy).
 * For now reports are written to the server log; connect this to email, Slack or a database for review.
 */
export async function POST(req: Request) {
  if (!rateLimit(`report:${clientIp(req)}`, 20)) {
    return NextResponse.json({ error: "Too many reports." }, { status: 429 });
  }
  const parsed = ReportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  console.info("[content-report]", JSON.stringify({ ...parsed.data, at: new Date().toISOString() }));
  return NextResponse.json({ ok: true });
}

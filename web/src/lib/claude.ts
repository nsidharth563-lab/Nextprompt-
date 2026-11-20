import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";

let client: Anthropic | null = null;
function getClient() {
  // Reads ANTHROPIC_API_KEY from the environment.
  client ??= new Anthropic();
  return client;
}

export class AIRefusalError extends Error {}

type Content = Anthropic.Beta.BetaContentBlockParam[];

/**
 * One structured-output call to Claude. Returns data validated against `schema`.
 * Server-side refusal fallbacks are enabled ("default" routing), so a request a
 * safety classifier declines is retried on a suitable fallback model in the same call.
 */
export async function runStructured<T extends z.ZodType>(opts: {
  system: string;
  content: Content;
  schema: T;
  effort?: "low" | "medium" | "high";
}): Promise<z.infer<T>> {
  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: opts.effort ?? "medium",
      format: betaZodOutputFormat(opts.schema),
    },
    system: opts.system,
    messages: [{ role: "user", content: opts.content }],
  });

  if (response.stop_reason === "refusal") {
    throw new AIRefusalError("The AI declined to analyze this content.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new Error("The AI response was incomplete. Please try again.");
  }
  return response.parsed_output as z.infer<T>;
}

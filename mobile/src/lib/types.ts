// Mirrors web/src/lib/schemas.ts (the API contract).
export interface MediaPromptResult {
  summary: string;
  media_kind: "image" | "video";
  breakdown: Record<string, string>;
  master_prompt: string;
  negative_prompt: string;
  similar_variations: { title: string; prompt: string }[];
  platforms: {
    name: string;
    website: string;
    category: string;
    why_best: string;
    tailored_prompt: string;
    suggested_settings: string;
    difficulty: string;
  }[];
  steps: string[];
  tips: string[];
}

export interface SiteAnalysisResult {
  target_kind: string;
  verdict: "built_with_ai_builder" | "likely_ai_assisted" | "likely_traditional" | "inconclusive";
  ai_likelihood_percent: number;
  detected_platform: string;
  summary: string;
  evidence: { signal: string; strength: string; points_to: "ai" | "traditional" | "neutral"; explanation: string }[];
  tech_stack: string[];
  rebuild: {
    best_platform: string;
    why: string;
    alternatives: { name: string; best_for: string }[];
    estimated_effort: string;
    steps: { title: string; detail: string }[];
    prompts: { stage: string; prompt: string }[];
  };
  caveats: string[];
}

export interface Frame {
  mediaType: "image/jpeg";
  data: string;
}

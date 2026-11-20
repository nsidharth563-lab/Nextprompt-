# NextPrompt

AI SaaS (web + mobile) with two tools:

1. **Media → Prompt** — upload a photo/video or paste a link (image URL, YouTube, TikTok, Instagram, Pinterest…).
   NextPrompt breaks it down (subject, style, camera, lighting, motion, audio) and returns a master prompt, a negative
   prompt, **3–5 recommended platforms** (Veo, Sora, Runway, Kling, Midjourney, HeyGen…) each with a tailored prompt and
   settings, and a step-by-step workflow.
2. **AI Site & App Detector** — paste a website, App Store or Google Play link. It scans builder fingerprints
   (Lovable, Bolt, v0, Base44, Replit, Manus, Durable, Framer, Webflow, Wix, Shopify…), the tech stack and the content,
   gives a calibrated **"made with AI?" verdict with evidence**, and a rebuild guide: best platform, steps and
   copy-paste prompts to build something similar.

```
web/      Next.js 15 site + API routes (the SaaS backend)
  src/app/api/media-prompt   POST  frames | url  -> prompts + platforms
  src/app/api/analyze-site   POST  url           -> verdict + rebuild guide
  src/lib/fingerprints.ts    deterministic AI-builder / CMS / framework signals
  src/lib/safeFetch.ts       SSRF-safe fetcher (blocks private IPs, re-checks redirects, size/time caps)
  src/lib/claude.ts          Claude structured-output call (Zod schemas in schemas.ts)
mobile/   Expo (SDK 58) React Native app for iOS + Android, calls the web API
```

## How it works

- **Videos are never uploaded whole.** The browser (canvas) or phone (`expo-video-thumbnails`) samples 6 evenly spaced
  frames, downsized to 1024px JPEGs, and sends only those. Cheap, fast, private.
- **Social links** use the page's preview image + caption (the full video isn't downloadable without the platform's API).
- **Detection = fingerprints + AI judgment.** Hard signals (e.g. `*.lovable.app`, Lovable/Base44 scripts, Framer
  generator tag) are computed in code, then Claude weighs them with the page content. Results are an *estimate*, never
  proof — exported AI-builder code can be re-hosted anywhere, and the UI says so.
- Claude is called with structured outputs (Zod-validated JSON) and server-side refusal fallbacks enabled.

## Run locally

```bash
# Web + API
cd web && cp .env.example .env.local   # put your ANTHROPIC_API_KEY in it
npm install && npm run dev              # http://localhost:3000

# Mobile (in another terminal)
cd mobile && cp .env.example .env       # set EXPO_PUBLIC_API_URL to your computer's LAN IP:3000 or deployed URL
npm install && npx expo start           # scan the QR code with Expo Go
```

## Deploy

- **Web/API:** Vercel (zero-config for Next.js). Add `ANTHROPIC_API_KEY` as an env var.
- **Mobile:** `npx eas-cli@latest build -p all` then `eas submit` to the App Store / Play Store. Set
  `EXPO_PUBLIC_API_URL` to the production web URL.

## Roadmap to a full SaaS

| Area | Suggestion |
|---|---|
| Auth | Clerk or Supabase Auth (web + Expo SDKs) |
| Billing | Stripe subscriptions + credits (e.g. Free: 5 analyses/day, Pro: unlimited); RevenueCat for in-app purchases on mobile |
| History | Postgres (Supabase/Neon) table of past analyses; "My prompts" library, share links |
| Rate limiting | Replace the in-memory limiter (`web/src/lib/rateLimit.ts`) with Upstash Redis before multi-instance deploy |
| Better detection | Headless-browser rendering (Playwright) for SPA sites; screenshot analysis; sitemap/robots/JS-bundle inspection |
| Video links | Official APIs (YouTube Data API) or oEmbed for richer metadata; server-side ffmpeg for direct .mp4 links |
| Extras | Prompt "remix" (change style/aspect), one-click send to platforms, team workspaces, browser extension |

## Responsible use

- The prompt generator won't write prompts that impersonate a real, identifiable person.
- The rebuild guide describes how to build something *similar* — not to copy another product's brand, text or assets.

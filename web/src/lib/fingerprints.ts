import * as cheerio from "cheerio";

export interface Signal {
  signal: string;
  platform: string;
  strength: "strong" | "medium" | "weak";
  aiBuilder: boolean;
}

interface Rule {
  platform: string;
  aiBuilder: boolean;
  strength: Signal["strength"];
  host?: RegExp;
  html?: RegExp;
  header?: [string, RegExp];
  label: string;
}

/**
 * Deterministic fingerprints. These are evidence, not proof: anything built on these
 * platforms can be exported and re-hosted, and any site can be hand-written to look
 * like one. Claude weighs these together with the page content.
 */
const RULES: Rule[] = [
  // ---- AI app / site builders ----
  { platform: "Lovable", aiBuilder: true, strength: "strong", host: /\.lovable\.(app|dev)$/i, label: "Hosted on lovable.app" },
  { platform: "Lovable", aiBuilder: true, strength: "strong", html: /lovable-tagger|gptengineer\.js|cdn\.gpteng\.co|lovable\.dev\/opengraph/i, label: "Lovable / GPT Engineer script or asset" },
  { platform: "Bolt.new", aiBuilder: true, strength: "strong", host: /\.bolt\.(new|host)$/i, label: "Hosted on bolt.new / bolt.host" },
  { platform: "Bolt.new", aiBuilder: true, strength: "medium", html: /bolt\.new|stackblitz/i, label: "Bolt / StackBlitz reference in page" },
  { platform: "v0 (Vercel)", aiBuilder: true, strength: "strong", host: /\.v0\.(dev|app)$|vusercontent\.net$/i, label: "Hosted on v0 domain" },
  { platform: "v0 (Vercel)", aiBuilder: true, strength: "medium", html: /generator"\s+content="v0|v0\.dev|v0\.app/i, label: "v0 generator meta / reference" },
  { platform: "Replit Agent", aiBuilder: true, strength: "medium", host: /\.replit\.(app|dev)$|\.repl\.co$/i, label: "Hosted on Replit" },
  { platform: "Base44", aiBuilder: true, strength: "strong", host: /\.base44\.app$/i, label: "Hosted on base44.app" },
  { platform: "Base44", aiBuilder: true, strength: "medium", html: /base44/i, label: "Base44 SDK / asset reference" },
  { platform: "Manus", aiBuilder: true, strength: "strong", host: /\.manus\.(space|im)$/i, label: "Hosted on Manus" },
  { platform: "Same.new", aiBuilder: true, strength: "medium", host: /\.same-app\.com$|\.same\.new$/i, label: "Hosted on Same" },
  { platform: "Create.xyz / Anything", aiBuilder: true, strength: "strong", host: /\.created\.app$/i, label: "Hosted on created.app" },
  { platform: "Softgen", aiBuilder: true, strength: "medium", html: /softgen/i, label: "Softgen reference" },
  { platform: "Durable", aiBuilder: true, strength: "strong", html: /durable\.co|durablesites/i, label: "Durable AI website builder assets" },
  { platform: "10Web AI Builder", aiBuilder: true, strength: "medium", html: /10web/i, label: "10Web assets" },
  { platform: "Hostinger AI Builder", aiBuilder: true, strength: "medium", html: /zyrosite|zyro\.com/i, label: "Hostinger / Zyro builder assets" },
  { platform: "Mocha", aiBuilder: true, strength: "strong", host: /\.mocha\.app$/i, label: "Hosted on Mocha" },
  { platform: "Firebase Studio", aiBuilder: true, strength: "weak", host: /\.web\.app$|\.firebaseapp\.com$/i, label: "Firebase Hosting (used by Firebase Studio, also by hand-built apps)" },

  // ---- No-code builders (often with AI features) ----
  { platform: "Framer", aiBuilder: false, strength: "strong", html: /generator"\s+content="Framer|framerusercontent\.com/i, label: "Framer generator / assets" },
  { platform: "Webflow", aiBuilder: false, strength: "strong", html: /data-wf-site|webflow\.js|website-files\.com/i, label: "Webflow markup" },
  { platform: "Wix", aiBuilder: false, strength: "strong", html: /static\.wixstatic\.com|wix-bolt|_wixCIDX/i, label: "Wix assets" },
  { platform: "Squarespace", aiBuilder: false, strength: "strong", html: /static1\.squarespace\.com|squarespace-cdn/i, label: "Squarespace assets" },
  { platform: "Shopify", aiBuilder: false, strength: "strong", html: /cdn\.shopify\.com|Shopify\.theme/i, label: "Shopify storefront" },
  { platform: "WordPress", aiBuilder: false, strength: "strong", html: /wp-content\/|wp-includes\//i, label: "WordPress paths" },
  { platform: "Bubble", aiBuilder: false, strength: "strong", html: /bubble\.io|bubbleapps\.io|meta name="bubble/i, label: "Bubble app" },
  { platform: "Carrd", aiBuilder: false, strength: "strong", html: /carrd\.co/i, label: "Carrd" },
  { platform: "Softr", aiBuilder: false, strength: "medium", html: /softr\.io/i, label: "Softr" },
  { platform: "FlutterFlow", aiBuilder: false, strength: "medium", html: /flutterflow/i, label: "FlutterFlow" },

  // ---- Frameworks / hosting (neutral, but shape the rebuild advice) ----
  { platform: "Next.js", aiBuilder: false, strength: "weak", html: /\/_next\/static|__NEXT_DATA__/i, label: "Next.js build output" },
  { platform: "Vite + React", aiBuilder: false, strength: "weak", html: /\/assets\/index-[\w-]+\.js|type="module" crossorigin src="\/assets\//i, label: "Vite bundle (default for Lovable/Bolt exports, also common hand-built)" },
  { platform: "Flutter Web", aiBuilder: false, strength: "medium", html: /flutter\.js|flutter_bootstrap/i, label: "Flutter web" },
  { platform: "Vercel", aiBuilder: false, strength: "weak", header: ["server", /vercel/i], label: "Served by Vercel" },
  { platform: "Netlify", aiBuilder: false, strength: "weak", header: ["server", /netlify/i], label: "Served by Netlify (Bolt deploys here by default)" },
  { platform: "Cloudflare", aiBuilder: false, strength: "weak", header: ["server", /cloudflare/i], label: "Behind Cloudflare" },
];

/** Weak style hints common in AI-generated React apps (shadcn/ui + Tailwind + lucide). */
const STYLE_HINTS: [RegExp, string][] = [
  [/lucide/i, "lucide icons"],
  [/data-radix|radix-ui/i, "Radix UI primitives (shadcn/ui)"],
  [/bg-gradient-to-[a-z]+ from-(purple|violet|indigo)-/i, "purple/indigo Tailwind gradients"],
  [/supabase\.co/i, "Supabase backend"],
];

export function fingerprint(html: string, host: string, headers: Record<string, string>): Signal[] {
  const out: Signal[] = [];
  const seen = new Set<string>();
  for (const r of RULES) {
    const hit =
      (r.host && r.host.test(host)) ||
      (r.html && r.html.test(html)) ||
      (r.header && r.header[1].test(headers[r.header[0]] ?? ""));
    if (hit && !seen.has(r.label)) {
      seen.add(r.label);
      out.push({ signal: r.label, platform: r.platform, strength: r.strength, aiBuilder: r.aiBuilder });
    }
  }
  for (const [re, label] of STYLE_HINTS) {
    if (re.test(html)) out.push({ signal: label, platform: "style", strength: "weak", aiBuilder: false });
  }
  return out;
}

export interface PageDigest {
  title: string;
  description: string;
  generator: string;
  headings: string[];
  text: string;
  scripts: string[];
  ogImage: string;
}

/** Reduce raw HTML to a compact digest for the model. */
export function digestHtml(html: string, baseUrl: URL): PageDigest {
  const $ = cheerio.load(html);
  const meta = (sel: string) => $(sel).attr("content")?.trim() ?? "";
  const scripts = $("script[src]")
    .map((_, el) => {
      try {
        return new URL($(el).attr("src")!, baseUrl).toString();
      } catch {
        return "";
      }
    })
    .get()
    .filter(Boolean)
    .slice(0, 25);
  $("script, style, noscript, svg").remove();
  const headings = $("h1, h2, h3")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean)
    .slice(0, 30);
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 6000);
  return {
    title: $("title").first().text().trim(),
    description: meta('meta[name="description"]') || meta('meta[property="og:description"]'),
    generator: meta('meta[name="generator"]'),
    headings,
    text,
    scripts,
    ogImage: meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]'),
  };
}

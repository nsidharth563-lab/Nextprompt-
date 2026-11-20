import { lookup } from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 4;

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateIp(v6.slice(7));
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe80")
  );
}

/** Validate a user-supplied URL and make sure it doesn't point at internal infrastructure (SSRF guard). */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim().match(/^https?:\/\//i) ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    throw new UserInputError("That doesn't look like a valid URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new UserInputError("Only http(s) links are supported.");
  }
  if (url.username || url.password) throw new UserInputError("URLs with credentials are not allowed.");
  const addrs = await lookup(url.hostname, { all: true }).catch(() => {
    throw new UserInputError(`Could not resolve ${url.hostname}.`);
  });
  if (addrs.some((a) => isPrivateIp(a.address))) {
    throw new UserInputError("That address is not publicly reachable.");
  }
  return url;
}

export class UserInputError extends Error {}

export interface FetchedPage {
  finalUrl: URL;
  status: number;
  headers: Record<string, string>;
  contentType: string;
  body: Buffer;
}

/** Fetch a public URL with redirect re-validation, a timeout and a size cap. */
export async function safeFetch(raw: string, accept = "text/html,*/*"): Promise<FetchedPage> {
  let url = await assertPublicUrl(raw);
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; NextPromptBot/1.0)",
        accept,
      },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = await assertPublicUrl(new URL(res.headers.get("location")!, url).toString());
      continue;
    }
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => (headers[k] = v));
    return {
      finalUrl: url,
      status: res.status,
      headers,
      contentType: res.headers.get("content-type") ?? "",
      body: Buffer.concat(chunks),
    };
  }
  throw new UserInputError("Too many redirects.");
}

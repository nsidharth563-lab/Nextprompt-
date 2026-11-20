import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { Frame } from "./types";

// Point this at your deployed web app (e.g. https://nextprompt.vercel.app).
// For local dev on a device, use your computer's LAN IP, e.g. http://192.168.1.20:3000
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: "Unexpected server response." }));
  if (!res.ok) throw new Error(json.error ?? "Request failed.");
  return json as T;
}

const MAX_SIDE = 1024;

async function toJpegFrame(uri: string, width?: number, height?: number): Promise<Frame> {
  const ctx = ImageManipulator.manipulate(uri);
  if (width && height && Math.max(width, height) > MAX_SIDE) {
    ctx.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  } else if (!width || !height) {
    ctx.resize({ width: MAX_SIDE });
  }
  const image = await ctx.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  if (!saved.base64) throw new Error("Couldn't encode image.");
  return { mediaType: "image/jpeg", data: saved.base64 };
}

/** Converts a picked asset into frames: 1 for a photo, up to 6 evenly spaced for a video. */
export async function assetToFrames(asset: ImagePicker.ImagePickerAsset): Promise<{ frames: Frame[]; kind: "image" | "video" }> {
  if (asset.type === "video") {
    const durationMs = asset.duration ?? 0;
    const count = durationMs > 0 ? 6 : 1;
    const frames: Frame[] = [];
    for (let i = 0; i < count; i++) {
      const time = Math.floor((durationMs * (i + 0.5)) / count);
      const thumb = await VideoThumbnails.getThumbnailAsync(asset.uri, { time, quality: 0.8 });
      frames.push(await toJpegFrame(thumb.uri, thumb.width, thumb.height));
    }
    return { frames, kind: "video" };
  }
  return { frames: [await toJpegFrame(asset.uri, asset.width, asset.height)], kind: "image" };
}

export async function pickMedia(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Allow photo library access to pick media.");
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], quality: 1 });
  return res.canceled ? null : res.assets[0];
}

import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { Frame } from "./types";

import { API_URL } from "./config";

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach NextPrompt. Check your internet connection and try again.");
  }
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
  // The system photo picker needs no library permission on iOS 14+ / Android 13+.
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], quality: 1 });
  return res.canceled ? null : res.assets[0];
}

export async function takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error("Allow camera access in Settings to take a photo.");
  const res = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 });
  return res.canceled ? null : res.assets[0];
}

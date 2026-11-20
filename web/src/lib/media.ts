"use client";

export interface Frame {
  mediaType: "image/jpeg";
  data: string; // base64, no data: prefix
}

const MAX_SIDE = 1024;

function canvasToFrame(canvas: HTMLCanvasElement): Frame {
  return { mediaType: "image/jpeg", data: canvas.toDataURL("image/jpeg", 0.82).split(",")[1] };
}

function drawScaled(src: CanvasImageSource, w: number, h: number): HTMLCanvasElement {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Downscale an uploaded image to a JPEG frame. */
export async function imageToFrame(file: File): Promise<Frame> {
  const bitmap = await createImageBitmap(file);
  const frame = canvasToFrame(drawScaled(bitmap, bitmap.width, bitmap.height));
  bitmap.close();
  return frame;
}

/** Sample `count` evenly spaced frames from an uploaded video, entirely in the browser. */
export async function videoToFrames(file: File, count = 6): Promise<Frame[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise<void>((res, rej) => {
      video.onloadedmetadata = () => res();
      video.onerror = () => rej(new Error("This video format isn't supported by your browser."));
    });
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const frames: Frame[] = [];
    for (let i = 0; i < count; i++) {
      const t = duration ? (duration * (i + 0.5)) / count : 0;
      await new Promise<void>((res, rej) => {
        video.onseeked = () => res();
        video.onerror = () => rej(new Error("Couldn't read frames from this video."));
        video.currentTime = t;
      });
      frames.push(canvasToFrame(drawScaled(video, video.videoWidth, video.videoHeight)));
      if (!duration) break;
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

import { isVideoPreview } from "@/lib/api/ads";

export function ratioLabel(ratio: number): string {
  if (Math.abs(ratio - 16 / 9) < 0.01) return "16:9";
  if (Math.abs(ratio - 2 / 3) < 0.01) return "2:3";
  if (Math.abs(ratio - 1) < 0.01) return "1:1";
  return ratio.toFixed(2);
}

type MediaSize = { width: number; height: number };

export function readMediaSize(file: File): Promise<MediaSize | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const done = (size: MediaSize | null) => {
      URL.revokeObjectURL(url);
      resolve(size);
    };
    if (isVideoPreview(file)) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () =>
        done(video.videoWidth ? { width: video.videoWidth, height: video.videoHeight } : null);
      video.onerror = () => done(null);
      video.src = url;
      return;
    }
    const img = new Image();
    img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => done(null);
    img.src = url;
  });
}

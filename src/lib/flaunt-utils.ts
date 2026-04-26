import type { HistoryEntry } from "./flaunt-types";

const HISTORY_KEY = "flaunt_history_v1";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const history = loadHistory();
  const updated = [full, ...history].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return full;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export async function processImage(file: File): Promise<{
  base64: string;
  mimeType: string;
  previewDataUrl: string;
  thumbnailDataUrl: string;
}> {
  const MAX_DIMENSION = 1200;
  const THUMBNAIL_DIMENSION = 200;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Main image
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, w, h);
      const previewDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = previewDataUrl.split(",")[1] || "";

      // Thumbnail
      const thumbScale = Math.min(1, THUMBNAIL_DIMENSION / Math.max(img.width, img.height));
      const tw = Math.round(img.width * thumbScale);
      const th = Math.round(img.height * thumbScale);
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = tw;
      thumbCanvas.height = th;
      const thumbCtx = thumbCanvas.getContext("2d");
      if (!thumbCtx) return reject(new Error("No thumbnail context"));
      thumbCtx.drawImage(img, 0, 0, tw, th);
      const thumbnailDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.6);

      resolve({ base64, mimeType: "image/jpeg", previewDataUrl, thumbnailDataUrl });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function verdictTone(verdict: string): {
  emoji: string;
  label: string;
  bg: string;
  text: string;
} {
  switch (verdict) {
    case "yes":
      return {
        emoji: "✅",
        label: "It's a Yes",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        text: "text-emerald-400",
      };
    case "maybe":
      return {
        emoji: "🤔",
        label: "With a Fix",
        bg: "bg-amber-500/10 border-amber-500/30",
        text: "text-amber-400",
      };
    case "no":
    default:
      return {
        emoji: "❌",
        label: "Needs Work",
        bg: "bg-rose-500/10 border-rose-500/30",
        text: "text-rose-400",
      };
  }
}

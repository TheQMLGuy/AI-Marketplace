import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

function canvasConvert(
  targetType: string,
  quality?: number
): ConverterFn {
  return async (file, options) => {
    const q = (options.quality as number ?? quality ?? 90) / 100;
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const blob = await canvas.convertToBlob({ type: targetType, quality: q });
    bitmap.close();
    return blob;
  };
}

const formats: { ext: string; mime: string; label: string; hasQuality: boolean }[] = [
  { ext: ".png", mime: "image/png", label: "PNG", hasQuality: false },
  { ext: ".jpg", mime: "image/jpeg", label: "JPG", hasQuality: true },
  { ext: ".webp", mime: "image/webp", label: "WebP", hasQuality: true },
  { ext: ".bmp", mime: "image/bmp", label: "BMP", hasQuality: false },
  { ext: ".gif", mime: "image/gif", label: "GIF", hasQuality: false },
];

const inputExts = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".tiff", ".avif", ".svg"];

for (const target of formats) {
  registerTool(
    {
      slug: `convert-to-${target.label.toLowerCase()}`,
      name: `Convert to ${target.label}`,
      description: `Convert any image to ${target.label} format`,
      categorySlug: "image",
      acceptedExtensions: inputExts,
      outputExtension: target.ext,
      options: target.hasQuality
        ? [{ name: "quality", label: "Quality (%)", type: "number", default: 90, min: 1, max: 100, step: 1 }]
        : [],
      maxFileSizeMB: 50,
    },
    canvasConvert(target.mime, 90)
  );
}

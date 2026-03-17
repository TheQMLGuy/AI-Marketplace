import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const converter: ConverterFn = async (file, options) => {
  const width = Number(options.width) || 800;
  const height = Number(options.height) || 600;
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await canvas.convertToBlob({ type: "image/png" });
  bitmap.close();
  return blob;
};

registerTool(
  {
    slug: "image-resize",
    name: "Resize Image",
    description: "Resize images to specific dimensions",
    categorySlug: "image",
    acceptedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".svg"],
    outputExtension: ".png",
    options: [
      { name: "width", label: "Width (px)", type: "number", default: 800, min: 1, max: 10000 },
      { name: "height", label: "Height (px)", type: "number", default: 600, min: 1, max: 10000 },
    ],
    maxFileSizeMB: 50,
  },
  converter
);

import imageCompression from "browser-image-compression";
import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const converter: ConverterFn = async (file, options) => {
  const maxSizeMB = Number(options.maxSizeMB) || 1;
  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight: Number(options.maxDimension) || 4096,
    useWebWorker: true,
  });
  return compressed;
};

registerTool(
  {
    slug: "image-compress",
    name: "Compress Image",
    description: "Reduce image file size while maintaining quality",
    categorySlug: "image",
    acceptedExtensions: [".png", ".jpg", ".jpeg", ".webp", ".bmp"],
    outputExtension: ".jpg",
    options: [
      { name: "maxSizeMB", label: "Target max size (MB)", type: "number", default: 1, min: 0.1, max: 50, step: 0.1 },
      { name: "maxDimension", label: "Max width/height (px)", type: "number", default: 4096, min: 100, max: 10000 },
    ],
    maxFileSizeMB: 50,
  },
  converter
);

import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

function loadSvgAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG"));
    };
    img.src = url;
  });
}

function svgToRaster(mime: string): ConverterFn {
  return async (file, options) => {
    const quality = ((options.quality as number) ?? 90) / 100;
    const scale = (options.scale as number) ?? 1;
    const img = await loadSvgAsImage(file);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.convertToBlob({ type: mime, quality });
  };
}

// SVG to PNG
registerTool(
  {
    slug: "svg-to-png",
    name: "SVG to PNG",
    description: "Render an SVG file to a PNG image",
    categorySlug: "image",
    acceptedExtensions: [".svg"],
    outputExtension: ".png",
    options: [
      { name: "scale", label: "Scale factor", type: "number", default: 1, min: 0.1, max: 10, step: 0.1 },
    ],
    maxFileSizeMB: 20,
  },
  svgToRaster("image/png")
);

// SVG to JPG
registerTool(
  {
    slug: "svg-to-jpg",
    name: "SVG to JPG",
    description: "Render an SVG file to a JPG image",
    categorySlug: "image",
    acceptedExtensions: [".svg"],
    outputExtension: ".jpg",
    options: [
      { name: "quality", label: "Quality (%)", type: "number", default: 90, min: 1, max: 100, step: 1 },
      { name: "scale", label: "Scale factor", type: "number", default: 1, min: 0.1, max: 10, step: 0.1 },
    ],
    maxFileSizeMB: 20,
  },
  svgToRaster("image/jpeg")
);

// SVG optimizer/minifier
const svgOptimize: ConverterFn = async (file) => {
  let text = await file.text();
  // Remove XML comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  // Remove unnecessary whitespace between tags
  text = text.replace(/>\s+</g, "><");
  // Collapse multiple spaces/newlines into single space
  text = text.replace(/\s{2,}/g, " ");
  // Trim
  text = text.trim();
  return new Blob([text], { type: "image/svg+xml" });
};

registerTool(
  {
    slug: "svg-optimize",
    name: "SVG Optimizer",
    description: "Minify SVG by removing comments and collapsing whitespace",
    categorySlug: "image",
    acceptedExtensions: [".svg"],
    outputExtension: ".svg",
    options: [],
    maxFileSizeMB: 10,
  },
  svgOptimize
);

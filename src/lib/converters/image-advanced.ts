import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const imageExts = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".tiff", ".avif"];

function loadImage(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

// Image to ICO (favicon generator)
const imageToIco: ConverterFn = async (file, options) => {
  const size = (options.size as number) ?? 32;
  const bitmap = await loadImage(file);
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, size, size);
  bitmap.close();
  // Export as PNG since true ICO encoding is complex; .ico wrapping not feasible client-side
  return canvas.convertToBlob({ type: "image/png" });
};

registerTool(
  {
    slug: "image-to-ico",
    name: "Image to ICO (Favicon)",
    description: "Generate a favicon-sized PNG from any image (32x32 or 48x48)",
    categorySlug: "image",
    acceptedExtensions: imageExts,
    outputExtension: ".png",
    options: [
      {
        name: "size",
        label: "Size (px)",
        type: "select",
        default: "32",
        choices: [
          { label: "16x16", value: "16" },
          { label: "32x32", value: "32" },
          { label: "48x48", value: "48" },
          { label: "64x64", value: "64" },
        ],
      },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const size = Number(options.size ?? 32);
    return imageToIco(file, { size });
  }
);

// Image crop
registerTool(
  {
    slug: "image-crop",
    name: "Crop Image",
    description: "Crop an image to a specified region (x, y, width, height)",
    categorySlug: "image",
    acceptedExtensions: imageExts,
    outputExtension: ".png",
    options: [
      { name: "x", label: "X offset (px)", type: "number", default: 0, min: 0, max: 10000, step: 1 },
      { name: "y", label: "Y offset (px)", type: "number", default: 0, min: 0, max: 10000, step: 1 },
      { name: "width", label: "Width (px)", type: "number", default: 100, min: 1, max: 10000, step: 1 },
      { name: "height", label: "Height (px)", type: "number", default: 100, min: 1, max: 10000, step: 1 },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const x = (options.x as number) ?? 0;
    const y = (options.y as number) ?? 0;
    const w = (options.width as number) ?? 100;
    const h = (options.height as number) ?? 100;
    const bitmap = await loadImage(file);
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, x, y, w, h, 0, 0, w, h);
    bitmap.close();
    return canvas.convertToBlob({ type: "image/png" });
  }
);

// Grayscale filter
registerTool(
  {
    slug: "image-grayscale",
    name: "Grayscale Image",
    description: "Convert an image to grayscale using pixel manipulation",
    categorySlug: "image",
    acceptedExtensions: imageExts,
    outputExtension: ".png",
    options: [],
    maxFileSizeMB: 50,
  },
  async (file) => {
    const bitmap = await loadImage(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.convertToBlob({ type: "image/png" });
  }
);

// Blur image
registerTool(
  {
    slug: "image-blur",
    name: "Blur Image",
    description: "Apply a Gaussian blur to an image",
    categorySlug: "image",
    acceptedExtensions: imageExts,
    outputExtension: ".png",
    options: [
      { name: "radius", label: "Blur radius (px)", type: "number", default: 5, min: 1, max: 100, step: 1 },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const radius = (options.radius as number) ?? 5;
    const bitmap = await loadImage(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.filter = `blur(${radius}px)`;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvas.convertToBlob({ type: "image/png" });
  }
);

// Rotate image
registerTool(
  {
    slug: "image-rotate",
    name: "Rotate Image",
    description: "Rotate an image by 90, 180, or 270 degrees",
    categorySlug: "image",
    acceptedExtensions: imageExts,
    outputExtension: ".png",
    options: [
      {
        name: "degrees",
        label: "Rotation",
        type: "select",
        default: "90",
        choices: [
          { label: "90° clockwise", value: "90" },
          { label: "180°", value: "180" },
          { label: "270° clockwise", value: "270" },
        ],
      },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const degrees = Number(options.degrees ?? 90);
    const bitmap = await loadImage(file);
    const swap = degrees === 90 || degrees === 270;
    const w = swap ? bitmap.height : bitmap.width;
    const h = swap ? bitmap.width : bitmap.height;
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    ctx.translate(w / 2, h / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    bitmap.close();
    return canvas.convertToBlob({ type: "image/png" });
  }
);

// Flip image
registerTool(
  {
    slug: "image-flip",
    name: "Flip Image",
    description: "Flip an image horizontally or vertically",
    categorySlug: "image",
    acceptedExtensions: imageExts,
    outputExtension: ".png",
    options: [
      {
        name: "direction",
        label: "Direction",
        type: "select",
        default: "horizontal",
        choices: [
          { label: "Horizontal", value: "horizontal" },
          { label: "Vertical", value: "vertical" },
        ],
      },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const direction = (options.direction as string) ?? "horizontal";
    const bitmap = await loadImage(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    if (direction === "horizontal") {
      ctx.translate(bitmap.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, bitmap.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvas.convertToBlob({ type: "image/png" });
  }
);

// Image to Base64 data URI
registerTool(
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    description: "Convert an image to a Base64 data URI text file",
    categorySlug: "image",
    acceptedExtensions: imageExts,
    outputExtension: ".txt",
    options: [],
    maxFileSizeMB: 10,
  },
  async (file) => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${base64}`;
    return new Blob([dataUri], { type: "text/plain" });
  }
);

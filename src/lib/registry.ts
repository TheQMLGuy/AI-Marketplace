import { ToolDefinition, Category, ConverterFn } from "./types";

const tools = new Map<string, ToolDefinition>();
const converters = new Map<string, ConverterFn>();

const categories: Category[] = [
  { slug: "image", name: "Image", description: "Convert, resize, and compress images between PNG, JPG, WebP, GIF, BMP, TIFF, AVIF, SVG", icon: "Image" },
  { slug: "document", name: "Document", description: "Convert between PDF, DOCX, TXT, RTF, and other document formats", icon: "FileText" },
  { slug: "spreadsheet", name: "Spreadsheet", description: "Convert between CSV, XLSX, TSV, and other tabular data formats", icon: "Table" },
  { slug: "presentation", name: "Presentation", description: "Convert presentation formats", icon: "Presentation" },
  { slug: "ebook", name: "Ebook", description: "Convert between EPUB, MOBI, and other ebook formats", icon: "BookOpen" },
  { slug: "audio", name: "Audio", description: "Convert between MP3, WAV, OGG, FLAC, AAC, and other audio formats", icon: "Music" },
  { slug: "video", name: "Video", description: "Convert between MP4, WebM, AVI, MOV, GIF, and other video formats", icon: "Video" },
  { slug: "archive", name: "Archive", description: "Create and extract ZIP, TAR, GZ, and other archive formats", icon: "Archive" },
  { slug: "font", name: "Font", description: "Convert between TTF, OTF, WOFF, WOFF2 font formats", icon: "Type" },
  { slug: "vector", name: "Vector", description: "Convert between SVG, EPS, and other vector formats", icon: "PenTool" },
  { slug: "web", name: "Web", description: "Convert web formats — HTML, Markdown, JSON, YAML, XML", icon: "Globe" },
];

export function registerTool(def: ToolDefinition, fn: ConverterFn) {
  tools.set(def.slug, def);
  converters.set(def.slug, fn);
}

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.get(slug);
}

export function getConverter(slug: string): ConverterFn | undefined {
  return converters.get(slug);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(tools.values());
}

export function getToolsByCategory(categorySlug: string): ToolDefinition[] {
  return Array.from(tools.values()).filter(
    (t) => t.categorySlug === categorySlug
  );
}

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

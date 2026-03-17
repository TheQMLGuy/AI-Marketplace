import { registerTool } from "../registry";

const textExts = [".json", ".css", ".js", ".html", ".htm", ".xml", ".txt"];

// JSON formatter/prettifier
registerTool(
  {
    slug: "json-format",
    name: "JSON Formatter",
    description: "Format and prettify a JSON file with configurable indentation",
    categorySlug: "web",
    acceptedExtensions: [".json"],
    outputExtension: ".json",
    options: [
      { name: "indent", label: "Indent spaces", type: "number", default: 2, min: 1, max: 8, step: 1 },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const indent = (options.indent as number) ?? 2;
    const text = await file.text();
    const parsed = JSON.parse(text);
    const result = JSON.stringify(parsed, null, indent);
    return new Blob([result], { type: "application/json" });
  }
);

// JSON minifier
registerTool(
  {
    slug: "json-minify",
    name: "JSON Minifier",
    description: "Minify a JSON file by removing all unnecessary whitespace",
    categorySlug: "web",
    acceptedExtensions: [".json"],
    outputExtension: ".json",
    options: [],
    maxFileSizeMB: 50,
  },
  async (file) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const result = JSON.stringify(parsed);
    return new Blob([result], { type: "application/json" });
  }
);

// CSS minifier
registerTool(
  {
    slug: "css-minify",
    name: "CSS Minifier",
    description: "Minify CSS by removing comments, collapsing whitespace",
    categorySlug: "web",
    acceptedExtensions: [".css"],
    outputExtension: ".css",
    options: [],
    maxFileSizeMB: 20,
  },
  async (file) => {
    let text = await file.text();
    // Remove comments
    text = text.replace(/\/\*[\s\S]*?\*\//g, "");
    // Remove newlines and collapse whitespace
    text = text.replace(/\s+/g, " ");
    // Remove spaces around special chars
    text = text.replace(/\s*([{}:;,>~+])\s*/g, "$1");
    text = text.trim();
    return new Blob([text], { type: "text/css" });
  }
);

// CSS formatter/prettifier
registerTool(
  {
    slug: "css-format",
    name: "CSS Formatter",
    description: "Prettify CSS by adding newlines and indentation",
    categorySlug: "web",
    acceptedExtensions: [".css"],
    outputExtension: ".css",
    options: [],
    maxFileSizeMB: 20,
  },
  async (file) => {
    let text = await file.text();
    // Normalize whitespace
    text = text.replace(/\s+/g, " ");
    // Add newline after { and ;
    text = text.replace(/\{/g, " {\n  ");
    text = text.replace(/;\s*/g, ";\n  ");
    text = text.replace(/\}\s*/g, "\n}\n");
    // Clean up extra whitespace
    text = text.replace(/\n\s*\n/g, "\n");
    text = text.trim();
    return new Blob([text], { type: "text/css" });
  }
);

// JavaScript minifier
registerTool(
  {
    slug: "js-minify",
    name: "JavaScript Minifier",
    description: "Basic JS minification: remove comments and collapse whitespace",
    categorySlug: "web",
    acceptedExtensions: [".js"],
    outputExtension: ".js",
    options: [],
    maxFileSizeMB: 20,
  },
  async (file) => {
    let text = await file.text();
    // Remove single-line comments (careful with URLs)
    text = text.replace(/(?<![:"'])\/\/.*$/gm, "");
    // Remove multi-line comments
    text = text.replace(/\/\*[\s\S]*?\*\//g, "");
    // Collapse whitespace
    text = text.replace(/\s+/g, " ");
    text = text.trim();
    return new Blob([text], { type: "application/javascript" });
  }
);

// HTML minifier
registerTool(
  {
    slug: "html-minify",
    name: "HTML Minifier",
    description: "Minify HTML by removing comments and collapsing whitespace",
    categorySlug: "web",
    acceptedExtensions: [".html", ".htm"],
    outputExtension: ".html",
    options: [],
    maxFileSizeMB: 20,
  },
  async (file) => {
    let text = await file.text();
    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, "");
    // Collapse whitespace between tags
    text = text.replace(/>\s+</g, "><");
    // Collapse remaining whitespace
    text = text.replace(/\s+/g, " ");
    text = text.trim();
    return new Blob([text], { type: "text/html" });
  }
);

// URL encode/decode
registerTool(
  {
    slug: "url-encode",
    name: "URL Encode/Decode",
    description: "URL-encode or decode text content",
    categorySlug: "web",
    acceptedExtensions: [".txt"],
    outputExtension: ".txt",
    options: [
      {
        name: "mode",
        label: "Mode",
        type: "select",
        default: "encode",
        choices: [
          { label: "Encode", value: "encode" },
          { label: "Decode", value: "decode" },
        ],
      },
    ],
    maxFileSizeMB: 10,
  },
  async (file, options) => {
    const mode = (options.mode as string) ?? "encode";
    const text = await file.text();
    const result = mode === "encode" ? encodeURIComponent(text) : decodeURIComponent(text);
    return new Blob([result], { type: "text/plain" });
  }
);

// HTML entities encode/decode
registerTool(
  {
    slug: "html-entities",
    name: "HTML Entities Encode/Decode",
    description: "Encode or decode HTML entities in text",
    categorySlug: "web",
    acceptedExtensions: [".txt", ".html", ".htm"],
    outputExtension: ".txt",
    options: [
      {
        name: "mode",
        label: "Mode",
        type: "select",
        default: "encode",
        choices: [
          { label: "Encode", value: "encode" },
          { label: "Decode", value: "decode" },
        ],
      },
    ],
    maxFileSizeMB: 10,
  },
  async (file, options) => {
    const mode = (options.mode as string) ?? "encode";
    const text = await file.text();
    let result: string;
    if (mode === "encode") {
      result = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    } else {
      result = text
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<")
        .replace(/&amp;/g, "&");
    }
    return new Blob([result], { type: "text/plain" });
  }
);

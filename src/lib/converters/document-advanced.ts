import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

// TXT to HTML
registerTool(
  {
    slug: "txt-to-html",
    name: "TXT to HTML",
    description: "Wrap plain text in a basic HTML document with line breaks",
    categorySlug: "document",
    acceptedExtensions: [".txt"],
    outputExtension: ".html",
    options: [],
    maxFileSizeMB: 20,
  },
  async (file) => {
    const text = await file.text();
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>\n");
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${file.name}</title></head>
<body>
<p>${escaped}</p>
</body>
</html>`;
    return new Blob([html], { type: "text/html" });
  }
);

// TXT to PDF
registerTool(
  {
    slug: "txt-to-pdf",
    name: "TXT to PDF",
    description: "Convert a plain text file to a PDF document",
    categorySlug: "document",
    acceptedExtensions: [".txt"],
    outputExtension: ".pdf",
    options: [
      { name: "fontSize", label: "Font size", type: "number", default: 12, min: 6, max: 36, step: 1 },
    ],
    maxFileSizeMB: 10,
  },
  async (file, options) => {
    const { jsPDF } = await import("jspdf");
    const fontSize = (options.fontSize as number) ?? 12;
    const text = await file.text();
    const doc = new jsPDF();
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, 180);
    const lineHeight = fontSize * 0.5;
    const pageHeight = 280;
    let y = 20;
    for (const line of lines) {
      if (y + lineHeight > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += lineHeight;
    }
    const arrayBuffer = doc.output("arraybuffer");
    return new Blob([arrayBuffer], { type: "application/pdf" });
  }
);

// Word count tool
registerTool(
  {
    slug: "word-count",
    name: "Word Count",
    description: "Count words, characters, and lines in a text file",
    categorySlug: "document",
    acceptedExtensions: [".txt", ".md", ".csv", ".json", ".xml", ".html", ".css", ".js", ".ts"],
    outputExtension: ".txt",
    options: [],
    maxFileSizeMB: 50,
  },
  async (file) => {
    const text = await file.text();
    const lines = text.split("\n").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const report = [
      `File: ${file.name}`,
      `Lines: ${lines}`,
      `Words: ${words}`,
      `Characters: ${chars}`,
      `Characters (no spaces): ${charsNoSpaces}`,
    ].join("\n");
    return new Blob([report], { type: "text/plain" });
  }
);

// Find and replace in text
registerTool(
  {
    slug: "find-and-replace",
    name: "Find and Replace",
    description: "Find and replace text in a file",
    categorySlug: "document",
    acceptedExtensions: [".txt", ".md", ".csv", ".json", ".xml", ".html", ".css", ".js", ".ts"],
    outputExtension: ".txt",
    options: [
      { name: "find", label: "Find string", type: "text", default: "", placeholder: "Text to find" },
      { name: "replace", label: "Replace string", type: "text", default: "", placeholder: "Replacement text" },
      { name: "caseSensitive", label: "Case sensitive", type: "checkbox", default: true },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const findStr = (options.find as string) ?? "";
    const replaceStr = (options.replace as string) ?? "";
    const caseSensitive = options.caseSensitive as boolean ?? true;
    if (!findStr) return file;
    const text = await file.text();
    const flags = caseSensitive ? "g" : "gi";
    const escaped = findStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const result = text.replace(new RegExp(escaped, flags), replaceStr);
    return new Blob([result], { type: "text/plain" });
  }
);

// UTF-8 to UTF-16 encoding conversion
registerTool(
  {
    slug: "utf8-to-utf16",
    name: "UTF-8 to UTF-16",
    description: "Convert a UTF-8 text file to UTF-16 Little Endian encoding",
    categorySlug: "document",
    acceptedExtensions: [".txt", ".md", ".csv"],
    outputExtension: ".txt",
    options: [],
    maxFileSizeMB: 20,
  },
  async (file) => {
    const text = await file.text();
    const encoder = new TextEncoder();
    // Manually encode as UTF-16LE with BOM
    const bom = new Uint8Array([0xff, 0xfe]);
    const buf = new ArrayBuffer(text.length * 2);
    const view = new Uint16Array(buf);
    for (let i = 0; i < text.length; i++) {
      view[i] = text.charCodeAt(i);
    }
    void encoder; // UTF-8 decoder already used via file.text()
    return new Blob([bom, buf], { type: "text/plain;charset=utf-16le" });
  }
);

// Remove blank lines from text
registerTool(
  {
    slug: "remove-blank-lines",
    name: "Remove Blank Lines",
    description: "Remove all blank lines from a text file",
    categorySlug: "document",
    acceptedExtensions: [".txt", ".md", ".csv", ".json", ".xml", ".html", ".css", ".js", ".ts"],
    outputExtension: ".txt",
    options: [],
    maxFileSizeMB: 50,
  },
  async (file) => {
    const text = await file.text();
    const result = text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
    return new Blob([result], { type: "text/plain" });
  }
);

// Add line numbers to text
registerTool(
  {
    slug: "add-line-numbers",
    name: "Add Line Numbers",
    description: "Prepend line numbers to each line of a text file",
    categorySlug: "document",
    acceptedExtensions: [".txt", ".md", ".csv", ".json", ".xml", ".html", ".css", ".js", ".ts"],
    outputExtension: ".txt",
    options: [
      { name: "separator", label: "Separator", type: "text", default: ": ", placeholder: "e.g. : or \\t" },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const sep = (options.separator as string) ?? ": ";
    const text = await file.text();
    const lines = text.split("\n");
    const padWidth = String(lines.length).length;
    const result = lines
      .map((line, i) => `${String(i + 1).padStart(padWidth, " ")}${sep}${line}`)
      .join("\n");
    return new Blob([result], { type: "text/plain" });
  }
);

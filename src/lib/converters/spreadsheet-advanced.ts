import { registerTool } from "../registry";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(current);
        current = "";
        rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

// CSV column extractor
registerTool(
  {
    slug: "csv-column-extract",
    name: "CSV Column Extractor",
    description: "Extract a single column from a CSV file",
    categorySlug: "spreadsheet",
    acceptedExtensions: [".csv"],
    outputExtension: ".csv",
    options: [
      { name: "column", label: "Column number (1-based)", type: "number", default: 1, min: 1, max: 1000, step: 1 },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const colIndex = ((options.column as number) ?? 1) - 1;
    const text = await file.text();
    const rows = parseCSV(text);
    const result = rows
      .map((row) => {
        const val = row[colIndex] ?? "";
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      })
      .join("\n");
    return new Blob([result], { type: "text/csv" });
  }
);

// CSV to HTML table
registerTool(
  {
    slug: "csv-to-html-table",
    name: "CSV to HTML Table",
    description: "Convert a CSV file into an HTML table",
    categorySlug: "spreadsheet",
    acceptedExtensions: [".csv"],
    outputExtension: ".html",
    options: [
      { name: "headerRow", label: "First row is header", type: "checkbox", default: true },
    ],
    maxFileSizeMB: 50,
  },
  async (file, options) => {
    const headerRow = options.headerRow as boolean ?? true;
    const text = await file.text();
    const rows = parseCSV(text);
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let html = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><style>table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}</style></head><body>\n<table>\n`;
    rows.forEach((row, i) => {
      const tag = headerRow && i === 0 ? "th" : "td";
      html += "  <tr>" + row.map((c) => `<${tag}>${esc(c)}</${tag}>`).join("") + "</tr>\n";
    });
    html += "</table>\n</body></html>";
    return new Blob([html], { type: "text/html" });
  }
);

// JSON to XML
registerTool(
  {
    slug: "json-to-xml",
    name: "JSON to XML",
    description: "Convert a JSON file to basic XML format",
    categorySlug: "spreadsheet",
    acceptedExtensions: [".json"],
    outputExtension: ".xml",
    options: [
      { name: "rootTag", label: "Root element name", type: "text", default: "root", placeholder: "root" },
    ],
    maxFileSizeMB: 20,
  },
  async (file, options) => {
    const rootTag = (options.rootTag as string) || "root";
    const text = await file.text();
    const data = JSON.parse(text);

    function toXml(value: unknown, tag: string, indent: string): string {
      if (value === null || value === undefined) {
        return `${indent}<${tag}/>\n`;
      }
      if (Array.isArray(value)) {
        return value.map((item) => toXml(item, tag, indent)).join("");
      }
      if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>);
        const inner = entries.map(([k, v]) => toXml(v, k, indent + "  ")).join("");
        return `${indent}<${tag}>\n${inner}${indent}</${tag}>\n`;
      }
      const esc = String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `${indent}<${tag}>${esc}</${tag}>\n`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(data, rootTag, "")}`;
    return new Blob([xml], { type: "application/xml" });
  }
);

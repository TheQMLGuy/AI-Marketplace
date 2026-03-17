import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const jsonToCsv: ConverterFn = async (file) => {
  const text = await file.text();
  const data = JSON.parse(text);
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return new Blob([""], { type: "text/csv" });

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? "");
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(",")
    ),
  ];
  return new Blob([csvRows.join("\n")], { type: "text/csv" });
};

const csvToJson: ConverterFn = async (file) => {
  const text = await file.text();
  const lines = text.trim().split("\n");
  if (lines.length < 2) return new Blob(["[]"], { type: "application/json" });

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ""));
    return obj;
  });
  return new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

const jsonToYaml: ConverterFn = async (file) => {
  const text = await file.text();
  const data = JSON.parse(text);
  const yaml = toYaml(data, 0);
  return new Blob([yaml], { type: "text/yaml" });
};

function toYaml(obj: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null\n";
  if (typeof obj === "string") return obj.includes("\n") ? `|\n${obj.split("\n").map((l) => pad + "  " + l).join("\n")}\n` : `${obj}\n`;
  if (typeof obj === "number" || typeof obj === "boolean") return `${obj}\n`;
  if (Array.isArray(obj)) return obj.map((item) => `${pad}- ${toYaml(item, indent + 1).trimStart()}`).join("");
  if (typeof obj === "object") return Object.entries(obj as Record<string, unknown>).map(([k, v]) => {
    const val = toYaml(v, indent + 1);
    return typeof v === "object" && v !== null ? `${pad}${k}:\n${val}` : `${pad}${k}: ${val}`;
  }).join("");
  return `${obj}\n`;
}

const tsvToCsv: ConverterFn = async (file) => {
  const text = await file.text();
  const csv = text.split("\n").map((line) =>
    line.split("\t").map((cell) =>
      cell.includes(",") ? `"${cell}"` : cell
    ).join(",")
  ).join("\n");
  return new Blob([csv], { type: "text/csv" });
};

const csvToTsv: ConverterFn = async (file) => {
  const text = await file.text();
  const tsv = text.split("\n").map((line) =>
    parseCsvLine(line).join("\t")
  ).join("\n");
  return new Blob([tsv], { type: "text/tab-separated-values" });
};

registerTool({ slug: "json-to-csv", name: "JSON to CSV", description: "Convert JSON arrays to CSV spreadsheet format", categorySlug: "spreadsheet", acceptedExtensions: [".json"], outputExtension: ".csv", options: [], maxFileSizeMB: 50 }, jsonToCsv);
registerTool({ slug: "csv-to-json", name: "CSV to JSON", description: "Convert CSV files to JSON format", categorySlug: "spreadsheet", acceptedExtensions: [".csv"], outputExtension: ".json", options: [], maxFileSizeMB: 50 }, csvToJson);
registerTool({ slug: "json-to-yaml", name: "JSON to YAML", description: "Convert JSON to YAML format", categorySlug: "web", acceptedExtensions: [".json"], outputExtension: ".yaml", options: [], maxFileSizeMB: 10 }, jsonToYaml);
registerTool({ slug: "tsv-to-csv", name: "TSV to CSV", description: "Convert tab-separated values to CSV", categorySlug: "spreadsheet", acceptedExtensions: [".tsv", ".txt"], outputExtension: ".csv", options: [], maxFileSizeMB: 50 }, tsvToCsv);
registerTool({ slug: "csv-to-tsv", name: "CSV to TSV", description: "Convert CSV to tab-separated values", categorySlug: "spreadsheet", acceptedExtensions: [".csv"], outputExtension: ".tsv", options: [], maxFileSizeMB: 50 }, csvToTsv);

import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const base64Encode: ConverterFn = async (file) => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);
  return new Blob([base64], { type: "text/plain" });
};

const base64Decode: ConverterFn = async (file) => {
  const text = await file.text();
  const binary = atob(text.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes]);
};

const xmlToJson: ConverterFn = async (file) => {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");

  function nodeToObj(node: Element): unknown {
    const obj: Record<string, unknown> = {};
    if (node.attributes.length > 0) {
      obj["@attributes"] = {};
      for (const attr of Array.from(node.attributes)) {
        (obj["@attributes"] as Record<string, string>)[attr.name] = attr.value;
      }
    }
    for (const child of Array.from(node.children)) {
      const key = child.tagName;
      const value = child.children.length > 0 ? nodeToObj(child) : child.textContent;
      if (obj[key]) {
        if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
        (obj[key] as unknown[]).push(value);
      } else {
        obj[key] = value;
      }
    }
    if (Object.keys(obj).length === 0) return node.textContent;
    return obj;
  }

  const result = nodeToObj(doc.documentElement);
  return new Blob([JSON.stringify({ [doc.documentElement.tagName]: result }, null, 2)], { type: "application/json" });
};

const uppercaseText: ConverterFn = async (file) => {
  const text = await file.text();
  return new Blob([text.toUpperCase()], { type: "text/plain" });
};

const lowercaseText: ConverterFn = async (file) => {
  const text = await file.text();
  return new Blob([text.toLowerCase()], { type: "text/plain" });
};

const removeDuplicateLines: ConverterFn = async (file) => {
  const text = await file.text();
  const lines = [...new Set(text.split("\n"))];
  return new Blob([lines.join("\n")], { type: "text/plain" });
};

const sortLines: ConverterFn = async (file) => {
  const text = await file.text();
  const lines = text.split("\n").sort();
  return new Blob([lines.join("\n")], { type: "text/plain" });
};

registerTool({ slug: "base64-encode", name: "Base64 Encode", description: "Encode any file to Base64 text", categorySlug: "web", acceptedExtensions: [".*"], outputExtension: ".txt", options: [], maxFileSizeMB: 10 }, base64Encode);
registerTool({ slug: "base64-decode", name: "Base64 Decode", description: "Decode Base64 text back to its original file", categorySlug: "web", acceptedExtensions: [".txt", ".b64"], outputExtension: ".bin", options: [], maxFileSizeMB: 10 }, base64Decode);
registerTool({ slug: "xml-to-json", name: "XML to JSON", description: "Convert XML files to JSON format", categorySlug: "web", acceptedExtensions: [".xml", ".svg", ".xhtml"], outputExtension: ".json", options: [], maxFileSizeMB: 10 }, xmlToJson);
registerTool({ slug: "uppercase-text", name: "Uppercase Text", description: "Convert all text to uppercase", categorySlug: "document", acceptedExtensions: [".txt", ".md", ".csv"], outputExtension: ".txt", options: [], maxFileSizeMB: 10 }, uppercaseText);
registerTool({ slug: "lowercase-text", name: "Lowercase Text", description: "Convert all text to lowercase", categorySlug: "document", acceptedExtensions: [".txt", ".md", ".csv"], outputExtension: ".txt", options: [], maxFileSizeMB: 10 }, lowercaseText);
registerTool({ slug: "remove-duplicate-lines", name: "Remove Duplicate Lines", description: "Remove duplicate lines from a text file", categorySlug: "document", acceptedExtensions: [".txt", ".csv", ".log"], outputExtension: ".txt", options: [], maxFileSizeMB: 10 }, removeDuplicateLines);
registerTool({ slug: "sort-lines", name: "Sort Lines", description: "Sort all lines alphabetically", categorySlug: "document", acceptedExtensions: [".txt", ".csv", ".log"], outputExtension: ".txt", options: [], maxFileSizeMB: 10 }, sortLines);

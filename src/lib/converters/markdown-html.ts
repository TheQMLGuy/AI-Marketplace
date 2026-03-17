import { marked } from "marked";
import TurndownService from "turndown";
import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const mdToHtml: ConverterFn = async (file) => {
  const text = await file.text();
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}code{background:#f4f4f4;padding:.2em .4em;border-radius:3px}pre{background:#f4f4f4;padding:1em;border-radius:6px;overflow-x:auto}blockquote{border-left:3px solid #ddd;margin-left:0;padding-left:1em;color:#666}img{max-width:100%}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:.5em;text-align:left}th{background:#f4f4f4}</style>
</head><body>${await marked(text)}</body></html>`;
  return new Blob([html], { type: "text/html" });
};

const htmlToMd: ConverterFn = async (file) => {
  const html = await file.text();
  const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  const md = turndown.turndown(html);
  return new Blob([md], { type: "text/markdown" });
};

registerTool(
  {
    slug: "markdown-to-html",
    name: "Markdown to HTML",
    description: "Convert Markdown files to styled HTML",
    categorySlug: "web",
    acceptedExtensions: [".md", ".markdown", ".txt"],
    outputExtension: ".html",
    options: [],
    maxFileSizeMB: 10,
  },
  mdToHtml
);

registerTool(
  {
    slug: "html-to-markdown",
    name: "HTML to Markdown",
    description: "Convert HTML files to clean Markdown",
    categorySlug: "web",
    acceptedExtensions: [".html", ".htm"],
    outputExtension: ".md",
    options: [],
    maxFileSizeMB: 10,
  },
  htmlToMd
);

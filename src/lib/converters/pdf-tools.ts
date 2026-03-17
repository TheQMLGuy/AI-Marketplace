import { PDFDocument, degrees } from "pdf-lib";
import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const resavePdf: ConverterFn = async (file) => {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const output = await doc.save();
  return new Blob([output as BlobPart], { type: "application/pdf" });
};

const splitPdfFirstPage: ConverterFn = async (file) => {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes);
  const newDoc = await PDFDocument.create();
  const [page] = await newDoc.copyPages(srcDoc, [0]);
  newDoc.addPage(page);
  const output = await newDoc.save();
  return new Blob([output as BlobPart], { type: "application/pdf" });
};

const rotatePdf: ConverterFn = async (file, options) => {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  for (const page of pages) {
    const newAngle = (page.getRotation().angle + Number(options.degrees || 90)) % 360;
    page.setRotation(degrees(newAngle));
  }
  const output = await doc.save();
  return new Blob([output as BlobPart], { type: "application/pdf" });
};

const pdfToText: ConverterFn = async (file) => {
  const text = await file.text();
  const textParts: string[] = [];
  const regex = /\((.*?)\)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const decoded = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")");
    if (decoded.length > 1 && /[a-zA-Z]/.test(decoded)) {
      textParts.push(decoded);
    }
  }
  const result =
    textParts.join(" ") ||
    "(Could not extract text — this PDF may contain only images or use embedded fonts.)";
  return new Blob([result], { type: "text/plain" });
};

registerTool(
  {
    slug: "pdf-rotate",
    name: "Rotate PDF",
    description: "Rotate all pages of a PDF document",
    categorySlug: "document",
    acceptedExtensions: [".pdf"],
    outputExtension: ".pdf",
    options: [
      {
        name: "degrees",
        label: "Rotation (degrees)",
        type: "select",
        default: "90",
        choices: [
          { label: "90°", value: "90" },
          { label: "180°", value: "180" },
          { label: "270°", value: "270" },
        ],
      },
    ],
    maxFileSizeMB: 50,
  },
  rotatePdf
);

registerTool(
  {
    slug: "pdf-extract-first-page",
    name: "Extract First Page from PDF",
    description: "Extract the first page of a PDF into a new file",
    categorySlug: "document",
    acceptedExtensions: [".pdf"],
    outputExtension: ".pdf",
    options: [],
    maxFileSizeMB: 50,
  },
  splitPdfFirstPage
);

registerTool(
  {
    slug: "pdf-optimize",
    name: "Re-save PDF",
    description: "Re-save a PDF (can reduce file size)",
    categorySlug: "document",
    acceptedExtensions: [".pdf"],
    outputExtension: ".pdf",
    options: [],
    maxFileSizeMB: 50,
  },
  resavePdf
);

registerTool(
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    description: "Extract text content from PDF files (basic)",
    categorySlug: "document",
    acceptedExtensions: [".pdf"],
    outputExtension: ".txt",
    options: [],
    maxFileSizeMB: 50,
  },
  pdfToText
);

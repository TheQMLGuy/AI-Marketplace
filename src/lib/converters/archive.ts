import JSZip from "jszip";
import { registerTool } from "../registry";
import type { ConverterFn } from "../types";

const createZip: ConverterFn = async (file) => {
  const zip = new JSZip();
  zip.file(file.name, file);
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return blob;
};

const extractZip: ConverterFn = async (file) => {
  const zip = await JSZip.loadAsync(file);
  const filenames = Object.keys(zip.files);

  if (filenames.length === 1) {
    const content = await zip.files[filenames[0]].async("blob");
    return content;
  }

  // If multiple files, re-create as a listing
  const listing = filenames.join("\n");
  return new Blob([`Archive contents (${filenames.length} files):\n\n${listing}`], {
    type: "text/plain",
  });
};

registerTool(
  {
    slug: "create-zip",
    name: "Create ZIP",
    description: "Compress a file into a ZIP archive",
    categorySlug: "archive",
    acceptedExtensions: [".*"],
    outputExtension: ".zip",
    options: [],
    maxFileSizeMB: 100,
  },
  createZip
);

registerTool(
  {
    slug: "extract-zip",
    name: "Extract ZIP",
    description: "Extract files from a ZIP archive",
    categorySlug: "archive",
    acceptedExtensions: [".zip"],
    outputExtension: ".txt",
    options: [],
    maxFileSizeMB: 100,
  },
  extractZip
);

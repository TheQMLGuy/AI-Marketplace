"use client";

import { useState, useMemo } from "react";
import "@/lib/converters";
import { getTool, getConverter } from "@/lib/registry";
import { FileUploader } from "@/components/FileUploader";
import { ToolOptionsForm } from "@/components/ToolOptionsForm";
import { Download, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getOutputFilename, formatFileSize } from "@/lib/utils";

export default function ToolPageClient({ slug }: { slug: string }) {
  const tool = getTool(slug);
  const converter = getConverter(slug);

  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  // Initialize defaults when tool loads
  useMemo(() => {
    if (tool) {
      const defaults: Record<string, unknown> = {};
      tool.options.forEach((opt) => { defaults[opt.name] = opt.default; });
      setOptions(defaults);
    }
  }, [tool]);

  const handleConvert = async () => {
    if (!file || !tool || !converter) return;
    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const blob = await converter(file, options);
      const url = URL.createObjectURL(blob);
      const filename = getOutputFilename(file.name, tool.outputExtension);
      setDownloadUrl(url);
      setOutputFilename(filename);
      setOutputSize(blob.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setOutputFilename(null);
    setOutputSize(null);
  };

  if (!tool) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-400">
        Tool not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tools
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
      <p className="text-gray-500 mt-2 mb-8">{tool.description}</p>

      <div className="space-y-4">
        <FileUploader
          acceptedExtensions={tool.acceptedExtensions}
          maxFileSizeMB={tool.maxFileSizeMB}
          onFileSelect={setFile}
          selectedFile={file}
          onClear={handleClear}
        />

        <ToolOptionsForm
          options={tool.options}
          values={options}
          onChange={(name, value) =>
            setOptions((prev) => ({ ...prev, [name]: value }))
          }
        />

        {file && !downloadUrl && (
          <button
            onClick={handleConvert}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert"
            )}
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {downloadUrl && outputFilename && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-medium mb-3">
              Conversion complete!
              {outputSize !== null && (
                <span className="text-green-600 text-sm ml-2">
                  ({formatFileSize(outputSize)})
                </span>
              )}
            </p>
            <a
              href={downloadUrl}
              download={outputFilename}
              className="inline-flex items-center gap-2 bg-green-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download {outputFilename}
            </a>
            <button
              onClick={handleClear}
              className="block mx-auto mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Convert another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

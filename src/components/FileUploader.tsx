"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface FileUploaderProps {
  acceptedExtensions: string[];
  maxFileSizeMB: number;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUploader({
  acceptedExtensions,
  maxFileSizeMB,
  onFileSelect,
  selectedFile,
  onClear,
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    (file: File) => {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setError(`File too large. Max ${maxFileSizeMB}MB`);
        return false;
      }
      setError(null);
      return true;
    },
    [maxFileSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && validate(file)) onFileSelect(file);
    },
    [onFileSelect, validate]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validate(file)) onFileSelect(file);
    },
    [onFileSelect, validate]
  );

  if (selectedFile) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all",
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
        )}
      >
        <Upload
          className={cn(
            "h-10 w-10 mb-3",
            dragOver ? "text-blue-600" : "text-gray-400"
          )}
        />
        <p className="text-sm font-medium text-gray-700">
          Drop your file here or{" "}
          <span className="text-blue-600">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {acceptedExtensions.join(", ")} — up to {maxFileSizeMB}MB
        </p>
        <input
          type="file"
          className="hidden"
          accept={acceptedExtensions.join(",")}
          onChange={handleChange}
        />
      </label>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export interface ToolOption {
  name: string;
  label: string;
  type: "select" | "number" | "checkbox" | "text";
  default: string | number | boolean;
  choices?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  acceptedExtensions: string[];
  outputExtension: string;
  options: ToolOption[];
  maxFileSizeMB: number;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

// Client-side converter: takes a File, returns a Blob
export type ConverterFn = (
  file: File,
  options: Record<string, unknown>
) => Promise<Blob>;

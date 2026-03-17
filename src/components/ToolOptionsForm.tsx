"use client";

import type { ToolOption } from "@/lib/types";

interface ToolOptionsFormProps {
  options: ToolOption[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}

export function ToolOptionsForm({
  options,
  values,
  onChange,
}: ToolOptionsFormProps) {
  if (options.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
        Options
      </h3>
      {options.map((opt) => (
        <div key={opt.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {opt.label}
          </label>
          {opt.type === "select" && (
            <select
              value={String(values[opt.name] ?? opt.default)}
              onChange={(e) => onChange(opt.name, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {opt.choices?.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
          {opt.type === "number" && (
            <input
              type="number"
              value={Number(values[opt.name] ?? opt.default)}
              min={opt.min}
              max={opt.max}
              step={opt.step ?? 1}
              onChange={(e) => onChange(opt.name, Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
          {opt.type === "checkbox" && (
            <input
              type="checkbox"
              checked={Boolean(values[opt.name] ?? opt.default)}
              onChange={(e) => onChange(opt.name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
          {opt.type === "text" && (
            <input
              type="text"
              value={String(values[opt.name] ?? opt.default)}
              placeholder={opt.placeholder}
              onChange={(e) => onChange(opt.name, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      ))}
    </div>
  );
}

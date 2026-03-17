"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ToolDefinition } from "@/lib/types";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/convert/${tool.slug}`}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group flex items-center justify-between"
    >
      <div>
        <h3 className="font-medium text-gray-900">{tool.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{tool.description}</p>
        <div className="flex gap-1.5 mt-2">
          {tool.acceptedExtensions.slice(0, 4).map((ext) => (
            <span
              key={ext}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {ext}
            </span>
          ))}
          <span className="text-xs text-blue-600 font-medium px-2 py-0.5">
            → {tool.outputExtension}
          </span>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
    </Link>
  );
}

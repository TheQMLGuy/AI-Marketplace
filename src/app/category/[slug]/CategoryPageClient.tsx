"use client";

import "@/lib/converters";
import { getCategory, getToolsByCategory } from "@/lib/registry";
import { ToolCard } from "@/components/ToolCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryPageClient({ slug }: { slug: string }) {
  const category = getCategory(slug);
  const tools = getToolsByCategory(slug);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
        Category not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
      <p className="text-gray-500 mt-2 mb-8">{category.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
      {tools.length === 0 && (
        <p className="text-gray-400 text-center py-12">
          No tools in this category yet.
        </p>
      )}
    </div>
  );
}

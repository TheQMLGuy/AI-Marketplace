"use client";

import "@/lib/converters";
import { getAllTools, getCategories } from "@/lib/registry";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ToolCard } from "@/components/ToolCard";
import { Search } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const categories = getCategories();
  const tools = getAllTools();
  const [search, setSearch] = useState("");

  const filteredTools = search
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.acceptedExtensions.some((e) => e.includes(search.toLowerCase()))
      )
    : tools;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Conversion
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Convert any file — images, documents, spreadsheets, archives, and
          more. Everything runs in your browser. No uploads, no servers.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools... (e.g. png, pdf, csv)"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      {!search && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Categories
          </h2>
          <CategoryGrid categories={categories} />
        </section>
      )}

      {/* Tools */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {search ? `Results (${filteredTools.length})` : `All Tools (${tools.length})`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        {filteredTools.length === 0 && (
          <p className="text-gray-400 text-center py-12">
            No tools found matching &ldquo;{search}&rdquo;
          </p>
        )}
      </section>
    </div>
  );
}

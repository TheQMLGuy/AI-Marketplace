"use client";

import Link from "next/link";
import {
  Image, FileText, Globe, Archive, Table, BookOpen,
  Music, Video, Type, PenTool, Presentation,
} from "lucide-react";
import type { Category } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  Image, FileText, Globe, Archive, Table, BookOpen,
  Music, Video, Type, PenTool, Presentation,
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon] || FileText;
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <Icon className="h-7 w-7 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">{cat.name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              Tools Marketplace
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-blue-600">
              Conversion
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

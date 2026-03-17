import { getCategories } from "@/lib/registry";
import CategoryPageClient from "./CategoryPageClient";

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryPageClient slug={slug} />;
}

import "@/lib/converters";
import { getAllTools } from "@/lib/registry";
import ToolPageClient from "./ToolPageClient";

export function generateStaticParams() {
  return getAllTools().map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ToolPageClient slug={slug} />;
}

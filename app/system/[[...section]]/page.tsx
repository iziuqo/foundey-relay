import { notFound } from "next/navigation";
import { FoundationsPage } from "@/components/system/foundations-page";
import { ComponentsPage } from "@/components/system/components-page";
import { PatternsPage } from "@/components/system/patterns-page";
import { RulesPage } from "@/components/system/rules-page";
import { systemNav } from "@/components/system/nav";

export function generateStaticParams() {
  return systemNav.map((item) => ({ section: item.slug ? [item.slug] : [] }));
}

export default async function SystemSectionPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const slug = section?.[0];

  if (!slug) return <FoundationsPage />;
  if (slug === "components" && !section?.[1]) return <ComponentsPage />;
  if (slug === "patterns" && !section?.[1]) return <PatternsPage />;
  if (slug === "rules" && !section?.[1]) return <RulesPage />;
  notFound();
}

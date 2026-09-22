import { notFound } from "next/navigation";
import { FoundationsPage } from "@/components/system/foundations-page";
import { ComponentsPage } from "@/components/system/components-page";
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
  if ((slug === "patterns" || slug === "rules") && !section?.[1]) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-(length:--text-title) font-semibold text-(--text-1) capitalize">{slug}</h1>
        <p className="mt-2 text-(length:--text-body) text-(--text-2)">
          Not built yet — this lands in Phase 7 (plan §10), after the screens it documents exist.
        </p>
      </div>
    );
  }
  notFound();
}

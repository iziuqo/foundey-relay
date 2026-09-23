"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/state/store";
import { SEED_NOW_ISO } from "@/state/clock";
import { useNow } from "@/lib/time";
import { updates as seedUpdates } from "@/lib/seed";
import { updatesFor, type UpdateTab } from "@/lib/selectors";
import { copy } from "@/lib/copy";
import { UpdateTabs } from "@/components/relay/update-tabs";
import { UpdateRowView } from "@/components/relay/update-row";
import { UpdateDetail } from "@/components/relay/update-detail";
import { UpdateSheet } from "@/components/relay/update-sheet";
import { useIsDesktopShell } from "@/components/relay/use-media-query";
import { EmptyState } from "@/components/ui/empty-state";

export default function UpdatesPage() {
  const items = useStore((s) => s.items);
  const team = useStore((s) => s.team);
  const readIds = useStore((s) => s.readIds);
  const markRead = useStore((s) => s.markRead);
  const jumpOffsetMs = useStore((s) => s.jumpOffsetMs);

  const [tab, setTab] = useState<UpdateTab>("forYou");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const now = useNow(SEED_NOW_ISO, jumpOffsetMs);
  const isDesktop = useIsDesktopShell();

  const allRows = useMemo(() => updatesFor(items, seedUpdates), [items]);
  const counts: Record<UpdateTab, number> = { forYou: 0, team: 0, system: 0 };
  for (const row of allRows) {
    if (!readIds.includes(row.id)) counts[row.tab] += 1;
  }
  const rows = allRows.filter((r) => r.tab === tab);
  const selected = allRows.find((r) => r.id === selectedId) ?? null;
  const selectedAuthor = selected ? team.find((p) => p.id === selected.authorId) : undefined;

  function selectRow(id: string) {
    setSelectedId(id);
  }

  return (
    <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-6 p-4 lg:flex-row lg:items-start lg:gap-6 xl:p-8">
      <div data-testid="updates-list" className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-xl">
        {/* t-section, not the page's largest step: the nav's active state already names
            this location, so the h1 need not compete for it (the same call /team makes
            for its own status line). */}
        <h1 className="t-section font-semibold text-(--text-1)">{copy.updates.title}</h1>
        <UpdateTabs
          tabs={(["forYou", "team", "system"] as const).map((id) => ({
            id,
            label: copy.updates.tabs[id],
            count: counts[id],
          }))}
          active={tab}
          onChange={setTab}
        />
        <div
          role="tabpanel"
          id={`update-panel-${tab}`}
          aria-labelledby={`update-tab-${tab}`}
          className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1)"
        >
          {rows.length === 0 ? (
            <EmptyState title={copy.updates.emptyTab} description={copy.updates.emptyTabHint} />
          ) : (
            <ul data-craft-list className="flex flex-col">
              {rows.map((row) => (
                <UpdateRowView
                  key={row.id}
                  row={row}
                  author={team.find((p) => p.id === row.authorId)}
                  now={now}
                  unread={!readIds.includes(row.id)}
                  selected={selected?.id === row.id}
                  onSelect={() => selectRow(row.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div data-testid="updates-preview" className="hidden min-w-0 flex-1 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) lg:block">
        {selected ? (
          <UpdateDetail
            row={selected}
            author={selectedAuthor}
            now={now}
            unread={!readIds.includes(selected.id)}
            onMarkRead={() => markRead(selected.id)}
          />
        ) : (
          <EmptyState title={copy.updates.selectHint} />
        )}
      </div>

      {selected && !isDesktop && (
        <UpdateSheet
          row={selected}
          author={selectedAuthor}
          now={now}
          unread={!readIds.includes(selected.id)}
          onMarkRead={() => markRead(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

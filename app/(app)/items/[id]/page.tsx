"use client";

import { useParams, useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import { ItemDetail } from "@/components/relay/item-detail";
import { useItemDetail } from "@/components/relay/use-item-detail";

/** §8.2 `app/(app)/items/[id]/page.tsx`: the direct-navigation full page. Reached by
 * URL, refresh, or "Open" from the palette on handheld — the intercepting route
 * (`@modal/(.)items/[id]`) only fires for a client-side transition that started inside
 * the app shell (§6.2). */
export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useItemDetail(id);

  if (!data.item || !data.ranked) {
    return (
      <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col items-start gap-3 p-4 xl:p-8">
        <p className="text-(length:--text-body) text-(--text-2)">{copy.itemDetail.notFound}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl)">
      <ItemDetail
        item={data.item}
        assignee={data.assignee}
        now={data.now}
        nextCutoffAt={data.nextCutoffAt}
        ranked={data.ranked}
        nextRanked={data.nextRanked}
        canAct={data.canAct}
        onStart={data.start}
        onMarkDone={data.markDone}
        onAskHelp={data.askHelp}
        onWaiting={data.waiting}
        onMoveLater={data.moveLater}
        onNotMine={data.notMine}
        onPrev={data.prevId ? () => router.push(`/items/${data.prevId}`) : undefined}
        onNext={data.nextId ? () => router.push(`/items/${data.nextId}`) : undefined}
        backHref="/work"
        canReassign={data.canReassign}
        reassignCandidates={data.reassignCandidates}
        onReassign={data.reassign}
        reserveDock
      />
    </div>
  );
}

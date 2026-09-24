"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "vaul";
import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { ItemDetail } from "./item-detail";
import { useItemDetail } from "./use-item-detail";
import { useIsDesktopShell } from "./use-media-query";
import { useDeferredClose } from "./use-deferred-close";

/**
 * §5 / §6.2: the intercepting route's sheet. Right sheet (Radix Dialog) at the desktop
 * shell's breakpoint, a bottom sheet with snap points (Vaul) below it — same line as
 * the sidebar/dock split (§5). Prev/next inside the sheet *replace* the history entry
 * instead of pushing, so one Escape or close always lands back on the page underneath,
 * however many items were paged through. M8: closing waits for the real exit
 * animation (spring.sheet) via `useDeferredClose` before calling `router.back()`.
 */
export function ItemDetailSheet({ id }: { id: string }) {
  const router = useRouter();
  const isDesktop = useIsDesktopShell();
  const data = useItemDetail(id);
  const { open, requestClose, onAnimationEnd, onDialogAnimationEnd } = useDeferredClose(() => router.back());

  function close() {
    requestClose();
  }

  function goTo(nextId: string) {
    router.replace(`/items/${nextId}`);
  }

  const title = data.item?.title ?? copy.itemDetail.notFound;
  const { item, ranked, prevId, nextId } = data;

  const content =
    item && ranked ? (
      <ItemDetail
        item={item}
        assignee={data.assignee}
        now={data.now}
        nextCutoffAt={data.nextCutoffAt}
        ranked={ranked}
        nextRanked={data.nextRanked}
        canAct={data.canAct}
        onStart={data.start}
        onMarkDone={data.markDone}
        onAskHelp={data.askHelp}
        onWaiting={data.waiting}
        onMoveLater={data.moveLater}
        onNotMine={data.notMine}
        onPrev={prevId ? () => goTo(prevId) : undefined}
        onNext={nextId ? () => goTo(nextId) : undefined}
        onClose={close}
        canReassign={data.canReassign}
        reassignCandidates={data.reassignCandidates}
        onReassign={data.reassign}
      />
    ) : (
      <ErrorState
        className="p-4"
        title={copy.itemDetail.notFound}
        description={copy.itemDetail.notFoundHint}
        action={
          <Button variant="secondary" size="sm" onClick={close}>
            {copy.itemDetail.close}
          </Button>
        }
      />
    );

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={(next) => !next && close()}>
        <Dialog.Portal>
          <Dialog.Overlay className="sheet-overlay fixed inset-0 z-40 bg-(--overlay)" />
          <Dialog.Content
            aria-describedby={undefined}
            onAnimationEnd={onDialogAnimationEnd}
            className="sheet-content fixed inset-y-0 right-0 z-50 flex w-(--sheet-w) flex-col overflow-y-auto border-l border-(--line-1) bg-(--surface-1) shadow-(--e3) outline-none"
          >
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            {content}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={(next) => !next && close()} onAnimationEnd={onAnimationEnd} snapPoints={[0.55, 0.94]}>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay fixed inset-0 z-40 bg-(--overlay)" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col overflow-y-auto rounded-t-(--r-5) border-t border-(--line-1) bg-(--surface-1) outline-none"
        >
          <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-(--line-2)" />
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {content}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

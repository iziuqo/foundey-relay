"use client";

import { Drawer } from "vaul";
import type { UpdateRow } from "@/lib/selectors";
import type { Person } from "@/lib/types";
import { UpdateDetail } from "./update-detail";
import { useDeferredClose } from "./use-deferred-close";

export interface UpdateSheetProps {
  row: UpdateRow;
  author: Person | undefined;
  now: Date;
  unread: boolean;
  onMarkRead: () => void;
  onClose: () => void;
}

/** §6.4 handheld: selecting a row "opens a sheet below that" instead of the 1024+
 * inline preview pane. Same bottom-sheet shape as the item detail sheet (§6.2). */
export function UpdateSheet({ row, author, now, unread, onMarkRead, onClose }: UpdateSheetProps) {
  const { open, requestClose, onAnimationEnd } = useDeferredClose(onClose);
  return (
    <Drawer.Root open={open} onOpenChange={(next) => !next && requestClose()} onAnimationEnd={onAnimationEnd} snapPoints={[0.5, 0.92]}>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay fixed inset-0 z-40 bg-(--overlay)" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col overflow-y-auto rounded-t-(--radius-hero) border-t border-(--border-1) bg-(--surface-1) outline-none"
        >
          <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-(--border-2)" />
          <Drawer.Title asChild>
            <span className="sr-only">{row.title ?? row.reason}</span>
          </Drawer.Title>
          <UpdateDetail row={row} author={author} now={now} unread={unread} onMarkRead={onMarkRead} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

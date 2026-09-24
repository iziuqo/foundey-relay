"use client";

import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "vaul";
import { copy, t } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { queueFor, flattenedQueue } from "@/lib/selectors";
import type { Item, Person } from "@/lib/types";
import { TierIcon } from "./tier-icon";
import { TimePill } from "./time-pill";
import { tierFgClass } from "./tier-tokens";
import { PersonAvatar } from "./person-avatar";
import { useIsDesktopShell } from "./use-media-query";
import { useDeferredClose } from "./use-deferred-close";

export interface CheckInSheetProps {
  person: Person;
  items: Item[];
  now: Date;
  /** The item that brought the manager here, scrolled to and highlighted on open. */
  highlightItemId?: string | null;
  onClose: () => void;
}

/**
 * §6.3 "Check in opens that person's queue in a sheet, read only, scrolled to and
 * highlighting the flagged item." Read only: rows are plain list items, not links or
 * buttons — no actions are offered here, so there is nothing to wire and nothing to
 * accidentally nest inside a sheet already trapping focus.
 */
export function CheckInSheet({ person, items, now, highlightItemId, onClose }: CheckInSheetProps) {
  const isDesktop = useIsDesktopShell();
  const queue = queueFor(items, person.id, now);
  const rows = flattenedQueue(queue);
  const highlightRef = useRef<HTMLLIElement | null>(null);
  const { open, requestClose, onAnimationEnd, onDialogAnimationEnd } = useDeferredClose(onClose);

  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: "center" });
  }, []);

  const title = t(copy.team.checkInTitle, { name: person.name });

  const content = (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <PersonAvatar initials={person.initials} size="lg" />
        <div className="min-w-0">
          <Dialog.Title asChild>
            <p className="text-(length:--t-section-size) leading-(length:--t-section-line) font-semibold text-(--text-1)">
              {title}
            </p>
          </Dialog.Title>
          <p className="text-(length:--t-meta-size) text-(--text-2)">{person.role}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-(length:--t-meta-size) text-(--text-2)">{copy.team.checkInEmpty}</p>
      ) : (
        <ul className="flex flex-col">
          {rows.map(({ item, result }) => {
            const tier = result.tier as "now" | "next" | "later";
            const highlighted = item.id === highlightItemId;
            return (
              <li
                key={item.id}
                ref={highlighted ? highlightRef : undefined}
                className={cn(
                  "flex min-h-(--h-row) items-center gap-3 border-b border-(--line-1) px-2 last:border-0",
                  highlighted && "rounded-(--r-4) bg-(--surface-2)",
                )}
              >
                <TierIcon tier={tier} safety={item.safety} className={cn("shrink-0", tierFgClass[tier])} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-(length:--t-row-size) leading-(length:--t-row-line) font-medium text-(--text-1)">
                    {item.title}
                  </p>
                  <p className="truncate text-(length:--t-meta-size) text-(--text-2)">{item.cause}</p>
                </div>
                <TimePill dueAt={item.dueAt} now={now} tier={tier} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={(next) => !next && requestClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="sheet-overlay fixed inset-0 z-40 bg-(--overlay)" />
          <Dialog.Content
            aria-describedby={undefined}
            onAnimationEnd={onDialogAnimationEnd}
            className="sheet-content fixed inset-y-0 right-0 z-50 flex w-[28rem] flex-col overflow-y-auto border-l border-(--line-1) bg-(--surface-1) shadow-(--e3) outline-none"
          >
            {content}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => !next && requestClose()}
      onAnimationEnd={onAnimationEnd}
      snapPoints={[0.5, 0.92]}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay fixed inset-0 z-40 bg-(--overlay)" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col overflow-y-auto rounded-t-(--r-5) border-t border-(--line-1) bg-(--surface-1) outline-none"
        >
          <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-(--line-2)" />
          <Drawer.Title asChild>
            <span className="sr-only">{title}</span>
          </Drawer.Title>
          {content}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

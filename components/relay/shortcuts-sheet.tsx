"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { copy } from "@/lib/copy";
import { IconButton } from "@/components/ui/icon-button";
import { X } from "lucide-react";
import { useStore } from "@/state/store";

/** §3.7 (Fey's shortcut teaching screen) / §8.5: the "?" sheet for the one hotkey
 * module. A small centered dialog, not a sheet — there's nothing here to browse. */
export function ShortcutsSheet() {
  const open = useStore((s) => s.shortcutsOpen);
  const closeShortcuts = useStore((s) => s.closeShortcuts);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && closeShortcuts()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-(--overlay)" />
        <Dialog.Content
          className="dialog-content fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-(--r-5) border border-(--line-1) bg-(--surface-1) p-5 shadow-(--e3)"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-(length:--t-section-size) leading-(length:--t-section-line) font-semibold text-(--text-1)">
              {copy.shortcutsSheet.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton aria-label={copy.itemDetail.close} size="sm">
                <X aria-hidden />
              </IconButton>
            </Dialog.Close>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {copy.shortcutsSheet.rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4">
                <span className="text-(length:--t-body-size) text-(--text-1)">{row.label}</span>
                <kbd
                  data-kbd
                  className="tnum rounded-(--r-2) border border-(--line-1) bg-(--surface-2) px-2 py-0.5 text-(length:--t-mono-size) leading-(length:--t-mono-line) text-(--text-2)"
                >
                  {row.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

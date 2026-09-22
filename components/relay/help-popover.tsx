"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export interface HelpPopoverProps {
  trigger: React.ReactNode;
  onSend: (reason: string, note: string) => void;
}

/** §6.1 hero secondary action. Reason + optional note, per copy.help. */
export function HelpPopover({ trigger, onSend }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setReason(null);
          setNote("");
        }
      }}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className="popover-content z-50 w-72 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-4 shadow-(--shadow-e3)"
        >
          <p className="text-(length:--text-meta) font-semibold text-(--text-1)">{copy.help.title}</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {copy.help.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setReason(option)}
                aria-pressed={reason === option}
                className={cn(
                  "rounded-(--radius-control) border px-3 py-2 text-left text-(length:--text-meta) transition-colors",
                  reason === option
                    ? "border-(--accent) bg-(--surface-2) text-(--text-1)"
                    : "border-(--border-1) text-(--text-2) hover:bg-(--surface-2)",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-(length:--text-meta) text-(--text-2)">
            {copy.help.note}
            <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" />
          </label>
          <Button
            className="mt-3 w-full"
            disabled={!reason}
            onClick={() => {
              if (!reason) return;
              onSend(reason, note);
              setOpen(false);
            }}
          >
            {copy.help.send}
          </Button>
          <Popover.Arrow className="fill-(--surface-1)" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

"use client";

import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { copy, t } from "@/lib/copy";
import { cn } from "@/lib/cn";
import type { AssignCandidate } from "@/lib/selectors";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "./person-avatar";

export interface AssignPopoverProps {
  trigger: React.ReactNode;
  candidates: AssignCandidate[];
  onAssign: (personId: string) => void;
}

/**
 * §6.3: "Assign opens a popover listing teammates by load (lowest first) with their
 * three tier counts." Load is a neutral meter of numbers, never a colored word
 * (§4.2 color budget, README §8.6) — the light/busy/full label renders in --text-2
 * either way.
 */
export function AssignPopover({ trigger, candidates, onAssign }: AssignPopoverProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) => c.person.name.toLowerCase().includes(q) || c.person.role.toLowerCase().includes(q),
    );
  }, [candidates, query]);

  function reset(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  return (
    <Popover.Root open={open} onOpenChange={reset}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          aria-labelledby="assign-popover-title"
          className="z-50 flex w-80 flex-col gap-2 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-3 shadow-(--shadow-e3)"
        >
          <p id="assign-popover-title" className="px-1 text-(length:--text-meta) font-semibold text-(--text-1)">
            {copy.team.reassignTitle}
          </p>
          <Input
            size="sm"
            placeholder={copy.team.findTeammate}
            aria-label={copy.team.findTeammate}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
            {filtered.map((candidate, index) => (
              <li key={candidate.person.id}>
                <button
                  type="button"
                  onClick={() => {
                    onAssign(candidate.person.id);
                    reset(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-(--radius-control) px-2 py-2 text-left hover:bg-(--surface-2) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus)"
                >
                  <PersonAvatar initials={candidate.person.initials} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-(length:--text-meta) font-medium text-(--text-1)">
                        {candidate.person.name}
                      </span>
                      {!query && index === 0 && (
                        <span className="rounded-full border border-(--border-1) px-1.5 py-0.5 text-(length:--text-kbd) text-(--text-2)">
                          {copy.team.suggested}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-(length:--text-kbd) text-(--text-2)">
                      {candidate.person.role}
                    </span>
                  </span>
                  <span className="tnum shrink-0 text-(length:--text-kbd) text-(--text-2)">
                    {t(copy.team.loadCounts, {
                      now: candidate.counts.now,
                      next: candidate.counts.next,
                      later: candidate.counts.later,
                    })}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className={cn("px-2 py-3 text-(length:--text-meta) text-(--text-2)")}>{copy.palette.empty}</li>
            )}
          </ul>
          <Popover.Arrow className="fill-(--surface-1)" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

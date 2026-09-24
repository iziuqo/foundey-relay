"use client";

import * as Popover from "@radix-ui/react-popover";
import type { Ranked } from "@/lib/priority";
import { WhyFactors } from "./why-factors";

export interface WhyPopoverProps {
  ranked: Ranked;
  nextRanked: Ranked | null;
  now: Date;
  trigger: React.ReactNode;
}

/** §6.1 / §3.6: the hero's "why" breakdown behind a click. Item detail (§6.2) shows the
 * same `WhyFactors` inline instead of in a popover. */
export function WhyPopover({ ranked, nextRanked, now, trigger }: WhyPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className="popover-content z-50 w-80 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4 shadow-(--e3)"
        >
          <WhyFactors ranked={ranked} nextRanked={nextRanked} now={now} />
          <Popover.Arrow className="fill-(--surface-1)" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

import { Clock } from "lucide-react";
import { Chip, type ChipSize } from "@/components/ui/chip";
import { dueKind } from "@/lib/time";
import { copy, t } from "@/lib/copy";
import type { EncodedTier } from "./tier-icon";

export interface TimePillProps {
  dueAt: string | null;
  now: Date;
  /**
   * §8.6 / §8.3: overdue intensity follows the item's own tier — "2 h late" in Up next
   * is amber, not red. The pill never picks its own color from lateness.
   */
  tier: EncodedTier;
  size?: ChipSize;
  className?: string;
}

export function timePillText(dueAt: string, now: Date): string {
  const kind = dueKind(dueAt, now);
  switch (kind.kind) {
    case "late-min":
      return t(copy.time.lateMin, { n: kind.n });
    case "late-hr":
      return t(copy.time.lateHr, { n: kind.n });
    case "tomorrow":
      return t(copy.time.tomorrow, { hhmm: kind.hhmm });
    case "due-in":
      return t(copy.time.dueIn, { n: kind.n });
    case "due-at":
      return t(copy.time.due, { hhmm: kind.hhmm });
  }
}

export function TimePill({ dueAt, now, tier, size = "md", className }: TimePillProps) {
  if (!dueAt) return null;
  return (
    <Chip tier={tier} size={size} className={className}>
      <Clock aria-hidden />
      <span className="tnum">{timePillText(dueAt, now)}</span>
    </Chip>
  );
}

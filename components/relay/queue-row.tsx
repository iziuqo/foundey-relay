"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { FOCUS } from "@/components/ui/sizing";
import { cn } from "@/lib/cn";
import { spring, stagger, stepDelay, transition } from "@/lib/motion";
import type { Ranked } from "@/lib/priority";
import { TierIcon } from "./tier-icon";
import { TimePill, timePillText } from "./time-pill";
import { ItemOverflowPopover } from "./item-overflow-popover";
import { ItemShell } from "./item-shell";
import { tierFgClass } from "./tier-tokens";

export interface QueueRowProps {
  ranked: Ranked;
  /** Position within this tier group — M4 ④'s 24ms-per-row stagger reads off it. */
  index: number;
  now: Date;
  nextCutoffAt: string | null;
  /** True for the one row that's next in line for the hero slot — carries the shared
   * `layoutId` shell that morphs into the hero card on a done action (M1). */
  willBecomeHero?: boolean;
  /** True right after this row's rank changed for a reason the user did not cause —
   * plays catalog M8's 900ms tint wash once, which is the only thing that says "this is
   * the one that moved". Never set for a row the user's own done or undo moved. */
  justPromoted?: boolean;
  onStart: () => void;
  onMarkDone: () => void;
  onWaiting: (waitingOn: string, checkBackAt: string) => void;
  onMoveLater: (snoozeUntil: string) => void;
  onNotMine: () => void;
}

/**
 * One row of the ranked queue. Reference `v01`: a two-line text block on the left, one
 * meta cluster on a shared right-hand track, hairline separators, and **no visible
 * button at any width** (advisor §7.2).
 *
 * The geometry is all in `.queue-row` (globals.css): the four-track grid, the fixed
 * `--h-row`, and the separator as an inset shadow rather than a border. What lives here
 * is the one rule that cannot be expressed in the grid — the action cluster occupies
 * its track **at all times** at `opacity: 0` and is revealed by opacity and translate
 * only (§5.6 item 6), so hovering a row never moves anything. v2 reserved the track and
 * then also painted a visible 58×32 "Start" at 390, where there is no hover to reveal
 * it with; below 768 there is now no cluster at all and the chip keeps the track.
 *
 * The row's main target is a link to the item; row actions are siblings of that link,
 * never nested inside it.
 */
export function QueueRow({
  ranked,
  index,
  now,
  nextCutoffAt,
  willBecomeHero,
  justPromoted,
  onStart,
  onMarkDone,
  onWaiting,
  onMoveLater,
  onNotMine,
}: QueueRowProps) {
  const { item, result } = ranked;
  const tier = result.tier as "now" | "next" | "later";
  const inProgress = item.status === "in_progress";

  return (
    <motion.li
      layout="position"
      initial={false}
      exit={{ opacity: 0, transition: transition.quick }}
      // M4 ④: the gap closes *down* the list rather than everywhere at once — 24ms per
      // row, capped at five, so a long queue settles rather than ripples. Without an
      // explicit layout transition this fell back to Motion's own default spring, which
      // is a fourth curve nobody chose (lib/motion.ts's first rule).
      transition={{ layout: { ...spring.layout, delay: stepDelay(index, stagger.rows) } }}
      data-craft-row
      data-tier={tier}
      className={cn(
        "queue-row group relative",
        // §4.5 item 2: Act now is the only tier that tints a row at all.
        tier === "now" && "bg-(--act-bg)",
        justPromoted && "tint-wash",
      )}
    >
      {willBecomeHero && <ItemShell itemId={item.id} tier={tier} variant="row" />}

      {/* Neutral, deliberately. §4.5 whitelists a tier-coloured row icon, but the band
          directly above already states the tier in hue, and repeating it down a column
          of rows is `pd02`'s failure in miniature — colour encoding category rather than
          rank, so every row shouts at the same volume. The glyph's *shape* still carries
          the tier, which is what the wire and grayscale tests actually read (G5). The
          hue that stays in the row is the time chip's, where it means "this one's clock
          is the one running". */}
      <TierIcon tier={tier} safety={item.safety} className="justify-self-center text-(--text-2)" />

      <Link
        href={`/items/${item.id}`}
        data-row-nav
        className={cn("flex min-w-0 flex-col justify-center gap-0.5 rounded-(--r-2)", FOCUS)}
      >
        <span className="t-row truncate text-(--text-1)">{item.title}</span>
        {/* §3.4: the row subtitle is the one step that goes *up* on a handheld — it is
            the only text that explains rank, and 350mm of reading distance makes 14px
            needlessly small where the width is there for 16. Below 768 it also carries
            the time, first, because that is the clause that must not be truncated. */}
        <span className="t-meta max-md:t-body truncate text-(--text-2)">
          {item.dueAt ? (
            <span className={cn("tnum font-medium md:hidden", tierFgClass[tier])}>
              {timePillText(item.dueAt, now)} ·{" "}
            </span>
          ) : null}
          {item.cause}
        </span>
      </Link>

      {/* Track 3: the elastic spacer. It exists to stop the measure growing (§5.1). */}
      <div aria-hidden className="max-md:hidden" />

      <div className="relative flex h-8 items-center justify-self-end max-md:hidden">
        <div className="transition-[opacity,transform] duration-(--dur-quick) ease-(--ease-out) group-hover:-translate-x-1 group-hover:opacity-0 group-focus-within:-translate-x-1 group-focus-within:opacity-0">
          <TimePill dueAt={item.dueAt} now={now} tier={tier} />
        </div>
        <div className="absolute right-0 flex translate-x-1.5 items-center gap-1 opacity-0 transition-[opacity,transform] duration-(--dur-quick) ease-(--ease-out) group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 max-md:hidden">
          <Button size="sm" variant="secondary" onClick={inProgress ? onMarkDone : onStart}>
            {inProgress ? copy.actions.done : copy.actions.start}
          </Button>
          <ItemOverflowPopover
            tier={tier}
            now={now}
            nextCutoffAt={nextCutoffAt}
            onWaiting={onWaiting}
            onMoveLater={onMoveLater}
            onNotMine={onNotMine}
            trigger={
              <IconButton size="sm" aria-label={copy.actions.more}>
                <MoreHorizontal aria-hidden />
              </IconButton>
            }
          />
        </div>
      </div>
    </motion.li>
  );
}

"use client";

import { AlertTriangle, Check, ChevronRight, Clock, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { TierIcon } from "@/components/relay/tier-icon";
import { cn } from "@/lib/cn";
import { FOCUS } from "@/components/ui/sizing";
import { ModePanel, SectionHead, type Mode } from "./kit";
import { TokenSwatch } from "./token-swatch";

const modes: Mode[] = ["light", "dark", "wire"];

/**
 * The whole ladder in each mode at once, so the claim "wire keeps the lightness and drops
 * the hue" can be checked by looking across three columns instead of toggling and
 * remembering. Every swatch reads its own value from the mode panel it sits in.
 */
export function ModeLadder() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="t-eyebrow text-(--text-2)">The ladder, in all three modes</h3>
      <div className="grid gap-4 lg:grid-cols-3">
        {modes.map((mode) => (
          <ModePanel key={mode} mode={mode}>
            <div className="flex flex-col gap-2">
              {["--bg", "--surface-1", "--surface-2", "--surface-3", "--text-1", "--text-2", "--text-3", "--line-1"].map(
                (name) => (
                  <TokenSwatch key={name} varName={name} label={name} />
                ),
              )}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-(--line-1) pt-3">
              <Chip tier="now">
                <TierIcon tier="now" className="size-(--icon-sm)" />
                Act now
              </Chip>
              <Chip tier="next">
                <TierIcon tier="next" className="size-(--icon-sm)" />
                Up next
              </Chip>
              <Chip tier="later">
                <TierIcon tier="later" className="size-(--icon-sm)" />
                When you can
              </Chip>
              <Chip tier="fyi">
                <TierIcon tier="fyi" className="size-(--icon-sm)" />
                For your info
              </Chip>
              <Chip tier="success">
                <Check aria-hidden />
                Done
              </Chip>
            </div>
          </ModePanel>
        ))}
      </div>
    </div>
  );
}

/** Focus, drawn on each thing that can take it. */
export function FocusSection() {
  return (
    <section aria-labelledby="focus-heading" className="flex flex-col gap-4">
      <SectionHead id="focus-heading" title="Focus">
        One ring for everything: a 2px outline at a 2px offset, in the focus token, on
        :focus-visible only. It is an outline and not a box-shadow, so it follows the corner
        radius and needs no background to match. It is never animated in. It is there on the
        frame the key lands.
      </SectionHead>
      <div className="flex flex-wrap items-center gap-6 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-6">
        <Button forceState="focus">Mark done</Button>
        <Button variant="secondary" forceState="focus">
          Ask for help
        </Button>
        <Input forceState="focus" placeholder="Order number" className="w-44" aria-label="Focused input example" />
        <span
          data-force="focus"
          className={cn("flex h-(--h-md) items-center rounded-(--r-3) px-3 t-meta text-(--accent) underline underline-offset-2", FOCUS)}
        >
          A link in prose
        </span>
      </div>
    </section>
  );
}

const icons = [
  { Icon: Plus, name: "Plus" },
  { Icon: Check, name: "Check" },
  { Icon: X, name: "Close" },
  { Icon: Clock, name: "Clock" },
  { Icon: Search, name: "Search" },
  { Icon: ChevronRight, name: "Chevron" },
  { Icon: MoreHorizontal, name: "More" },
  { Icon: AlertTriangle, name: "Alert" },
];

/** The icon set, and the rule that an icon is never the only carrier of meaning. */
export function IconographySection() {
  return (
    <section aria-labelledby="icon-heading" className="flex flex-col gap-4">
      <SectionHead id="icon-heading" title="Iconography">
        Lucide, three sizes, and the stroke steps up with the size so the optical weight stays
        level: 16px at 1.5, 18px at 1.5, 20px at 1.75, 24px at 1.75. An icon never carries
        meaning alone. The four tier shapes are the exception that proves it, because each one
        is paired with its label everywhere it appears.
      </SectionHead>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
          <h3 className="t-eyebrow text-(--text-2)">Sizes</h3>
          {[
            { token: "--icon-sm", px: 16, stroke: 1.5 },
            { token: "--icon-md", px: 18, stroke: 1.5 },
            { token: "--icon-lg", px: 20, stroke: 1.75 },
            { token: "--icon-xl", px: 24, stroke: 1.75 },
          ].map(({ token, px, stroke }) => (
            <div key={token} className="flex items-center gap-4">
              <span className="flex w-8 justify-center text-(--text-1)">
                <Clock width={px} height={px} strokeWidth={stroke} aria-hidden />
              </span>
              <span className="t-mono text-(--text-1)">{token.replace(/^--/, "")}</span>
              <span className="t-meta text-(--text-2)">
                {px}px · stroke {stroke}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
          <h3 className="t-eyebrow text-(--text-2)">The set in use</h3>
          <ul className="grid grid-cols-4 gap-4">
            {icons.map(({ Icon, name }) => (
              <li key={name} className="flex flex-col items-center gap-1.5">
                <Icon className="size-(--icon-lg) text-(--text-1)" strokeWidth={1.75} aria-hidden />
                <span className="t-meta text-(--text-2)">{name}</span>
              </li>
            ))}
          </ul>
          <h3 className="t-eyebrow mt-1 text-(--text-2)">Tier shapes</h3>
          <ul className="flex flex-wrap gap-5">
            {(["now", "next", "later", "fyi"] as const).map((tier) => (
              <li key={tier} className="flex items-center gap-2">
                <TierIcon
                  tier={tier}
                  className={{ now: "text-(--act-fg)", next: "text-(--next-fg)", later: "text-(--when-fg)", fyi: "text-(--fyi-fg)" }[tier]}
                />
                <span className="t-meta text-(--text-1)">{{ now: "Octagon", next: "Triangle", later: "Circle", fyi: "Square" }[tier]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

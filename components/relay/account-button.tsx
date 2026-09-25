"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { PersonAvatar } from "./person-avatar";
import { FOCUS, PRESS } from "@/components/ui/sizing";

export interface AccountButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  initials: string;
  /** The accessible name. The name is deliberately *not* printed on the control — the
   * greeting two elements to the left already says it, and a top bar that says "Priya"
   * twice in 300px is the reason this one read as cluttered. */
  label: string;
}

/**
 * The top bar's account control. v4 — it replaces a 32px secondary `Button` carrying a
 * `Settings2` glyph and the literal string "Priya", which had three problems at once:
 *
 *  1. **It broke the size contract.** `sizing.ts` states the one rule the control ladder
 *     exists for — *anything sharing a row shares one entry, no 32 beside 40, ever* — and
 *     the top bar shipped 40 (search) beside 38 (mode switch) beside 32 (this). G2 never
 *     saw it, because the three sit in different containers and the check only ever
 *     compared siblings. All three are 40 now, and the check is widened to match.
 *  2. **It said the name twice.** The greeting immediately to its left is "Good morning,
 *     Priya."
 *  3. **It was not an account control.** A gear glyph reads as settings; the thing it
 *     actually opens is "who am I viewing this as".
 *
 * The shape is the one every account control converges on — avatar, chevron, one quiet
 * pill (Etsy, YouTube, Xero, GetYourGuide on Mobbin, all web) — and it is built on
 * `PersonAvatar`, so the roster, /updates and the assign popover inherit the same disc.
 */
export const AccountButton = forwardRef<HTMLButtonElement, AccountButtonProps>(
  function AccountButton({ initials, label, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          // Padding is asymmetric on purpose: a 28px disc has its own optical margin
          // inside a 40px pill, so an equal 6px each side leaves the chevron looking
          // crowded against the edge and the avatar looking loose. 5 / 7 measures even.
          // Below 768 every control step resolves to 48, which is also the only way this
          // one clears a 44px target: it is a 62×40 pill otherwise, and craft check 10
          // measures it.
          "group flex h-(--h-md) shrink-0 items-center gap-1 rounded-(--r-3) border border-(--line-1)",
          "max-md:h-(--h-lg) max-md:rounded-(--r-4) max-md:gap-1.5 max-md:pr-2.5 max-md:pl-2",
          "bg-(--surface-1) pr-1.75 pl-1.25 text-(--text-2)",
          "hover:border-(--line-2) hover:bg-(--surface-2)",
          FOCUS,
          PRESS,
          className,
        )}
        {...props}
      >
        <PersonAvatar
          initials={initials}
          className="border-transparent bg-(--surface-2) group-hover:bg-(--surface-3)"
        />
        <ChevronDown
          aria-hidden
          className="icon-sm [--icon-stroke:var(--icon-stroke-sm)] transition-transform duration-(--dur-quick) ease-(--ease-out) group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        />
      </button>
    );
  },
);

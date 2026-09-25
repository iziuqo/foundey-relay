"use client";

import * as Popover from "@radix-ui/react-popover";
import { copy } from "@/lib/copy";
import { formatClock, useNow } from "@/lib/time";
import { demoInjections } from "@/lib/seed";
import { queueFor } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { AccountButton } from "./account-button";
import { cn } from "@/lib/cn";
import { useStore } from "@/state/store";
import { SEED_NOW_ISO } from "@/state/clock";
import type { PersonaId } from "@/state/store";

/**
 * §6.6: a top bar "Demo" popover for persona switching, sending the canned urgent
 * item, jumping time, and a full reset — everything also reachable from the command
 * palette (phase 4). Light/dark/wire live in ModeSwitch, next to this trigger, not
 * here — a mode is product chrome, not a demo control. Not part of the product itself
 * (copy.settings.tooltip covers the same idea for the settings stub). Self-contained —
 * reads the store's clock directly, so the shared shell can mount it with no props.
 */
export function DemoMenu() {
  const persona = useStore((s) => s.persona);
  const team = useStore((s) => s.team);
  const items = useStore((s) => s.items);
  const jumpOffsetMs = useStore((s) => s.jumpOffsetMs);
  const setPersona = useStore((s) => s.setPersona);
  const jump = useStore((s) => s.jump);
  const resetClockOffset = useStore((s) => s.resetClockOffset);
  const inject = useStore((s) => s.inject);
  const reset = useStore((s) => s.reset);

  const now = useNow(SEED_NOW_ISO, jumpOffsetMs);
  const person = team.find((p) => p.id === persona);
  const heroId = queueFor(items, persona, now).hero?.item.id ?? null;
  const injection = demoInjections[0];
  const alreadyInjected = injection ? items.some((i) => i.id === injection.id) : true;

  function setPersonaId(id: PersonaId) {
    setPersona(id);
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <AccountButton
          initials={person?.initials ?? "??"}
          label={`${copy.demo.viewingAs}: ${person?.name ?? ""}`}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="popover-content t-meta z-50 w-72 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-3 shadow-(--e3)"
        >
          <p className="t-eyebrow text-(--text-2)">{copy.demo.viewingAs}</p>
          <div className="mt-1.5 flex gap-1.5">
            {(["u1", "m1"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPersonaId(id)}
                aria-pressed={persona === id}
                className={cn(
                  "t-meta flex-1 rounded-(--r-3) border px-2 py-1.5",
                  persona === id
                    ? "border-(--accent) bg-(--surface-2) text-(--text-1)"
                    : "border-(--line-1) text-(--text-2) hover:bg-(--surface-2)",
                )}
              >
                {id === "u1" ? copy.demo.priya : copy.demo.danielle}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-(--line-1) pt-3">
            <span className="tnum t-meta text-(--text-2)">
              {copy.demo.clockLabel}: {formatClock(now)}
            </span>
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => jump(15 * 60000)}>
                +15m
              </Button>
              <Button size="sm" variant="secondary" onClick={() => resetClockOffset(0)}>
                {copy.demo.reset}
              </Button>
            </div>
          </div>

          <Button
            className="mt-3 w-full"
            variant="secondary"
            disabled={alreadyInjected}
            onClick={() => injection && inject(injection, now.getTime(), heroId)}
          >
            {copy.demo.inject}
          </Button>

          <Button className="mt-3 w-full" variant="ghost" onClick={reset}>
            {copy.demo.resetAll}
          </Button>
          <Popover.Arrow className="fill-(--surface-1)" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

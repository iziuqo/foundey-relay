"use client";

import { RelayMark } from "./mark";
import { copy, t } from "@/lib/copy";
import { greetingPeriod, useNow } from "@/lib/time";
import { useStore } from "@/state/store";
import { SEED_NOW_ISO } from "@/state/clock";
import { DemoMenu } from "./demo-menu";
import { ModeSwitch } from "./mode-switch";
import { SearchTrigger } from "./search-trigger";

/** D11: the greeting stays, small, beside the persona control — not deleted, not a
 * headline. It cost a quarter of the first viewport at 56px on /work (v2, measured);
 * at --t-meta in the top bar it costs nothing. */
function Greeting() {
  const persona = useStore((s) => s.persona);
  const team = useStore((s) => s.team);
  const jumpOffsetMs = useStore((s) => s.jumpOffsetMs);
  const now = useNow(SEED_NOW_ISO, jumpOffsetMs);
  const person = team.find((p) => p.id === persona) ?? team[0];
  if (!person) return null;
  const greeting = t(copy.greeting[greetingPeriod(now)], { name: person.name.split(" ")[0] });
  return <span className="t-meta hidden truncate text-(--text-2) lg:inline">{greeting}</span>;
}

/** §5 shell: the mark shows only below the full nav rail (1280+ carries its own),
 * the search field opens the palette (or /lookup below the desktop shell), and the
 * greeting/mode switch/demo menu carry the rest of the chrome — never a page title,
 * so the nav rail's active state stays the single location cue (plan §10.2 M3 trap). */
export function TopBar() {
  return (
    <header className="flex h-(--h-topbar) shrink-0 items-center gap-3 border-b border-(--line-1) px-4 xl:px-6">
      <div className="flex items-center gap-2 xl:hidden">
        <RelayMark className="size-6" />
        <span className="t-body hidden font-semibold text-(--text-1) sm:inline">{copy.appName}</span>
      </div>
      <div className="flex flex-1 justify-center">
        <SearchTrigger />
      </div>
      <div className="flex items-center gap-3">
        <Greeting />
        <ModeSwitch />
        <DemoMenu />
      </div>
    </header>
  );
}

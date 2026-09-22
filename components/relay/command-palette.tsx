"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, useCommandState } from "cmdk";
import { motion } from "motion/react";
import { spring } from "@/lib/motion";
import { copy, t } from "@/lib/copy";
import { useNow } from "@/lib/time";
import { flattenedQueue, queueFor } from "@/lib/selectors";
import { scoreItem } from "@/lib/priority";
import { demoInjections } from "@/lib/seed";
import { useStore } from "@/state/store";
import { SEED_NOW_ISO } from "@/state/clock";
import type { PersonaId } from "@/state/store";
import { switchTheme } from "@/lib/theme-transition";
import { TierIcon } from "./tier-icon";
import { tierFgClass } from "./tier-tokens";
import { useIsDesktopShell } from "./use-media-query";

/** Decides whether ⌘K (or the top bar search field) opens the palette in place, or —
 * below the desktop shell's breakpoint — goes to the /lookup full page instead (§6.5). */
export function useOpenSearch(): () => void {
  const isDesktopShell = useIsDesktopShell();
  const openPalette = useStore((s) => s.openPalette);
  const router = useRouter();
  return () => {
    if (isDesktopShell) openPalette();
    else router.push("/lookup");
  };
}

interface CommandRow {
  id: string;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
  searchValue: string;
}

interface CommandGroups {
  recent: CommandRow[];
  actions: CommandRow[];
  people: CommandRow[];
  items: CommandRow[];
}

/**
 * §6.5: the palette's data, shared by the Dialog (desktop, this file) and the /lookup
 * full page (handheld) so both list the exact same things. Every row is a real store
 * action or a real link — nothing here is a mock result.
 */
function useCommandGroups(onNavigate: (href: string) => void, onDone: () => void): CommandGroups {
  const persona = useStore((s) => s.persona);
  const items = useStore((s) => s.items);
  const team = useStore((s) => s.team);
  const jumpOffsetMs = useStore((s) => s.jumpOffsetMs);
  const wireframe = useStore((s) => s.wireframe);
  const theme = useStore((s) => s.theme);
  const setPersona = useStore((s) => s.setPersona);
  const toggleWireframe = useStore((s) => s.toggleWireframe);
  const setTheme = useStore((s) => s.setTheme);
  const markDone = useStore((s) => s.markDone);
  const askHelp = useStore((s) => s.askHelp);
  const inject = useStore((s) => s.inject);
  const openShortcuts = useStore((s) => s.openShortcuts);

  const now = useNow(SEED_NOW_ISO, jumpOffsetMs);
  const queue = queueFor(items, persona, now);
  const heroId = queue.hero?.item.id ?? null;
  const injection = demoInjections[0];
  const alreadyInjected = injection ? items.some((i) => i.id === injection.id) : true;
  const otherPersonaId: PersonaId = persona === "u1" ? "m1" : "u1";
  const otherPersonaName = team.find((p) => p.id === otherPersonaId)?.name.split(" ")[0] ?? "";

  return useMemo(() => {
    const recent: CommandRow[] = flattenedQueue(queue)
      .slice(0, 5)
      .map(({ item, result }) => ({
        id: `recent-${item.id}`,
        label: item.title,
        sub: item.cause,
        icon: <TierIcon tier={result.tier as "now" | "next" | "later"} className={tierFgClass[result.tier as "now" | "next" | "later"]} />,
        onSelect: () => {
          onNavigate(`/items/${item.id}`);
          onDone();
        },
        searchValue: `${item.title} ${item.cause}`,
      }));

    const actions: CommandRow[] = [
      heroId && {
        id: "action-mark-done",
        label: copy.palette.actionMarkDone,
        shortcut: "E",
        onSelect: () => {
          markDone(heroId, now.toISOString());
          onDone();
        },
        searchValue: copy.palette.actionMarkDone,
      },
      heroId && {
        id: "action-ask-help",
        label: copy.palette.actionAskHelp,
        shortcut: "H",
        onSelect: () => {
          askHelp(heroId);
          onDone();
        },
        searchValue: copy.palette.actionAskHelp,
      },
      {
        id: "action-switch-persona",
        label: t(copy.palette.actionSwitchTo, { name: otherPersonaName }),
        onSelect: () => {
          setPersona(otherPersonaId);
          onDone();
        },
        searchValue: `switch persona ${otherPersonaName}`,
      },
      !alreadyInjected &&
        injection && {
          id: "action-send-urgent",
          label: copy.palette.actionSendUrgent,
          onSelect: () => {
            inject(injection, now.getTime(), heroId);
            onDone();
          },
          searchValue: copy.palette.actionSendUrgent,
        },
      {
        id: "action-wireframe",
        label: wireframe ? copy.palette.actionWireframeOff : copy.palette.actionWireframeOn,
        onSelect: () => {
          toggleWireframe();
          onDone();
        },
        searchValue: "wireframe mode",
      },
      {
        id: "action-theme",
        label: theme === "dark" ? copy.palette.actionThemeLight : copy.palette.actionThemeDark,
        onSelect: () => {
          onDone();
          switchTheme(() => setTheme(theme === "dark" ? "light" : "dark"));
        },
        searchValue: "theme dark light",
      },
      {
        id: "action-shortcuts",
        label: copy.palette.actionShortcuts,
        shortcut: "?",
        onSelect: () => {
          openShortcuts();
          onDone();
        },
        searchValue: "keyboard shortcuts help",
      },
    ].filter((row): row is CommandRow => Boolean(row));

    const people: CommandRow[] = team.map((person) => ({
      id: `person-${person.id}`,
      label: person.name,
      sub: person.role,
      onSelect: () => {
        onNavigate("/team");
        onDone();
      },
      searchValue: `${person.name} ${person.role}`,
    }));

    const commandItems: CommandRow[] = items
      .filter((item) => item.source !== "fyi")
      .map((item) => {
        const result = scoreItem(item, now);
        return {
          id: `item-${item.id}`,
          label: item.title,
          sub: item.cause,
          icon: <TierIcon tier={result.tier as "now" | "next" | "later"} className={tierFgClass[result.tier as "now" | "next" | "later"]} />,
          onSelect: () => {
            onNavigate(`/items/${item.id}`);
            onDone();
          },
          searchValue: `${item.title} ${item.cause}`,
        };
      });

    return { recent, actions, people, items: commandItems };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, heroId, items, team, wireframe, theme, alreadyInjected, injection, otherPersonaId, otherPersonaName, now]);
}

const groupHeadingClass =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-(length:--text-meta) [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-(--text-2) [&_[cmdk-group-heading]]:uppercase";

/** M9: the selected row's highlight glides between rows (a shared `layoutId`) instead
 * of jumping — cmdk exposes the current selection via `useCommandState` so each row can
 * tell whether it's the one carrying the highlight right now. */
function Row({ row }: { row: CommandRow }) {
  const active = useCommandState((state) => state.value.toLowerCase() === row.searchValue.toLowerCase());
  return (
    <CommandItem
      value={row.searchValue}
      onSelect={row.onSelect}
      className="relative flex cursor-pointer items-center gap-3 rounded-(--radius-control) px-3 py-2.5"
    >
      {active && (
        <motion.div
          layoutId="palette-highlight"
          transition={spring.snappy}
          className="absolute inset-0 -z-10 rounded-(--radius-control) bg-(--surface-2)"
        />
      )}
      {row.icon}
      <span className="min-w-0 flex-1 truncate text-(length:--text-body) text-(--text-1)">{row.label}</span>
      {row.sub && <span className="truncate text-(length:--text-meta) text-(--text-2)">{row.sub}</span>}
      {row.shortcut && (
        <kbd
          data-kbd
          className="tnum shrink-0 rounded-(--radius-chip) border border-(--border-1) bg-(--surface-2) px-1.5 py-0.5 text-(length:--text-kbd) leading-(length:--leading-kbd) text-(--text-2)"
        >
          {row.shortcut}
        </kbd>
      )}
    </CommandItem>
  );
}

export function CommandMenuBody({
  onNavigate,
  onDone,
}: {
  onNavigate: (href: string) => void;
  onDone: () => void;
}) {
  const groups = useCommandGroups(onNavigate, onDone);
  return (
    <>
      <CommandInput
        autoFocus
        placeholder={copy.search}
        className="h-(--size-control-lg) w-full border-b border-(--border-1) bg-transparent px-4 text-(length:--text-body) text-(--text-1) outline-none placeholder:text-(--text-3)"
      />
      <CommandList className="max-h-[60vh] overflow-y-auto p-2">
        <CommandEmpty className="p-6 text-center text-(length:--text-meta) text-(--text-2)">{copy.palette.empty}</CommandEmpty>
        {groups.recent.length > 0 && (
          <CommandGroup
            heading={copy.palette.recent}
            className={groupHeadingClass}
          >
            {groups.recent.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </CommandGroup>
        )}
        <CommandGroup
          heading={copy.palette.actions}
          className={groupHeadingClass}
        >
          {groups.actions.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </CommandGroup>
        <CommandGroup
          heading={copy.palette.people}
          className={groupHeadingClass}
        >
          {groups.people.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </CommandGroup>
        <CommandGroup
          heading={copy.palette.items}
          className={groupHeadingClass}
        >
          {groups.items.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </CommandGroup>
      </CommandList>
      <div className="border-t border-(--border-1) px-4 py-2 text-(length:--text-kbd) leading-(length:--leading-kbd) text-(--text-2)" data-kbd>
        {copy.palette.footer}
      </div>
    </>
  );
}

/** §6.5: `⌘K` anywhere, or the search field in the top bar — desktop shell only, a
 * Radix Dialog wrapping a bare `Command` (not cmdk's own `CommandDialog`, which
 * renders no accessible title of its own — G4 needs one). Below the desktop shell's
 * breakpoint, `useOpenSearch` sends the same content to the full-page `/lookup` route
 * instead (`app/(app)/lookup/page.tsx`), never this dialog. */
export function CommandPalette() {
  const open = useStore((s) => s.paletteOpen);
  const closePalette = useStore((s) => s.closePalette);
  const router = useRouter();

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && closePalette()}>
      <Dialog.Portal>
        <Dialog.Overlay className="palette-overlay fixed inset-0 z-50 bg-(--overlay) [backdrop-filter:blur(8px)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="palette-content fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-(--radius-hero) border border-(--border-1) bg-(--surface-1) shadow-(--shadow-e3) outline-none"
        >
          <Dialog.Title className="sr-only">{copy.palette.title}</Dialog.Title>
          <Command shouldFilter loop label={copy.palette.title}>
            <CommandMenuBody onNavigate={(href) => router.push(href)} onDone={closePalette} />
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

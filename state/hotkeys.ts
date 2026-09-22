/**
 * §8.5: one hotkey module. J/K move selection, Enter opens the selected row, E marks
 * the hero done, H asks for help, ⌘Z undoes, ⌘K opens the palette, ? opens the
 * shortcuts sheet. Screens wire their handlers to this map in Phase 3/4; the guard
 * below is the part that's pure and worth pinning down now (README P0 5: Enter was
 * hijacked from inputs, links, and buttons).
 */
export type HotkeyName =
  | "moveDown"
  | "moveUp"
  | "open"
  | "markDone"
  | "askHelp"
  | "undo"
  | "palette"
  | "shortcutsHelp";

export interface HotkeyBinding {
  key: string;
  meta?: boolean;
  shift?: boolean;
}

export const HOTKEYS: Record<HotkeyName, HotkeyBinding> = {
  moveDown: { key: "j" },
  moveUp: { key: "k" },
  open: { key: "Enter" },
  markDone: { key: "e" },
  askHelp: { key: "h" },
  undo: { key: "z", meta: true },
  palette: { key: "k", meta: true },
  shortcutsHelp: { key: "?" },
};

interface MinimalElement {
  tagName: string;
  isContentEditable?: boolean;
  closest?(selector: string): unknown;
}

/**
 * True when a hotkey should be ignored because the event's target is inside an
 * input, a button, a link, or a dialog (README P0 5). Takes a minimal duck-typed
 * shape instead of `Element` so it's testable without a DOM.
 */
export function shouldIgnoreHotkey(target: MinimalElement | null): boolean {
  if (!target) return false;
  const tag = target.tagName?.toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") {
    return true;
  }
  if (target.isContentEditable) return true;
  if (target.closest?.('[role="dialog"], [data-radix-popper-content-wrapper]')) return true;
  return false;
}

export function matchesBinding(
  event: { key: string; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean },
  binding: HotkeyBinding,
): boolean {
  const metaOk = binding.meta ? Boolean(event.metaKey || event.ctrlKey) : !event.metaKey && !event.ctrlKey;
  const shiftOk = binding.shift ? Boolean(event.shiftKey) : !event.shiftKey;
  return event.key.toLowerCase() === binding.key.toLowerCase() && metaOk && shiftOk;
}

export function resolveHotkey(
  event: { key: string; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean },
  target: MinimalElement | null,
): HotkeyName | null {
  if (shouldIgnoreHotkey(target)) return null;
  for (const name of Object.keys(HOTKEYS) as HotkeyName[]) {
    if (matchesBinding(event, HOTKEYS[name])) return name;
  }
  return null;
}

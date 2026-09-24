import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gradeLevel } from "./readability";
import { copy, t } from "../../lib/copy";
import seedRaw from "../../plan/seed.json";
import { items, demoInjections } from "../../lib/seed";

describe("copy tier labels (§8.6, §4.6)", () => {
  it("third tier reads 'When you can', ids stay now/next/later", () => {
    expect(copy.tiers.now.label).toBe("Act now");
    expect(copy.tiers.next.label).toBe("Up next");
    expect(copy.tiers.later.label).toBe("When you can");
  });

  it("no fixture still carries the retired 'Later today' label", () => {
    const allRaw = [...seedRaw.items, ...seedRaw.demoInjections];
    for (const item of allRaw) {
      if (item._expected) expect(item._expected.tier).not.toBe("Later today");
    }
  });

  it("seed fixtures normalize to the 'later' tier id, matching the renamed label", () => {
    const laterItems = [...items, ...demoInjections].filter((i) => i._expected?.tier === "later");
    expect(laterItems.length).toBeGreaterThan(0);
  });
});

describe("t()", () => {
  it("substitutes named placeholders and leaves unknown ones untouched", () => {
    expect(t(copy.status.progress, { done: 4, total: 10 })).toBe("4 of 10 done today.");
    expect(t("{missing} stays")).toBe("{missing} stays");
  });
});

/* =====================================================================================
 * G9 — copy. Extended by v3 M4 for the worker screen's own strings.
 * =================================================================================== */

/** The generic labels a button falls back to when nobody decided what it does. The
 *  hero's primary may never be one of them: it carries the item's own action. */
const GENERIC = ["Start", "Open", "Go", "View", "Details", "Done", "Mark done", "Continue"];

describe("G9 buttons say the verb (§5.1, advisor §7.3)", () => {
  it("the completion action is the verb form, not the object", () => {
    // v1 shipped "Done" on a button, which names the state rather than the act. The
    // distinction matters most here, on the largest control on the most important
    // screen.
    expect(copy.actions.done).toBe("Mark done");
    expect(copy.actions.help).toBe("Ask for help");
    expect(copy.actions.later).toBe("Move to later");
  });

  it("every item's own primary action is specific to that item, not a generic label", () => {
    // The hero's primary button carries `item.primaryAction` verbatim (hero.tsx), so
    // this is what the biggest control on /work actually says. §5.1: "The primary
    // button says the verb (\"Reprint hazmat labels\")" — a generic label there is the
    // defect, and a one-word one cannot be an instruction.
    const generic = [...items, ...demoInjections]
      .map((i) => i.primaryAction)
      .filter((a): a is string => Boolean(a))
      .filter((a) => GENERIC.includes(a) || a.trim().split(/\s+/).length < 2);
    expect(generic).toEqual([]);
  });

  it("no item's primary action opens with an article — a button is an imperative", () => {
    const articled = [...items, ...demoInjections]
      .map((i) => i.primaryAction)
      .filter((a): a is string => Boolean(a))
      .filter((a) => /^(the|a|an|your|this)\b/i.test(a.trim()));
    expect(articled).toEqual([]);
  });
});

describe("G9 the status line (§5.1)", () => {
  it("its clauses carry no full stop — they are joined by a separator, not sentences", () => {
    const clauses = Object.entries(copy.status).filter(([key]) => key.startsWith("clause"));
    expect(clauses.length).toBeGreaterThan(0);
    for (const [key, text] of clauses) {
      expect(text.endsWith("."), `${key} ends in a full stop`).toBe(false);
    }
  });

  it("the operative clause answers 'what needs me', not 'who am I'", () => {
    expect(t(copy.status.clauseNeedYou, { n: 2 })).toBe("2 need you now");
    expect(copy.status.clauseNeedYouOne).toBe("1 needs you now");
    // The greeting survives, but only in the top bar (M3's `Greeting`) — the status line
    // may not open with it. v2's did, at 56px.
    for (const [, text] of Object.entries(copy.status)) {
      expect(text.toLowerCase().includes("good morning")).toBe(false);
    }
  });
});

describe("G9 the rail says each thing once (§7.3)", () => {
  it("the departure line does not repeat the carrier or the door the card already shows", () => {
    for (const line of [copy.truckClock.railLeavesIn, copy.truckClock.railLeavesAt, copy.truckClock.railDeparted]) {
      expect(line.includes("{carrier}"), `"${line}" repeats the card's own title`).toBe(false);
      expect(line.includes("{door}"), `"${line}" repeats the card's own door chip`).toBe(false);
    }
  });
});

/* =====================================================================================
 * G9 — copy, applied to the whole app (M14). M4 asserted the worker screen's own strings
 * and M10 the deck's; nothing read the rest of lib/copy.ts, which is most of what a
 * person actually reads. These three run over every string in it.
 * =================================================================================== */

/** Every string in `copy`, with the path that reaches it. Arrays are walked by index. */
function strings(node: unknown, path = "copy"): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([k, v]) => strings(v, `${path}.${k}`));
  }
  return [];
}

const ALL = strings(copy);

/** `{n}` → a number, `{hhmm}` → a clock time, anything else → a short word. Placeholders
 *  are what people see filled, and an unfilled brace would grade as a long word. */
function filled(text: string): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => (/^(n|done|total|i|t|b|score|scoreA|scoreB|value|max|now|next|later|h|m|on|brk|out)$/.test(key) ? "4" : key === "hhmm" ? "10:40" : "Priya"));
}

describe("G9 reading level (grade ≤ 8), every sentence in the app", () => {
  // Fragments ("Act now", "Done today ({n})") have no sentence to grade: Flesch–Kincaid on
  // three words measures the words, not the prose. The floor is where prose starts.
  const prose = ALL.filter(([, text]) => filled(text).trim().split(/\s+/).length >= 8);

  it("reads a real sample, not three strings", () => {
    expect(prose.length).toBeGreaterThan(12);
  });

  it.each(prose.map(([path, text]) => [path, filled(text)] as const))("%s", (_path, text) => {
    expect(gradeLevel(text), `"${text}"`).toBeLessThanOrEqual(8);
  });
});

describe("G9 buttons and menu rows open with a verb, everywhere", () => {
  const VERBS = new Set([
    "start", "mark", "ask", "move", "hand", "reassign", "assign", "see", "show", "undo", "stay", "acknowledge",
    "send", "pick", "open", "find", "clear", "close", "reset", "jump", "help", "switch", "turn", "back", "add",
  ]);

  /** Labels that are labels on purpose, each with why. A new noun-first button fails
   *  here until someone decides it belongs on this list — that decision is the gate. */
  const NOT_A_VERB: Record<string, string> = {
    "copy.actions.more": "an overflow trigger's accessible name; the icon is the affordance",
    "copy.actions.waiting": "a menu row that names the state the item is moving to (M4 §5.1), like its siblings",
    "copy.actions.notMine": "a menu row that names the reason, like 'Wrong area' beside it",
        "copy.itemDetail.prev": "an icon button's accessible name: 'Previous item' is what the icon does",
    "copy.itemDetail.next": "an icon button's accessible name: 'Next item' is what the icon does",
    "copy.team.suggested": "a section label inside the reassign picker, not a control",
  };

  const controls: (readonly [string, string])[] = [
    ...Object.entries(copy.actions).map(([k, v]) => [`copy.actions.${k}`, v] as const),
    ["copy.help.send", copy.help.send],
    ["copy.team.openQueue", copy.team.openQueue],
    ["copy.team.reassignCurrent", copy.team.reassignCurrent],
    ["copy.team.clearFilter", copy.team.clearFilter],
    ["copy.team.findTeammate", copy.team.findTeammate],
    ["copy.updates.markRead", copy.updates.markRead],
    ["copy.allClear.team", copy.allClear.team],
    ["copy.allClear.updates", copy.allClear.updates],
    ["copy.demo.jump", copy.demo.jump],
    ["copy.demo.reset", copy.demo.reset],
    ["copy.demo.inject", copy.demo.inject],
    ["copy.demo.resetAll", copy.demo.resetAll],
    ["copy.itemDetail.close", copy.itemDetail.close],
    ["copy.itemDetail.backToWork", copy.itemDetail.backToWork],
    ["copy.itemDetail.prev", copy.itemDetail.prev],
    ["copy.itemDetail.next", copy.itemDetail.next],
    ["copy.palette.actionMarkDone", copy.palette.actionMarkDone],
    ["copy.palette.actionAskHelp", copy.palette.actionAskHelp],
    ["copy.palette.actionSwitchTo", copy.palette.actionSwitchTo],
    ["copy.palette.actionSendUrgent", copy.palette.actionSendUrgent],
    ["copy.palette.actionWireframeOn", copy.palette.actionWireframeOn],
    ["copy.palette.actionWireframeOff", copy.palette.actionWireframeOff],
    ["copy.palette.actionThemeDark", copy.palette.actionThemeDark],
    ["copy.palette.actionThemeLight", copy.palette.actionThemeLight],
    ["copy.palette.actionShortcuts", copy.palette.actionShortcuts],
    ["copy.moveLaterOptions.pick", copy.moveLaterOptions.pick],
  ];

  it.each(controls)("%s", (path, label) => {
    const first = label.trim().split(/\s+/)[0]!.toLowerCase().replace(/[^a-z]/g, "");
    if (NOT_A_VERB[path]) return;
    expect(VERBS.has(first), `"${label}" opens with "${first}", which is not a known verb`).toBe(true);
  });

  it("every exception on the list is still a real key, so the list cannot rot", () => {
    const known = new Set(ALL.map(([path]) => path));
    for (const path of Object.keys(NOT_A_VERB)) expect(known.has(path), path).toBe(true);
  });
});

describe("G9 no orphaned labels", () => {
  it("no string is a label with its value missing — nothing ends in a colon or a dangling separator", () => {
    // 'Why first:' and 'Next step: {action}' are fine (a value follows in the same
    // string or in the next node); a string that *ends* on a bare separator is not, and
    // 'Why first:' is the one intended exception, followed by the reason in its own node.
    const dangling = ALL.filter(([path, text]) => /[:·,\-–—]\s*$/.test(text) && path !== "copy.hero.whyFirst");
    expect(dangling.map(([path]) => path)).toEqual([]);
  });

  it("every placeholder in a string is one that its caller can fill, by name", () => {
    // A typo'd placeholder ('{nn}') renders as literal braces on a warehouse display.
    // `t()` leaves unknown ones untouched by design, so the only way to catch it is to
    // check the names against the vocabulary the callers actually pass.
    const KNOWN = new Set([
      "n", "done", "total", "carrier", "rel", "hhmm", "door", "name", "title", "who", "action", "i", "t", "b", "score",
      "scoreA", "scoreB", "value", "max", "query", "on", "brk", "out", "now", "next", "later", "source", "h", "m",
    ]);
    const unknown = ALL.flatMap(([path, text]) =>
      [...text.matchAll(/\{(\w+)\}/g)].filter((m) => !KNOWN.has(m[1]!)).map((m) => `${path}: {${m[1]}}`),
    );
    expect(unknown).toEqual([]);
  });

  it("every leaf of copy is read by something — no v2 string left behind", () => {
    // Walk src for `.key` / `key:` / ["key"] uses of each leaf's final segment. A key
    // reached only through a computed lookup (copy.tiers[tier].label) is credited to its
    // parent, so this errs toward "used" and only flags what nothing could be reading.
    const dirs = ["app", "components", "state", "lib"];
    const chunks: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.tsx?$/.test(entry) && !/copy\.ts$|\.test\.ts$/.test(entry)) chunks.push(readFileSync(path, "utf8"));
      }
    };
    dirs.forEach((d) => walk(join(process.cwd(), d)));
    const source = chunks.join("\n");
    const unused = ALL.map(([path]) => path).filter((path) => {
      const segments = path.replace(/\[(\d+)\]/g, "").split(".").slice(1);
      const leaf = segments.at(-1)!;
      if (new RegExp(`[.\\["']${leaf}\\b`).test(source)) return false;
      // Dynamic access on the parent: copy.tiers[tier], copy.sourceLabels[source].
      const parent = segments.at(-2);
      return !(parent && new RegExp(`${parent}\\[`).test(source));
    });
    expect(unused).toEqual([]);
  });
});

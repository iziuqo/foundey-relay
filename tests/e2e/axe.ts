import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { animationsSettled } from "./settle";

/**
 * Runs axe and returns one short line per violation, ready to assert against `[]`.
 *
 * The shape this replaces — `expect(violations, JSON.stringify(violations, null, 2))` —
 * put the entire axe result tree into the failure message. The /deck/print failure that
 * found the duplicate landmarks was 232KB of JSON: most of a context window spent on
 * information that fits in four lines, and the same tree is already written to
 * test-results/ on disk. The line below keeps what you actually act on — which rule,
 * how bad, how many nodes, and where the first one is. Read the file when you need the
 * rest, which is rare.
 */
export async function axeViolations(page: Page): Promise<string[]> {
  await animationsSettled(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.map((v) => {
    const nodes = `${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"}`;
    return `${v.id} (${v.impact}, ${nodes}) → ${v.nodes[0]?.target.join(", ") ?? "?"}`;
  });
}

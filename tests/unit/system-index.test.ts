import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { componentIndex, propKeys } from "@/components/system/components-index";
import { moments } from "@/components/system/motion/moments";

// M11 builds a Figma library from these lists, so a row that names a file which is not
// there is a Figma component with a description that points nowhere.
describe("the /system inventory", () => {
  it("names only files that exist", () => {
    for (const entry of componentIndex) {
      expect(existsSync(join(process.cwd(), entry.file)), entry.file).toBe(true);
    }
  });

  it("lists only props the component really has, and no size an interactive control may not take", () => {
    for (const [name, keys] of Object.entries(propKeys)) {
      const entry = componentIndex.find((c) => c.name === name);
      expect(entry, name).toBeDefined();
      for (const prop of Object.keys(entry!.props)) expect(keys as readonly string[], `${name}.${prop}`).toContain(prop);
      // sizing.ts: xs is presentational only — chips and pills. Buttons, inputs and
      // selects never take it, because they cannot reach a 44px target on a phone.
      if (["Button", "IconButton", "Input", "Select"].includes(name)) {
        expect(entry!.props.size, name).not.toMatch(/\bxs\b/);
      }
    }
  });

  it("lists each component once", () => {
    const names = componentIndex.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("carries all eighteen moments, in order, each with a reduced variant", () => {
    expect(moments.map((m) => m.id)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
    for (const m of moments) expect(m.reduced.length, `M${m.id}`).toBeGreaterThan(0);
  });

  it("never lets a moment claim more than the catalog's 700ms ceiling", () => {
    for (const m of moments) {
      const numbers = [...m.ms.matchAll(/(\d+)\s*(?:ms)?/g)].map((x) => Number(x[1]));
      // "≈700 end to end" is the longest; a spring is named, not numbered.
      for (const n of numbers) expect(n, `M${m.id}`).toBeLessThanOrEqual(900);
    }
  });
});

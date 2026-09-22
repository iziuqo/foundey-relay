import { describe, it, expect } from "vitest";
import { shouldIgnoreHotkey, resolveHotkey } from "./hotkeys";

describe("shouldIgnoreHotkey (README P0 5)", () => {
  it("ignores inputs, buttons, links, and content-editable elements", () => {
    expect(shouldIgnoreHotkey({ tagName: "INPUT" })).toBe(true);
    expect(shouldIgnoreHotkey({ tagName: "TEXTAREA" })).toBe(true);
    expect(shouldIgnoreHotkey({ tagName: "BUTTON" })).toBe(true);
    expect(shouldIgnoreHotkey({ tagName: "A" })).toBe(true);
    expect(shouldIgnoreHotkey({ tagName: "DIV", isContentEditable: true })).toBe(true);
  });

  it("ignores anything inside an open dialog", () => {
    expect(
      shouldIgnoreHotkey({
        tagName: "SPAN",
        closest: (sel: string) => (sel.includes("dialog") ? {} : null),
      }),
    ).toBe(true);
  });

  it("does not ignore a plain row", () => {
    expect(shouldIgnoreHotkey({ tagName: "LI", closest: () => null })).toBe(false);
  });
});

describe("resolveHotkey", () => {
  it("resolves J/K/Enter on a plain target", () => {
    const target = { tagName: "LI", closest: () => null };
    expect(resolveHotkey({ key: "j" }, target)).toBe("moveDown");
    expect(resolveHotkey({ key: "k" }, target)).toBe("moveUp");
    expect(resolveHotkey({ key: "Enter" }, target)).toBe("open");
  });

  it("never fires Enter inside an input (README P0 5)", () => {
    expect(resolveHotkey({ key: "Enter" }, { tagName: "INPUT" })).toBeNull();
  });

  it("requires the meta/ctrl modifier for undo and the palette", () => {
    const target = { tagName: "LI", closest: () => null };
    expect(resolveHotkey({ key: "z" }, target)).toBeNull();
    expect(resolveHotkey({ key: "z", metaKey: true }, target)).toBe("undo");
    expect(resolveHotkey({ key: "k", ctrlKey: true }, target)).toBe("palette");
  });
});

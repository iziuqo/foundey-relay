import { describe, it, expect } from "vitest";
import { items, team, doneToday } from "../lib/seed";
import {
  start,
  markDone,
  askHelp,
  notMine,
  reassign,
  moveLater,
  inject,
  type Snapshot,
} from "./actions";

const NOW_ISO = "2026-09-22T10:41:00-07:00";

function baseSnapshot(): Snapshot {
  return { items: structuredClone(items), team: structuredClone(team), doneLog: structuredClone(doneToday) };
}

describe("start", () => {
  it("pauses whatever the actor was already working on", () => {
    const snap = baseSnapshot();
    const actor = snap.team.find((p) => p.id === "u1")!;
    expect(actor.currentTaskId).toBe("it-01");

    const { snapshot, pausedTitle } = start(snap, "it-03", "u1", NOW_ISO);
    expect(pausedTitle).not.toBeNull();
    expect(snapshot.items.find((i) => i.id === "it-01")!.status).toBe("open");
    expect(snapshot.items.find((i) => i.id === "it-03")!.status).toBe("in_progress");
    expect(snapshot.team.find((p) => p.id === "u1")!.currentTaskId).toBe("it-03");
  });
});

describe("markDone", () => {
  it("marks the item done, frees its assignee, and appends the done log", () => {
    const snap = baseSnapshot();
    const before = snap.doneLog.filter((d) => d.assigneeId === "u1").length;

    const next = markDone(snap, "it-01", NOW_ISO);
    expect(next.items.find((i) => i.id === "it-01")!.status).toBe("done");
    expect(next.team.find((p) => p.id === "u1")!.currentTaskId).toBeNull();
    expect(next.doneLog.filter((d) => d.assigneeId === "u1").length).toBe(before + 1);
  });

  it("is a no-op for an unknown item id", () => {
    const snap = baseSnapshot();
    expect(markDone(snap, "nope", NOW_ISO)).toBe(snap);
  });
});

describe("askHelp (§8.6)", () => {
  it("flags the item, whatever its status or age", () => {
    const snap = baseSnapshot();
    const next = askHelp(snap, "it-01");
    expect(next.items.find((i) => i.id === "it-01")!.helpAsked).toBe(true);
  });
});

describe("notMine", () => {
  it("clears the assignee and bumps notMineCount", () => {
    const snap = baseSnapshot();
    const next = notMine(snap, "it-01");
    const item = next.items.find((i) => i.id === "it-01")!;
    expect(item.assigneeId).toBeNull();
    expect(item.notMineCount).toBe(1);
    expect(item.status).toBe("open");
  });
});

describe("reassign", () => {
  it("moves the item, tags it escalated, and rewrites the cause", () => {
    const snap = baseSnapshot();
    const { snapshot, recipientFirstName } = reassign(snap, "it-01", "m1", "u1");
    const item = snapshot.items.find((i) => i.id === "it-01")!;
    expect(item.assigneeId).toBe("m1");
    expect(item.escalated).toBe(true);
    expect(item.cause.startsWith("From Priya:")).toBe(true);
    expect(recipientFirstName).toBe(snapshot.team.find((p) => p.id === "m1")!.name.split(" ")[0]);
  });
});

describe("moveLater", () => {
  it("snoozes the item until the given time", () => {
    const snap = baseSnapshot();
    const next = moveLater(snap, "it-05", "2026-09-22T13:00:00-07:00");
    const item = next.items.find((i) => i.id === "it-05")!;
    expect(item.status).toBe("snoozed");
    expect(item.snoozeUntil).toBe("2026-09-22T13:00:00-07:00");
  });
});

describe("inject", () => {
  it("adds a new item once and is idempotent on replay", () => {
    const snap = baseSnapshot();
    const newItem = { ...items[0], id: "it-injected" };
    const once = inject(snap, newItem);
    expect(once.items.some((i) => i.id === "it-injected")).toBe(true);

    const twice = inject(once, newItem);
    expect(twice).toBe(once);
  });
});

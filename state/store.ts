import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { items as seedItems, team as seedTeam, doneToday as seedDoneToday } from "../lib/seed";
import { totalTodayFor } from "../lib/selectors";
import { copy, t } from "../lib/copy";
import type { Item, Person, DoneEntry } from "../lib/types";
import * as actions from "./actions";
import type { Snapshot } from "./actions";

export type PersonaId = "u1" | "m1";

export interface ToastState {
  message: string;
  kind: "default" | "undo-restored";
  undoable: boolean;
  durationMs: number;
  key: number;
}

export interface PendingPromotion {
  itemId: string;
  frozenHeroId: string | null;
  dismissed: boolean;
}

export type Theme = "light" | "dark";

interface DemoState extends Snapshot {
  jumpOffsetMs: number;
  persona: PersonaId;
  theme: Theme;
  wireframe: boolean;
  readIds: string[];
  acknowledgedIds: string[];
  toast: ToastState | null;
  undoSnapshot: Snapshot | null;
  pendingPromotion: PendingPromotion | null;
  lastInteractionAt: number;
  awayPromotions: number;
  paletteOpen: boolean;
  shortcutsOpen: boolean;
}

interface DemoActions {
  start: (itemId: string, actorId: string, nowIso: string) => void;
  markDone: (itemId: string, nowIso: string) => void;
  undo: () => void;
  askHelp: (itemId: string, reason?: string, note?: string) => void;
  waiting: (itemId: string, waitingOn: string, checkBackAt: string) => void;
  notMine: (itemId: string) => void;
  reassign: (itemId: string, toPersonId: string, actorId: string) => void;
  moveLater: (itemId: string, snoozeUntil: string) => void;
  inject: (item: Item, nowMs: number, currentHeroId: string | null) => void;
  showPending: () => void;
  dismissPending: () => void;
  jump: (byMs: number) => void;
  resetClockOffset: (jumpOffsetMs: number) => void;
  reset: () => void;
  setPersona: (persona: PersonaId) => void;
  setTheme: (theme: Theme) => void;
  toggleWireframe: () => void;
  setWireframe: (wireframe: boolean) => void;
  clearToast: () => void;
  logInteraction: (atMs: number) => void;
  markRead: (itemId: string) => void;
  acknowledge: (itemId: string) => void;
  totalToday: (personId: string) => { done: number; total: number };
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
}

export type DemoStore = DemoState & DemoActions;

const STORAGE_KEY = "relay-demo-v2";

function initialState(): DemoState {
  return {
    items: structuredClone(seedItems),
    team: structuredClone(seedTeam),
    doneLog: structuredClone(seedDoneToday),
    jumpOffsetMs: 0,
    persona: "u1",
    theme: "light",
    wireframe: false,
    readIds: [],
    acknowledgedIds: [],
    toast: null,
    undoSnapshot: null,
    pendingPromotion: null,
    lastInteractionAt: 0,
    awayPromotions: 0,
    paletteOpen: false,
    shortcutsOpen: false,
  };
}

function snapshotOf(state: DemoState): Snapshot {
  return actions.cloneSnapshot({ items: state.items, team: state.team, doneLog: state.doneLog });
}

function withToast(
  patch: Partial<DemoState>,
  message: string,
  undoable: boolean,
  durationMs = 8000,
): Partial<DemoState> {
  return { ...patch, toast: { message, kind: "default", undoable, durationMs, key: Date.now() } };
}

export const useStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      start: (itemId, actorId, nowIso) =>
        set((state) => {
          const before = snapshotOf(state);
          const { snapshot, pausedTitle } = actions.start(state, itemId, actorId, nowIso);
          const patch: Partial<DemoState> = { ...snapshot, undoSnapshot: before };
          return pausedTitle
            ? withToast(patch, t(copy.toast.paused, { title: pausedTitle }), true)
            : { ...patch, toast: null };
        }),

      markDone: (itemId, nowIso) =>
        set((state) => {
          const item = state.items.find((i) => i.id === itemId);
          if (!item) return state;
          const before = snapshotOf(state);
          const snapshot = actions.markDone(state, itemId, nowIso);
          const personId = item.assigneeId ?? state.persona;
          const { done, total } = totalTodayFor(snapshot.items, snapshot.doneLog, personId);
          const patch: Partial<DemoState> = {
            ...snapshot,
            undoSnapshot: before,
            pendingPromotion:
              state.pendingPromotion?.frozenHeroId === itemId ? null : state.pendingPromotion,
          };
          // M1: a 6s undo ring, not the generic 8s toast window.
          return withToast(patch, t(copy.toast.done, { done, total }), true, 6000);
        }),

      undo: () =>
        set((state) => {
          if (!state.undoSnapshot) return state;
          return {
            ...state,
            ...state.undoSnapshot,
            undoSnapshot: null,
            toast: { message: copy.toast.restored, kind: "undo-restored", undoable: false, durationMs: 2000, key: Date.now() },
          };
        }),

      askHelp: (itemId, reason, note) =>
        set((state) => ({
          ...withToast({ ...actions.askHelp(state, itemId, reason, note), undoSnapshot: null }, copy.toast.helpSent, false),
        })),

      waiting: (itemId, waitingOn, checkBackAt) =>
        set((state) => {
          const before = snapshotOf(state);
          const snapshot = actions.waiting(state, itemId, waitingOn, checkBackAt);
          const hhmm = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Los_Angeles",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(checkBackAt));
          return withToast(
            { ...snapshot, undoSnapshot: before },
            t(copy.toast.waiting, { who: waitingOn, hhmm }),
            true,
          );
        }),

      notMine: (itemId) =>
        set((state) => {
          const before = snapshotOf(state);
          const snapshot = actions.notMine(state, itemId);
          return withToast({ ...snapshot, undoSnapshot: before }, copy.toast.sentBack, true);
        }),

      reassign: (itemId, toPersonId, actorId) =>
        set((state) => {
          const before = snapshotOf(state);
          const { snapshot, recipientFirstName } = actions.reassign(state, itemId, toPersonId, actorId);
          return withToast(
            { ...snapshot, undoSnapshot: before },
            t(copy.toast.moved, { name: recipientFirstName }),
            true,
          );
        }),

      moveLater: (itemId, snoozeUntil) =>
        set((state) => ({ ...actions.moveLater(state, itemId, snoozeUntil), undoSnapshot: null, toast: null })),

      inject: (item, nowMs, currentHeroId) =>
        set((state) => {
          const snapshot = actions.inject(state, item);
          if (snapshot === state) return state;
          const idleMs = nowMs - state.lastInteractionAt;
          if (idleMs >= 8000) {
            return { ...snapshot, pendingPromotion: null, awayPromotions: state.awayPromotions + 1 };
          }
          return {
            ...snapshot,
            pendingPromotion: { itemId: item.id, frozenHeroId: currentHeroId, dismissed: false },
          };
        }),

      showPending: () => set({ pendingPromotion: null }),

      dismissPending: () =>
        set((state) =>
          state.pendingPromotion
            ? { pendingPromotion: { ...state.pendingPromotion, dismissed: true } }
            : state,
        ),

      jump: (byMs) => set((state) => ({ jumpOffsetMs: state.jumpOffsetMs + byMs })),

      resetClockOffset: (jumpOffsetMs) => set({ jumpOffsetMs }),

      reset: () => set(initialState()),

      setPersona: (persona) => set({ persona }),

      setTheme: (theme) => set({ theme }),

      toggleWireframe: () => set((state) => ({ wireframe: !state.wireframe })),

      setWireframe: (wireframe) => set({ wireframe }),

      clearToast: () =>
        set((state) => ({
          toast: null,
          undoSnapshot: state.toast?.undoable ? state.undoSnapshot : null,
        })),

      logInteraction: (atMs) => set({ lastInteractionAt: atMs }),

      markRead: (itemId) =>
        set((state) =>
          state.readIds.includes(itemId) ? state : { readIds: [...state.readIds, itemId] },
        ),

      acknowledge: (itemId) =>
        set((state) =>
          state.acknowledgedIds.includes(itemId)
            ? state
            : { acknowledgedIds: [...state.acknowledgedIds, itemId] },
        ),

      totalToday: (personId) => {
        const state = get();
        return totalTodayFor(state.items, state.doneLog, personId);
      },

      openPalette: () => set({ paletteOpen: true }),
      closePalette: () => set({ paletteOpen: false }),
      togglePalette: () => set((state) => ({ paletteOpen: !state.paletteOpen })),

      openShortcuts: () => set({ shortcutsOpen: true }),
      closeShortcuts: () => set({ shortcutsOpen: false }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        team: state.team,
        doneLog: state.doneLog,
        jumpOffsetMs: state.jumpOffsetMs,
        persona: state.persona,
        theme: state.theme,
        wireframe: state.wireframe,
        readIds: state.readIds,
        acknowledgedIds: state.acknowledgedIds,
      }),
    },
  ),
);

export type { Item, Person, DoneEntry };

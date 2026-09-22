import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { items as seedItems, team as seedTeam, doneToday as seedDoneToday, demoInjections } from '../data/seed'
import { reassignedCause } from '../lib/priority'
import { totalTodayFor } from '../lib/selectors'
import { simNowFrom } from '../lib/time'
import type { Item, Person, DoneEntry, Status } from '../lib/types'

const STORAGE_KEY = 'relay-demo-v1'
export const SEED_NOW_ISO = '2026-09-22T10:40:00-07:00'

export type PersonaId = 'u1' | 'm1'

export interface ToastState {
  message: string
  kind: 'default' | 'undo-restored'
  undoable: boolean
  durationMs: number
  key: number
}

export interface PendingPromotion {
  itemId: string
  frozenHeroId: string | null
  dismissed: boolean
}

interface Snapshot {
  items: Item[]
  team: Person[]
  doneLog: DoneEntry[]
}

interface DemoState extends Snapshot {
  jumpOffsetMs: number
  persona: PersonaId
  wireframe: boolean
  readIds: string[]
  toast: ToastState | null
  undoSnapshot: Snapshot | null
  pendingPromotion: PendingPromotion | null
  lastInteractionAt: number
  awayPromotions: number
}

type PersistedState = Pick<
  DemoState,
  'items' | 'team' | 'doneLog' | 'jumpOffsetMs' | 'persona' | 'wireframe' | 'readIds'
>

type Action =
  | { type: 'START'; itemId: string; actorId: string; nowIso: string }
  | { type: 'DONE'; itemId: string; nowIso: string }
  | { type: 'UNDO' }
  | { type: 'ASK_HELP'; itemId: string }
  | { type: 'WAITING'; itemId: string; waitingOn: string; checkBackAt: string }
  | { type: 'NOT_MINE'; itemId: string }
  | { type: 'REASSIGN'; itemId: string; toPersonId: string; actorId: string }
  | { type: 'MOVE_LATER'; itemId: string; snoozeUntil: string }
  | { type: 'INJECT'; item: Item; nowMs: number; currentHeroId: string | null }
  | { type: 'SHOW_PENDING' }
  | { type: 'DISMISS_PENDING' }
  | { type: 'JUMP' }
  | { type: 'RESET_CLOCK'; jumpOffsetMs: number }
  | { type: 'RESET' }
  | { type: 'SET_PERSONA'; persona: PersonaId }
  | { type: 'TOGGLE_WIREFRAME' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'LOG_INTERACTION'; atMs: number }
  | { type: 'MARK_READ'; itemId: string }
  | { type: 'SHOW_TOAST'; message: string }

function firstName(person: Person | undefined): string {
  return person ? person.name.split(' ')[0] : 'a teammate'
}

function snapshot(state: DemoState): Snapshot {
  return structuredClone({ items: state.items, team: state.team, doneLog: state.doneLog })
}

function withToast(state: DemoState, message: string, undoable: boolean, durationMs = 8000): DemoState {
  return { ...state, toast: { message, kind: 'default', undoable, durationMs, key: Date.now() } }
}

function releasePendingIfFrozenHeroResolved(state: DemoState, itemId: string): PendingPromotion | null {
  if (state.pendingPromotion?.frozenHeroId === itemId) return null
  return state.pendingPromotion
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'START': {
      const before = snapshot(state)
      const actor = state.team.find((p) => p.id === action.actorId)
      const previousTaskId = actor?.currentTaskId ?? null
      let items = state.items
      let pausedTitle: string | null = null

      if (previousTaskId && previousTaskId !== action.itemId) {
        const paused = state.items.find((i) => i.id === previousTaskId)
        if (paused && paused.status === 'in_progress') pausedTitle = paused.title
        items = items.map((i) => (i.id === previousTaskId ? { ...i, status: 'open' as Status } : i))
      }
      items = items.map((i) => (i.id === action.itemId ? { ...i, status: 'in_progress' as Status } : i))
      const team = state.team.map((p) =>
        p.id === action.actorId ? { ...p, currentTaskId: action.itemId, currentTaskStartedAt: action.nowIso } : p,
      )

      const next: DemoState = { ...state, items, team, undoSnapshot: before }
      return pausedTitle ? withToast(next, `Paused ${pausedTitle}.`, true) : { ...next, toast: null }
    }

    case 'DONE': {
      const before = snapshot(state)
      const item = state.items.find((i) => i.id === action.itemId)
      if (!item) return state
      const items = state.items.map((i) => (i.id === action.itemId ? { ...i, status: 'done' as Status } : i))
      const team = state.team.map((p) =>
        p.currentTaskId === action.itemId ? { ...p, currentTaskId: null, currentTaskStartedAt: null } : p,
      )
      const doneLog: DoneEntry[] = [
        ...state.doneLog,
        { id: `dn-session-${action.itemId}`, assigneeId: item.assigneeId ?? '', title: item.title, doneAt: action.nowIso },
      ]
      const next: DemoState = {
        ...state,
        items,
        team,
        doneLog,
        undoSnapshot: before,
        pendingPromotion: releasePendingIfFrozenHeroResolved(state, action.itemId),
      }
      const personId = item.assigneeId ?? state.persona
      const { done: doneCount, total } = totalTodayFor(items, doneLog, personId)
      return withToast(next, `Done. ${doneCount} of ${total} done today.`, true)
    }

    case 'UNDO': {
      if (!state.undoSnapshot) return state
      return {
        ...state,
        ...state.undoSnapshot,
        undoSnapshot: null,
        toast: { message: 'Restored.', kind: 'undo-restored', undoable: false, durationMs: 2000, key: Date.now() },
      }
    }

    case 'ASK_HELP': {
      const items = state.items.map((i) => (i.id === action.itemId ? { ...i, helpAsked: true } : i))
      return withToast({ ...state, items, undoSnapshot: null }, 'Sent to Danielle. She will check in.', false)
    }

    case 'WAITING': {
      const before = snapshot(state)
      const items = state.items.map((i) =>
        i.id === action.itemId
          ? { ...i, status: 'waiting' as Status, waitingOn: action.waitingOn, checkBackAt: action.checkBackAt }
          : i,
      )
      const hhmm = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(action.checkBackAt))
      return withToast({ ...state, items, undoSnapshot: before }, `Waiting on ${action.waitingOn}. Back at ${hhmm}.`, true)
    }

    case 'NOT_MINE': {
      const before = snapshot(state)
      const items = state.items.map((i) =>
        i.id === action.itemId
          ? { ...i, assigneeId: null, notMineCount: (i.notMineCount ?? 0) + 1, status: 'open' as Status }
          : i,
      )
      const team = state.team.map((p) => (p.currentTaskId === action.itemId ? { ...p, currentTaskId: null, currentTaskStartedAt: null } : p))
      return withToast({ ...state, items, team, undoSnapshot: before }, 'Sent back to the team.', true)
    }

    case 'REASSIGN': {
      const before = snapshot(state)
      const item = state.items.find((i) => i.id === action.itemId)
      if (!item) return state
      const actor = state.team.find((p) => p.id === action.actorId)
      const recipient = state.team.find((p) => p.id === action.toPersonId)
      const items = state.items.map((i) =>
        i.id === action.itemId
          ? {
              ...i,
              assigneeId: action.toPersonId,
              escalated: true,
              cause: reassignedCause(i.cause, firstName(actor)),
              status: i.status === 'in_progress' ? ('open' as Status) : i.status,
            }
          : i,
      )
      const team = state.team.map((p) => (p.currentTaskId === action.itemId ? { ...p, currentTaskId: null, currentTaskStartedAt: null } : p))
      return withToast({ ...state, items, team, undoSnapshot: before }, `Moved to ${firstName(recipient)}.`, true)
    }

    case 'MOVE_LATER': {
      const items = state.items.map((i) =>
        i.id === action.itemId ? { ...i, status: 'snoozed' as Status, snoozeUntil: action.snoozeUntil } : i,
      )
      return { ...state, items, undoSnapshot: null, toast: null }
    }

    case 'INJECT': {
      if (state.items.some((i) => i.id === action.item.id)) return state
      const items = [...state.items, action.item]
      const idleMs = action.nowMs - state.lastInteractionAt
      if (idleMs >= 8000) {
        return { ...state, items, pendingPromotion: null, awayPromotions: state.awayPromotions + 1 }
      }
      return { ...state, items, pendingPromotion: { itemId: action.item.id, frozenHeroId: action.currentHeroId, dismissed: false } }
    }

    case 'SHOW_PENDING':
      return { ...state, pendingPromotion: null }

    case 'DISMISS_PENDING':
      return state.pendingPromotion ? { ...state, pendingPromotion: { ...state.pendingPromotion, dismissed: true } } : state

    case 'JUMP':
      return { ...state, jumpOffsetMs: state.jumpOffsetMs + 15 * 60000 }

    case 'RESET_CLOCK':
      return { ...state, jumpOffsetMs: action.jumpOffsetMs }

    case 'RESET':
      return {
        ...initialDemoState(),
      }

    case 'SET_PERSONA':
      return { ...state, persona: action.persona }

    case 'TOGGLE_WIREFRAME':
      return { ...state, wireframe: !state.wireframe }

    case 'CLEAR_TOAST':
      return { ...state, toast: null, undoSnapshot: state.toast?.undoable ? state.undoSnapshot : null }

    case 'LOG_INTERACTION':
      return { ...state, lastInteractionAt: action.atMs }

    case 'MARK_READ':
      return state.readIds.includes(action.itemId) ? state : { ...state, readIds: [...state.readIds, action.itemId] }

    case 'SHOW_TOAST':
      return withToast({ ...state, undoSnapshot: null }, action.message, false)

    default:
      return state
  }
}

function initialDemoState(): DemoState {
  return {
    items: structuredClone(seedItems),
    team: structuredClone(seedTeam),
    doneLog: structuredClone(seedDoneToday),
    jumpOffsetMs: 0,
    persona: 'u1',
    wireframe: false,
    readIds: [],
    toast: null,
    undoSnapshot: null,
    pendingPromotion: null,
    lastInteractionAt: 0,
    awayPromotions: 0,
  }
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as PersistedState
  } catch {
    return null
  }
}

function savePersisted(state: DemoState) {
  try {
    const toSave: PersistedState = {
      items: state.items,
      team: state.team,
      doneLog: state.doneLog,
      jumpOffsetMs: state.jumpOffsetMs,
      persona: state.persona,
      wireframe: state.wireframe,
      readIds: state.readIds,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // storage unavailable; demo state simply won't survive reload
  }
}

function init(): DemoState {
  const base = initialDemoState()
  const persisted = loadPersisted()
  return persisted ? { ...base, ...persisted } : base
}

interface StoreValue {
  state: DemoState
  dispatch: React.Dispatch<Action>
  now: Date
  loadedAt: number
  totalToday: (personId: string) => { done: number; total: number }
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const loadedAtRef = useRef(Date.now())
  const [now, setNow] = React.useState(() => simNowFrom(SEED_NOW_ISO, loadedAtRef.current, state.jumpOffsetMs))

  useEffect(() => {
    setNow(simNowFrom(SEED_NOW_ISO, loadedAtRef.current, state.jumpOffsetMs))
    const id = setInterval(() => {
      setNow(simNowFrom(SEED_NOW_ISO, loadedAtRef.current, state.jumpOffsetMs))
    }, 60000)
    return () => clearInterval(id)
  }, [state.jumpOffsetMs])

  useEffect(() => savePersisted(state), [state])

  const value = useMemo<StoreValue>(() => {
    const totalToday = (personId: string) => totalTodayFor(state.items, state.doneLog, personId)
    return { state, dispatch, now, loadedAt: loadedAtRef.current, totalToday }
  }, [state, now])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { demoInjections }

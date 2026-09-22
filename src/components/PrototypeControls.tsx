import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { Segmented } from './Segmented'
import { Button } from './Button'
import { useStore, demoInjections } from '../state/store'
import { queueFor } from '../lib/selectors'
import { formatClock } from '../lib/time'
import { useIsHandheld } from '../lib/useViewport'
import { copy, t } from '../copy'
import type { PersonaId } from '../state/store'

/** Floating pill, dashed border, clearly not product UI. §6.10. */
export function PrototypeControls() {
  const { state, dispatch, now, loadedAt } = useStore()
  const navigate = useNavigate()
  const handheld = useIsHandheld()
  const [open, setOpen] = useState(false)

  function setPersona(persona: PersonaId) {
    dispatch({ type: 'SET_PERSONA', persona })
    navigate(persona === 'm1' ? '/team' : '/work')
  }

  function injectUrgent() {
    const heroId = queueFor(state.items, 'u1', now).hero?.item.id ?? null
    dispatch({ type: 'INJECT', item: demoInjections[0], nowMs: Date.now(), currentHeroId: heroId })
  }

  function resetClock() {
    dispatch({ type: 'RESET_CLOCK', jumpOffsetMs: -(Date.now() - loadedAt) })
  }

  const alreadyInjected = state.items.some((i) => i.id === demoInjections[0].id)

  return (
    <div className="fixed z-40" style={{ right: 16, bottom: handheld ? 'calc(64px + env(safe-area-inset-bottom) + 12px)' : 24 }}>
      {open && (
        <div className="mb-3 rounded-lg bg-n-0 shadow-e3 p-4 flex flex-col gap-4" style={{ width: 300 }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-n-900">{copy.demo.pill}</span>
            <button aria-label="Close" onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-n-75">
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-n-500">{copy.demo.viewingAs}</span>
            <Segmented
              options={[
                { value: 'u1', label: copy.demo.priya },
                { value: 'm1', label: copy.demo.danielle },
              ]}
              value={state.persona}
              onChange={(v) => setPersona(v as PersonaId)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-n-500">{copy.demo.clockLabel}</span>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-n-900 tnum">{t(copy.demo.clock, { hhmm: formatClock(now) })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'JUMP' })}>
                {copy.demo.jump}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetClock}>
                {copy.demo.reset}
              </Button>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={injectUrgent} disabled={alreadyInjected}>
            {copy.demo.inject}
          </Button>

          <label className="flex items-center justify-between text-[13px] text-n-900">
            {copy.demo.wireframe}
            <input type="checkbox" checked={state.wireframe} onChange={() => dispatch({ type: 'TOGGLE_WIREFRAME' })} />
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              dispatch({ type: 'RESET' })
              navigate('/work')
            }}
          >
            {copy.demo.resetAll}
          </Button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-10 px-4 rounded-full bg-n-0 shadow-e3 text-[13px] font-medium text-n-700 float-right"
        style={{ border: '1px dashed var(--n-400)' }}
      >
        <SlidersHorizontal size={14} />
        {copy.demo.pill}
      </button>
    </div>
  )
}


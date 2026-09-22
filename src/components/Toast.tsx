import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useStore } from '../state/store'
import { useIsHandheld } from '../lib/useViewport'
import { copy } from '../copy'

/** Bottom left of the content area, x = 248 + 24, 24 from the bottom. §7.9. */
export function Toast() {
  const { state, dispatch } = useStore()
  const toast = state.toast
  const [paused, setPaused] = useState(false)
  const handheld = useIsHandheld()

  useEffect(() => {
    if (!toast || paused) return
    const id = window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), toast.durationMs)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.key, paused])

  useEffect(() => {
    if (!toast) return
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'z' && toast?.undoable) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        dispatch({ type: 'UNDO' })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [toast, dispatch])

  if (!toast) return null

  return (
    <div
      role="status"
      className="fixed z-50 flex items-center gap-3 h-12 pl-4 pr-2 rounded-lg shadow-e3 relative overflow-hidden"
      style={
        handheld
          ? { left: 16, right: 16, bottom: 'calc(64px + env(safe-area-inset-bottom) + 12px)', background: 'var(--n-900)', color: 'var(--n-50)' }
          : { left: 248 + 24, bottom: 24, background: 'var(--n-900)', color: 'var(--n-50)' }
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Check size={16} color="var(--done-on-ink)" />
      <span className="text-[14px] leading-5">{toast.message}</span>
      {toast.undoable && (
        <button className="text-[14px] font-semibold" style={{ color: 'var(--accent-on-ink)' }} onClick={() => dispatch({ type: 'UNDO' })}>
          {copy.actions.undo}
        </button>
      )}
      <button
        aria-label="Close"
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10"
        onClick={() => dispatch({ type: 'CLEAR_TOAST' })}
      >
        <X size={16} />
      </button>
      <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-white/10">
        <div
          key={toast.key}
          className="h-full motion-reduce:hidden"
          style={{
            background: 'var(--accent-on-ink)',
            animation: paused ? 'none' : `toast-shrink ${toast.durationMs}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  )
}

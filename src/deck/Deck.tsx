import { useEffect, useRef, useState } from 'react'
import { SLIDES } from './slides'

/** /deck: one slide at a time, scaled to fit, letterboxed. Arrow keys, click, F fullscreen, N notes. §10.5. */
export default function Deck() {
  const total = SLIDES.length
  const initial = (() => {
    const h = parseInt(location.hash.slice(1), 10)
    return h >= 1 && h <= total ? h - 1 : 0
  })()
  const [index, setIndex] = useState(initial)
  const [notesOpen, setNotesOpen] = useState(false)
  const [scale, setScale] = useState(0.5)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      setScale(Math.min(width / 1920, height / 1080))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    history.replaceState(null, '', `#${index + 1}`)
  }, [index])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') setIndex((i) => Math.min(total - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen()
      }
      if (e.key.toLowerCase() === 'n') setNotesOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total])

  const slide = SLIDES[index]
  const Slide = slide.Component

  return (
    <div
      className="h-screen w-screen overflow-hidden flex items-center justify-center relative"
      style={{ background: 'var(--n-50)' }}
      ref={containerRef}
      onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
    >
      <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <Slide />
      </div>
      {notesOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-n-900 text-n-50 p-6 text-[16px] leading-6"
          style={{ maxHeight: '30vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {slide.notes}
        </div>
      )}
    </div>
  )
}

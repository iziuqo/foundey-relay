import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement>
  children: ReactNode
  width?: number
  align?: 'start' | 'end'
  className?: string
}

/**
 * Anchored floating panel: radius 8, e-3, enters 180ms from y+4. Positions itself from the
 * anchor's measured rect and renders through a portal, so it's correct regardless of where in
 * the DOM it's mounted (unlike CSS `absolute` + a `relative` ancestor, which breaks the moment
 * the trigger and the popover aren't siblings in the same positioned container).
 */
export function Popover({ open, onClose, anchorRef, children, width = 300, align = 'start', className = 'p-3' }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null)
      return
    }
    const rect = anchorRef.current.getBoundingClientRect()
    const left = align === 'end' ? rect.right - width : rect.left
    const clampedLeft = Math.max(8, Math.min(left, window.innerWidth - width - 8))
    setPos({ top: rect.bottom + 8, left: clampedLeft })
  }, [open, anchorRef, align, width])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.div
          ref={panelRef}
          role="dialog"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className={`fixed z-40 rounded-md bg-n-0 shadow-e3 ${className}`}
          style={{ width, top: pos.top, left: pos.left }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

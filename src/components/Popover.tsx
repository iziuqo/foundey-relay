import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
  align?: 'start' | 'end'
  anchorClassName?: string
}

/** Anchored floating panel: radius 8, e-3, enters 180ms from y+4. Escape and outside click close it. */
export function Popover({ open, onClose, children, width = 300, align = 'start', anchorClassName = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
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
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className={`absolute z-40 mt-2 rounded-md bg-n-0 shadow-e3 p-3 ${align === 'end' ? 'right-0' : 'left-0'} ${anchorClassName}`}
          style={{ width }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

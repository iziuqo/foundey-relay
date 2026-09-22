import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
}

export function Modal({ open, onClose, title, children, width = 480 }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-n-900/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed z-50 bg-n-0 rounded-xl shadow-e4 p-6"
            style={{ left: '50%', top: '50%', width }}
            initial={{ opacity: 0, scale: 0.98, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.98, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-n-900">{title}</h2>
              <button aria-label="Close" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-n-75">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

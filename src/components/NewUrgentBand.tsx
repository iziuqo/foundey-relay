import { motion } from 'framer-motion'
import { OctagonAlert } from 'lucide-react'
import { Button } from './Button'
import { copy, t } from '../copy'

interface Props {
  title: string
  onShowMe: () => void
  onStayHere: () => void
}

/** §7.6. Slides down inside the top of the hero when a higher ranked item arrives while the user is active. */
export function NewUrgentBand({ title, onShowMe, onStayHere }: Props) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 40, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.24 }}
      role="status"
      className="overflow-hidden flex items-center gap-2 px-4 rounded-t-xl -mx-6 -mt-6 mb-4"
      style={{ background: 'var(--now-bg)' }}
    >
      <OctagonAlert size={16} color="var(--now-fg)" className="shrink-0" />
      <span className="text-[13px] flex-1 truncate" style={{ color: 'var(--now-fg)' }}>
        {t(copy.newUrgent, { title })}
      </span>
      <Button variant="secondary" size="sm" onClick={onShowMe}>
        {copy.actions.showMe}
      </Button>
      <Button variant="ghost" size="sm" onClick={onStayHere}>
        {copy.actions.stay}
      </Button>
    </motion.div>
  )
}

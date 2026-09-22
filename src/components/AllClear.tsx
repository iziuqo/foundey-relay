import { CircleCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { copy, t } from '../copy'

/** Replaces the hero and the list when nothing needs the person right now. §6.4. No confetti. */
export function AllClear({ doneCount }: { doneCount: number }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center text-center" style={{ padding: '80px 0' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5" style={{ background: 'var(--done-bg)' }}>
        <CircleCheck size={24} color="var(--done-solid)" />
      </div>
      <h2 className="text-[24px] leading-[32px] font-semibold text-n-900 mb-2">{copy.allClear.title}</h2>
      <p className="text-[14px] text-n-600 max-w-[360px] mb-1">{copy.allClear.body}</p>
      <p className="text-[13px] text-n-500 mb-6 tnum">{t(copy.allClear.meta, { n: doneCount })}</p>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="md" onClick={() => navigate('/team')}>
          {copy.allClear.team}
        </Button>
        <Button variant="ghost" size="md" onClick={() => navigate('/updates')}>
          {copy.allClear.updates}
        </Button>
      </div>
    </div>
  )
}

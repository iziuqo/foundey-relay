import { useNavigate } from 'react-router-dom'
import { Cpu } from 'lucide-react'
import { Avatar } from './Avatar'
import { relativeDuration } from '../lib/time'
import { updates, team } from '../data/seed'
import { copy, t } from '../copy'

function relativePast(at: string, now: Date): string {
  const mins = Math.round((now.getTime() - new Date(at).getTime()) / 60000)
  if (mins < 1) return copy.time.justNow
  return t(copy.time.ago, { rel: relativeDuration(mins) })
}

/** Eyebrow "UPDATES". The 3 latest, then "See all updates". §6.2 rail. */
export function UpdatesCard({ now }: { now: Date }) {
  const navigate = useNavigate()
  const latest = [...updates].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 3)

  return (
    <div className="rounded-lg shadow-e1 bg-n-0 p-4">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-n-500 mb-3">{copy.updates.title}</h3>
      <ul className="flex flex-col gap-3">
        {latest.map((u) => {
          const author = team.find((p) => p.id === u.authorId)
          return (
            <li key={u.id} className="flex items-start gap-2.5">
              {author ? <Avatar initials={author.initials} size={24} /> : <Cpu size={20} className="text-n-400 shrink-0" />}
              <div className="min-w-0">
                <p className="text-[13px] leading-[18px] text-n-900">{u.text}</p>
                <p className="text-[12px] text-n-500 mt-0.5">{relativePast(u.at, now)}</p>
              </div>
            </li>
          )
        })}
      </ul>
      <button onClick={() => navigate('/updates')} className="mt-3 text-[13px] font-medium text-accent">
        {copy.updates.seeAll}
      </button>
    </div>
  )
}

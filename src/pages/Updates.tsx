import { Cpu } from 'lucide-react'
import { AppShell, PageGrid } from '../components/Layout'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { useStore } from '../state/store'
import { updates as seedUpdates, items, team } from '../data/seed'
import { relativeDuration } from '../lib/time'
import { copy, t } from '../copy'
import type { UpdateEntry } from '../lib/types'

function relativePast(at: string, now: Date): string {
  const mins = Math.round((now.getTime() - new Date(at).getTime()) / 60000)
  if (mins < 1) return copy.time.justNow
  return t(copy.time.ago, { rel: relativeDuration(mins) })
}

function UpdateRow({ update, now }: { update: UpdateEntry; now: Date }) {
  const author = team.find((p) => p.id === update.authorId)
  return (
    <li className="flex items-start gap-3 py-3 border-b border-n-100 last:border-b-0">
      {author ? <Avatar initials={author.initials} size={28} /> : <Cpu size={20} className="text-n-400 shrink-0 mt-1" />}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-5 text-n-900">{update.text}</p>
        <p className="text-[12px] text-n-500 mt-0.5">{relativePast(update.at, now)}</p>
      </div>
    </li>
  )
}

export default function UpdatesPage() {
  const { state, dispatch, now } = useStore()

  const fyiItems = items.filter((i) => i.source === 'fyi' && !state.readIds.includes(i.id))
  const teamUpdates = seedUpdates.filter((u) => u.type === 'announcement' || u.type === 'handoff')
  const activityUpdates = seedUpdates.filter((u) => u.type === 'activity' || u.type === 'system')

  const isEmpty = fyiItems.length === 0 && teamUpdates.length === 0 && activityUpdates.length === 0

  return (
    <AppShell>
      <TopBar title={copy.updates.title} />
      <PageGrid
        main={
          isEmpty ? (
            <EmptyState>{copy.updates.empty}</EmptyState>
          ) : (
            <div className="flex flex-col gap-8">
              {fyiItems.length > 0 && (
                <section>
                  <h2 className="text-[15px] font-semibold text-n-900 mb-2">{copy.updates.forYou}</h2>
                  <ul className="rounded-lg shadow-e1 bg-n-0 px-4">
                    {fyiItems.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-3 border-b border-n-100 last:border-b-0">
                        <div className="min-w-0">
                          <p className="text-[14px] leading-5 text-n-900">{item.whyText}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'MARK_READ', itemId: item.id })}>
                          {copy.updates.markRead}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {teamUpdates.length > 0 && (
                <section>
                  <h2 className="text-[15px] font-semibold text-n-900 mb-2">{copy.updates.team}</h2>
                  <ul className="rounded-lg shadow-e1 bg-n-0 px-4">
                    {teamUpdates.map((u) => (
                      <UpdateRow key={u.id} update={u} now={now} />
                    ))}
                  </ul>
                </section>
              )}

              {activityUpdates.length > 0 && (
                <section>
                  <h2 className="text-[15px] font-semibold text-n-900 mb-2">{copy.updates.activity}</h2>
                  <ul className="rounded-lg shadow-e1 bg-n-0 px-4">
                    {activityUpdates.map((u) => (
                      <UpdateRow key={u.id} update={u} now={now} />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )
        }
      />
    </AppShell>
  )
}

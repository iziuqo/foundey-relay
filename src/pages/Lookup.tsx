import { useRef, useState } from 'react'
import { AppShell, PageGrid } from '../components/Layout'
import { TopBar } from '../components/TopBar'
import { PriorityRow } from '../components/PriorityRow'
import { EmptyState } from '../components/EmptyState'
import { useStore } from '../state/store'
import { scoreItem } from '../lib/priority'
import { copy } from '../copy'

export default function LookupPage() {
  const { state, now } = useStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const q = query.trim().toLowerCase()
  const results = q
    ? state.items.filter((item) => {
        const assignee = state.team.find((p) => p.id === item.assigneeId)
        return item.title.toLowerCase().includes(q) || (assignee && assignee.name.toLowerCase().includes(q))
      })
    : []

  return (
    <AppShell>
      <TopBar title={copy.nav.lookup} />
      <PageGrid
        main={
          <div>
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              className="w-full h-11 px-4 rounded-md border border-n-200 bg-n-0 text-[15px] outline-none focus-visible:border-focus mb-6"
            />
            {q === '' ? (
              <EmptyState>{copy.lookup.empty}</EmptyState>
            ) : results.length === 0 ? (
              <EmptyState>{copy.tiers.empty}</EmptyState>
            ) : (
              <ul className="rounded-lg shadow-e1 bg-n-0 overflow-hidden">
                {results.map((item) => (
                  <PriorityRow
                    key={item.id}
                    item={item}
                    now={now}
                    tier={scoreItem(item, now).tier}
                    readOnly
                    onOpen={() => {}}
                    onStart={() => {}}
                    onDone={() => {}}
                  />
                ))}
              </ul>
            )}
          </div>
        }
      />
    </AppShell>
  )
}

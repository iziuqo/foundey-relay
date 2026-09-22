import type { ReactNode } from 'react'
import { LeftNav } from './LeftNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-n-50 flex">
      <LeftNav />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

/** Content padding 32, inner width 1128: main cols 1-8 (744), rail cols 9-12 (360), 24 gutter. §6. */
export function PageGrid({ main, rail }: { main: ReactNode; rail?: ReactNode }) {
  return (
    <div className="mx-auto" style={{ maxWidth: 1128, padding: 32 }}>
      <div className="flex items-start" style={{ gap: 24 }}>
        <div style={{ width: rail ? 744 : '100%' }} className="min-w-0">
          {main}
        </div>
        {rail && (
          <div style={{ width: 360 }} className="shrink-0 flex flex-col gap-4">
            {rail}
          </div>
        )}
      </div>
    </div>
  )
}

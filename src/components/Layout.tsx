import type { ReactNode } from 'react'
import { LeftNav } from './LeftNav'
import { BottomTabBar } from './BottomTabBar'
import { useIsHandheld } from '../lib/useViewport'

export function AppShell({ children }: { children: ReactNode }) {
  const handheld = useIsHandheld()

  if (handheld) {
    return (
      <div className="min-h-screen bg-n-50">
        <div style={{ paddingBottom: 64 }}>{children}</div>
        <BottomTabBar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-n-50 flex">
      <LeftNav />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

/** Content padding 32, inner width 1128: main cols 1-8 (744), rail cols 9-12 (360), 24 gutter. §6.
 *  Below 768, stacks to full width with 16px side padding and the rail (e.g. trucks) above the main column. */
export function PageGrid({ main, rail }: { main: ReactNode; rail?: ReactNode }) {
  const handheld = useIsHandheld()

  if (handheld) {
    return (
      <div className="flex flex-col gap-4" style={{ padding: 16 }}>
        <div className="min-w-0">{main}</div>
        {rail && <div className="flex flex-col gap-4">{rail}</div>}
      </div>
    )
  }

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

import type { ReactNode } from 'react'
import { StoreProvider, type DemoOverrides } from '../state/store'

interface Props {
  children: ReactNode
  width: number
  height: number
  overrides?: DemoOverrides
  virtualWidth?: number
  virtualHeight?: number
}

/**
 * A live product render in a frame: radius 16, e-2, 1px n-200. §10.5, §12.1.
 * Renders `children` (a page in `frozen` mode) at a fixed virtual viewport, scaled and letterboxed
 * to fit the target width/height. Non-interactive (pointer-events: none) since deck frames are
 * snapshots, not something a presenter can accidentally click into.
 */
export function LiveEmbed({ children, width, height, overrides, virtualWidth = 1440, virtualHeight = 900 }: Props) {
  const scale = Math.min(width / virtualWidth, height / virtualHeight)
  return (
    <div
      className="relative overflow-hidden bg-n-0"
      style={{ width, height, borderRadius: 16, boxShadow: 'var(--e-2)', border: '1px solid var(--n-200)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: virtualWidth,
          height: virtualHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <StoreProvider frozen overrides={overrides}>
          {children}
        </StoreProvider>
      </div>
    </div>
  )
}

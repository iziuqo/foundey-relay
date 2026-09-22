import type { CSSProperties, ReactNode } from 'react'

interface Props {
  children: ReactNode
  slideNumber?: number
  eyebrow?: string
  dark?: boolean
  noFooter?: boolean
  contentStyle?: CSSProperties
}

const FOOTER_TEXT = 'Relay · Foundey challenge'

/** The 1920×1080 canvas every slide renders into. Margins 140 sides / 100 top-bottom. §12.1. */
export function SlideFrame({ children, slideNumber, eyebrow, dark, noFooter, contentStyle }: Props) {
  const fg = dark ? 'var(--n-50)' : 'var(--n-900)'
  const muted = dark ? 'var(--n-400)' : 'var(--n-500)'
  return (
    <div
      className="relative shrink-0 font-sans"
      style={{ width: 1920, height: 1080, background: dark ? 'var(--n-900)' : 'var(--n-50)', color: fg, overflow: 'hidden' }}
    >
      {eyebrow && (
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 100,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: muted,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: eyebrow ? 150 : 100,
          bottom: noFooter ? 100 : 140,
          ...contentStyle,
        }}
      >
        {children}
      </div>
      {!noFooter && slideNumber !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: 140,
            right: 140,
            bottom: 48,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 16,
            color: muted,
          }}
        >
          <span>{FOOTER_TEXT}</span>
          <span className="tnum">{slideNumber}</span>
        </div>
      )}
    </div>
  )
}

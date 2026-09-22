import { useEffect, useState } from 'react'

/** Only shows after 300ms of loading, so it never flashes on fast data. Pulse is off under reduced motion. */
export function Skeleton({ variant = 'row' }: { variant?: 'row' | 'hero' }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(id)
  }, [])
  if (!visible) return null

  const height = variant === 'hero' ? 220 : 64
  return <div className="rounded-lg bg-n-100 motion-safe:animate-pulse" style={{ height }} aria-hidden="true" />
}

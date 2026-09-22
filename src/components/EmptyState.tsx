import type { ReactNode } from 'react'

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-n-500 px-4 py-3">{children}</p>
}

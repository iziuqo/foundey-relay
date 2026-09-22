import type { ReactNode } from 'react'

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-xs border border-n-300 bg-n-0 text-[11px] font-medium text-n-600 tnum">
      {children}
    </kbd>
  )
}

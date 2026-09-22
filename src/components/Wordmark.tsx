export function Wordmark({ size = 20, withLabel = true }: { size?: number; withLabel?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect width="20" height="20" rx="6" fill="var(--n-900)" />
        <rect x="5" y="4" width="10" height="2" rx="1" fill="var(--n-0)" />
        <rect x="5" y="9" width="7" height="2" rx="1" fill="var(--n-0)" />
        <rect x="5" y="14" width="4" height="2" rx="1" fill="var(--n-0)" />
      </svg>
      {withLabel && (
        <span className="font-display font-semibold text-[17px] tracking-[-0.02em] text-n-900">Relay</span>
      )}
    </div>
  )
}

export type AvatarStatus = 'working' | 'on_break' | 'out'

const SIZE_TEXT: Record<number, string> = { 24: 'text-[10px]', 28: 'text-[11px]', 32: 'text-[12px]' }

export function Avatar({ initials, size = 28, status }: { initials: string; size?: 24 | 28 | 32; status?: AvatarStatus }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className={`inline-flex items-center justify-center rounded-full bg-n-100 text-n-800 font-semibold tnum ${SIZE_TEXT[size]}`}
        style={{ width: size, height: size }}
      >
        {initials}
      </span>
      {status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-n-0"
          style={{
            width: 9,
            height: 9,
            background: status === 'working' ? 'var(--done-solid)' : status === 'on_break' ? 'var(--next-icon)' : 'var(--n-400)',
          }}
        />
      )}
    </span>
  )
}

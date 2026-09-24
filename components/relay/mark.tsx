// D3: keep the three-bar mark, redrawn on a 24px grid.
export function RelayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x={3} y={4} width={4} height={16} rx={1.5} fill="var(--primary-bg)" />
      <rect x={10} y={8} width={4} height={12} rx={1.5} fill="var(--primary-bg)" opacity={0.7} />
      <rect x={17} y={12} width={4} height={8} rx={1.5} fill="var(--primary-bg)" opacity={0.45} />
    </svg>
  );
}

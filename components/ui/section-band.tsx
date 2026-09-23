import { cn } from "@/lib/cn";

/**
 * The band that opens a group inside a list: tier icon, tier label, count.
 *
 * The band itself is neutral. Zendesk's grouped queue (reference z01) puts the group's
 * meaning in a band exactly like this, but paints the whole row — here the hue stays in
 * the icon and the label, so the band never competes with the rows beneath it.
 *
 * Fixed 36px, full width, and the count is tabular so the numbers line up down the
 * page when a group's size changes.
 */
export function SectionBand({
  icon,
  label,
  count,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  label: React.ReactNode;
  count?: number;
}) {
  return (
    <div
      className={cn(
        "flex h-(--h-band) items-center gap-2 bg-(--surface-2) px-4",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="t-meta font-semibold">{label}</span>
      {count !== undefined && <span className="t-meta text-(--text-2)">{count}</span>}
    </div>
  );
}

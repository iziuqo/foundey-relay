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
  count?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        // The separator is an inset shadow, never a border: a border is part of the box
        // and would make this band a different height from the next one (§5.4).
        // px-3 matches the queue row's own 12px inline padding, so the tier icon in the
        // band and the tier icon in the rows under it sit on one vertical line.
        "flex h-(--h-band) items-center gap-2 bg-(--surface-2) px-3 shadow-[inset_0_-1px_0_var(--line-1)] max-md:h-10",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="t-meta font-semibold">{label}</span>
      {count !== undefined && (
        // Tabular figures need a container sized to the widest state or the box reflows
        // around them and undoes the alignment they exist for (§3.5).
        <span className="tnum t-meta min-w-[2ch] text-(--text-2)">{count}</span>
      )}
    </div>
  );
}

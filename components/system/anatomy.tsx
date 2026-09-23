import { cn } from "@/lib/cn";

/**
 * Anatomy diagrams: a live component with numbered leaders, and the numbered parts beside
 * it with the measurements that make each one. The component is the real one — a diagram
 * that redraws a button has already stopped being about the button.
 */
export interface Part {
  n: number;
  name: string;
  spec: string;
}

export function Marker({
  n,
  side = "top",
  className,
}: {
  n: number;
  side?: "top" | "bottom";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute flex items-center",
        side === "top" ? "bottom-full flex-col-reverse" : "top-full flex-col",
        className,
      )}
    >
      <span className="h-3 w-px bg-(--text-1)" />
      <span className="tnum flex size-5 items-center justify-center rounded-full bg-(--text-1) t-mono font-semibold text-(--bg)">
        {n}
      </span>
    </span>
  );
}

export function Anatomy({
  title,
  code,
  parts,
  children,
}: {
  title: string;
  code: string;
  parts: Part[];
  children: React.ReactNode;
}) {
  return (
    <figure className="flex flex-col gap-4 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
      <figcaption className="flex flex-col gap-0.5">
        <span className="t-row text-(--text-1)">{title}</span>
        <span className="t-mono text-(--text-2)">{code}</span>
      </figcaption>
      {/* Room above and below for the leaders, which sit outside the component's box. */}
      <div className="flex min-h-32 items-center justify-center rounded-(--r-3) bg-(--surface-2) px-4 py-12">
        <div className="relative w-fit max-w-full">{children}</div>
      </div>
      <ol className="flex flex-col gap-2">
        {parts.map((part) => (
          <li key={part.n} className="flex items-baseline gap-3">
            <span className="tnum flex size-5 shrink-0 translate-y-0.5 items-center justify-center rounded-full bg-(--text-1) t-mono font-semibold text-(--bg)">
              {part.n}
            </span>
            <span className="t-meta min-w-0 text-(--text-2)">
              <span className="font-semibold text-(--text-1)">{part.name}.</span> {part.spec}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The three-bar mark, redrawn on a 24px grid (D3). Decorative wherever a label follows. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-6", className)}>
      <rect x={3} y={4} width={4} height={16} rx={1.5} fill="currentColor" />
      <rect x={10} y={8} width={4} height={12} rx={1.5} fill="currentColor" opacity={0.7} />
      <rect x={17} y={12} width={4} height={8} rx={1.5} fill="currentColor" opacity={0.45} />
    </svg>
  );
}

/** The page's one horizontal measure. Every band is this wide and no wider. */
export function Bound({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-(--site-max) px-(--site-gutter)", className)}>
      {children}
    </div>
  );
}

/**
 * A numbered band. The numeral is an outline that sits behind the heading at desktop and
 * beside it at handheld — it is a landmark for scrolling, not content, so it is hidden
 * from the accessibility tree and the real heading carries the meaning.
 */
export function Section({
  id,
  numeral,
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  id: string;
  numeral: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 sm:py-24", className)}>
      <Bound>
        <div className="flex items-start gap-5 sm:gap-8">
          <span
            aria-hidden="true"
            className="t-site-numeral shrink-0 select-none text-(--site-numeral)"
          >
            {numeral}
          </span>
          <div className="min-w-0 flex-1 pt-1 sm:pt-3">
            <p className="t-site-eyebrow text-(--site-text-3)">{eyebrow}</p>
            <h2 className="t-site-h2 mt-4 max-w-[22ch] text-balance text-(--site-text-1)">
              {title}
            </h2>
            {lead ? (
              <p className="t-site-lead mt-5 max-w-(--site-prose) text-pretty text-(--site-text-2)">
                {lead}
              </p>
            ) : null}
          </div>
        </div>
        {children ? <div className="mt-10 sm:mt-14">{children}</div> : null}
      </Bound>
    </section>
  );
}

/** A screenshot in a frame, with the caption under it rather than over it. */
export function Shot({
  src,
  alt,
  caption,
  width = 2160,
  height = 1350,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="site-shot">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 1120px) 100vw, 1088px"
          className="block h-auto w-full"
        />
      </div>
      {caption ? (
        <figcaption className="t-site-mono mt-4 text-(--site-text-3)">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/**
 * A stat cell with corner ticks. The ticks are two borders on a pseudo-free span rather
 * than a full box, because a closed rectangle around every number turns a band of five
 * into a table, and this is a headline, not data.
 */
export function StatCell({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="relative border-t border-(--site-line-soft) pt-5">
      <p className="t-site-stat text-(--site-text-1)">{value}</p>
      <p className="t-site-body mt-2 text-(--site-text-2)">{label}</p>
      <p className="t-site-mono mt-1 text-(--site-text-3)">{note}</p>
    </div>
  );
}

/** The page's buttons. Two weights, both 48px, both with a visible focus ring. */
export function Action({
  href,
  variant = "secondary",
  external = false,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  external?: boolean;
  children: ReactNode;
}) {
  const className = cn(
    "inline-flex h-(--h-lg) items-center justify-center gap-2 rounded-(--r-full) px-6 text-center",
    // Full width below the first breakpoint: three stacked pills of three different
    // widths read as an accident rather than a set.
    "w-full sm:w-auto",
    "t-site-body font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)",
    variant === "primary"
      ? "bg-(--site-text-1) text-(--site-bg) hover:bg-(--site-text-2)"
      : "border border-(--site-line) text-(--site-text-1) hover:border-(--site-text-3) hover:bg-(--site-bg-2)",
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {children}
        <Arrow />
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** The outbound arrow, on every link that leaves this page. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 11.5 11.5 4.5" />
      <path d="M5.5 4.5h6v6" />
    </svg>
  );
}

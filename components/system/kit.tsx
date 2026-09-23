import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The layout vocabulary /system speaks in, in one place so the five sections read as
 * one document: a page head, a section head, a figure with a caption, a mode-scoped
 * panel, and the do/don't pair that the Rules page is built from.
 */

export function PageHead({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className="t-section text-(--text-1)">{title}</h1>
      <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
        {children}
      </p>
    </header>
  );
}

export function SectionHead({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 id={id} className="t-section text-(--text-1)">
        {title}
      </h2>
      {children && (
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          {children}
        </p>
      )}
    </div>
  );
}

export type Mode = "light" | "dark" | "wire";

const modeAttrs: Record<Mode, { "data-theme": string; "data-fidelity": string }> = {
  light: { "data-theme": "light", "data-fidelity": "hi" },
  dark: { "data-theme": "dark", "data-fidelity": "hi" },
  wire: { "data-theme": "light", "data-fidelity": "wire" },
};

const modeLabel: Record<Mode, string> = { light: "Light", dark: "Dark", wire: "Wire" };

/**
 * A panel that resolves every token as one of the three modes, whatever mode the page
 * itself is in. Wire is not dark and not a filter: it is light with every chroma channel
 * multiplied by zero, which is exactly what `data-fidelity="wire"` does.
 */
export function ModePanel({
  mode,
  label,
  className,
  children,
}: {
  mode: Mode;
  /** Overrides the eyebrow; pass `false` to omit it. */
  label?: string | false;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      {...modeAttrs[mode]}
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-(--r-4) border border-(--line-1) bg-(--bg) p-4 text-(--text-1)",
        className,
      )}
    >
      {label !== false && <p className="t-eyebrow text-(--text-2)">{label ?? modeLabel[mode]}</p>}
      {children}
    </div>
  );
}

/**
 * One side of a drawn rule. The verdict is carried by three things at once — a word, a
 * glyph and a dashed edge — so a wrong example is unmistakable in wire and to a screen
 * reader, and never rests on red versus green (colour is on the whitelist for priority
 * and success only, which is the whole point of two of these rules).
 */
export function Verdict({
  kind,
  caption,
  children,
  className,
}: {
  kind: "do" | "dont";
  caption: string;
  children: React.ReactNode;
  className?: string;
}) {
  const good = kind === "do";
  return (
    <figure
      data-verdict={kind}
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-(--r-4) border bg-(--surface-1) p-4",
        good ? "border-(--line-1)" : "border-dashed border-(--line-2)",
        className,
      )}
    >
      <figcaption className="flex items-start gap-2">
        <span
          aria-hidden
          className={cn(
            "mt-px flex size-5 shrink-0 items-center justify-center rounded-full",
            good ? "bg-(--text-1) text-(--bg)" : "border border-(--text-1) text-(--text-1)",
          )}
        >
          {good ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
        </span>
        <span className="t-body text-(--text-1)">
          <strong className="font-semibold">{good ? "Do" : "Don’t"}.</strong> {caption}
        </span>
      </figcaption>
      {children}
    </figure>
  );
}

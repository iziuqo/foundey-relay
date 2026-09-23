import { cn } from "@/lib/cn";
import type { Rich } from "./deck-copy";

/**
 * The deck's five layouts and the few parts they share (ADVISOR-craft §8.2). Token
 * classes only, no inline colour, so slides are subject to the same lint as the rest of
 * the app. Slides compose these; nothing in part-a/part-b sets its own type size.
 */

/** The slide's title, and its `h1`. `/deck` renders one slide at a time, so each slide is
 * its own document as far as assistive tech (and axe's page-has-heading-one) is
 * concerned. `/deck/print` stacks 16 of them: 16 `h1`s in one document, which is truer
 * than inventing a hierarchy between slides that the deck doesn't have. */
export function SlideTitle({
  children,
  size = 2,
  className,
}: {
  children: React.ReactNode;
  size?: 1 | 2;
  className?: string;
}) {
  return (
    <h1 className={cn(size === 1 ? "t-deck-h1" : "t-deck-h2", "text-(--text-1)", className)}>{children}</h1>
  );
}

/** The lead: one sentence in `--text-2`, and inside it the clause that carries the
 * argument in `--text-1` at 600 — wrap that clause in `<Key>`. This one device is most
 * of the answer to "mostly-empty white slides" (`mk01`): it gives the eye a target, so
 * the white around it reads as composed rather than unfinished. */
export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("t-deck-lead max-w-[52ch] text-(--text-2)", className)}>{children}</p>;
}

/** Renders a `Rich` from deck-copy.ts: the operative clause bold, inline code in mono at
 * the surrounding size (the deck scale has no 12px step, and the app's `t-mono` is one). */
export function rich(parts: Rich): React.ReactNode[] {
  return parts.map((part, i) =>
    typeof part === "string" ? (
      part
    ) : "key" in part ? (
      <Key key={i}>{part.key}</Key>
    ) : (
      <code key={i} className="text-(--text-1)">
        {part.code}
      </code>
    ),
  );
}

export function Key({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-(--text-1)">{children}</strong>;
}

export function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("t-deck-body max-w-[58ch] text-(--text-2)", className)}>{children}</p>;
}

/** A 16px caps label — the eyebrow of a column or a stat, not of a slide. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("t-deck-eyebrow text-(--text-2)", className)}>{children}</p>;
}

/** L2 — split 6/6: the argument on the left, the artefact on the right. */
export function Split({
  left,
  right,
  leftSpan = 6,
  className,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  /** Columns the argument gets, of 12. 6/6 by default; 5/7 when the artefact needs width. */
  leftSpan?: 5 | 6;
  className?: string;
}) {
  return (
    <div className={cn("grid h-full grid-cols-12 gap-x-6", className)}>
      <div className={cn("flex min-w-0 flex-col", leftSpan === 5 ? "col-span-5" : "col-span-6")}>{left}</div>
      <div className={cn("min-w-0", leftSpan === 5 ? "col-span-7" : "col-span-6")}>{right}</div>
    </div>
  );
}

/** L4 — three-up: three columns divided by hairlines, never boxes. Outlined boxes are
 * what made v1's slide 14 look like a wireframe of a wireframe. */
export function ThreeUp({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 [&>*+*]:border-l [&>*+*]:border-(--line-1) [&>*+*]:pl-8 [&>*:not(:last-child)]:pr-8", className)}>
      {children}
    </div>
  );
}

/** One column of a three-up: a caps label, a 26px statement, a 20px body. */
export function Column({
  label,
  title,
  mark,
  children,
}: {
  label: string;
  title: string;
  /** An 88px numeral above the label (L5's device, for a column that has one). */
  mark?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {mark && <p className="t-deck-stat mb-2 text-(--text-1)">{mark}</p>}
      <Label>{label}</Label>
      <h2 className="t-deck-lead font-semibold text-(--text-1)">{title}</h2>
      <p className="t-deck-body text-(--text-2)">{children}</p>
    </div>
  );
}

/** L5 — numbers: two or three 88px numerals with 16px caps labels, hairline-separated. */
export function Stats({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex [&>*+*]:border-l [&>*+*]:border-(--line-1) [&>*+*]:pl-8 [&>*:not(:last-child)]:pr-8", className)}>
      {children}
    </div>
  );
}

export function Stat({ value, label, note }: { value: string | number; label: string; note?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="t-deck-stat text-(--text-1)">{value}</p>
      <Label>{label}</Label>
      {note && <p className="t-deck-caption text-(--text-2)">{note}</p>}
    </div>
  );
}

/** Numbered, hairline-ruled rows: five failures, five fixes. */
export function RuleRow({ n, children, className }: { n: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-[48px_1fr_1fr] items-baseline gap-x-8 border-t border-(--line-1) py-5 last:border-b", className)}>
      <span className="t-deck-body text-(--text-2)">{n}</span>
      {children}
    </div>
  );
}

/** The numbered legend under an annotated artefact: dot, then a 15/20 caption. */
export function Legend({ items, stacked, className }: { items: string[]; stacked?: boolean; className?: string }) {
  return (
    <ol className={cn("flex gap-6", stacked && "flex-col gap-4", className)}>
      {items.map((text, i) => (
        <li key={text} className={cn("flex items-start gap-3", stacked ? "max-w-[30rem]" : "max-w-[26rem] flex-1")}>
          <span
            aria-hidden
            className="t-deck-caption grid size-6 shrink-0 place-items-center rounded-full bg-(--text-1) font-semibold text-(--bg)"
          >
            {i + 1}
          </span>
          <span className="t-deck-caption text-(--text-2)">{text}</span>
        </li>
      ))}
    </ol>
  );
}

/** A title, one lead, and a three-up pinned to the bottom edge of the safe area (L4). */
export function ThreeUpSlide({
  title,
  lead,
  children,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <SlideTitle>{title}</SlideTitle>
      {lead && <Lead className="mt-6">{lead}</Lead>}
      <ThreeUp className="my-auto border-t border-(--line-1) pt-10">{children}</ThreeUp>
    </div>
  );
}

/** L2 with a stack on the right: the argument on the left, and up to four `Column`s
 * separated by hairlines down the right-hand side. Fills the height a three-up at the
 * foot of the slide leaves empty — the deck's rule is that no slide is over 55% empty. */
export function ListSlide({
  title,
  lead,
  children,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Split
      leftSpan={5}
      left={
        <div className="flex h-full flex-col">
          <SlideTitle>{title}</SlideTitle>
          {lead && <Lead className="mt-6">{lead}</Lead>}
        </div>
      }
      right={
        <div className="flex h-full flex-col justify-center [&>*]:py-8 [&>*+*]:border-t [&>*+*]:border-(--line-1) [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          {children}
        </div>
      }
    />
  );
}

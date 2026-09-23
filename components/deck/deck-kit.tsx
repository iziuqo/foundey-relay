/** Shared slide furniture — §6.8's 64/40/30/22 scale, token classes only (no inline
 * style for color), so slides stay subject to the same lint the rest of the app is. */

/**
 * The slide's title, and its `h1`. `/deck` renders one slide at a time, so each slide is
 * its own document as far as assistive tech (and axe's page-has-heading-one) is concerned
 * — an `h2` here left every slide headingless. `/deck/print` stacks 16 of these, which is
 * 16 `h1`s in one document: allowed, and truer than inventing a hierarchy between slides
 * that the deck doesn't have.
 */
export function SlideTitle({ children, size = 2 }: { children: React.ReactNode; size?: 1 | 2 }) {
  const cls =
    size === 1
      ? "text-(length:--text-deck-1) leading-(--leading-deck-1)"
      : "text-(length:--text-deck-2) leading-(--leading-deck-2)";
  return <h1 className={`${cls} mb-8 font-semibold tracking-tight text-(--text-1)`}>{children}</h1>;
}

export function SlideBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-3xl text-(length:--text-deck-4) leading-(--leading-deck-4) text-(--text-2)">
      {children}
    </p>
  );
}

export function NumberedRow({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-6">
      <span className="w-14 shrink-0 text-(length:--text-deck-3) leading-(--leading-deck-3) font-semibold text-(--border-2)">
        {n}
      </span>
      <span className="text-(length:--text-deck-4) leading-(--leading-deck-4) text-(--text-1)">{children}</span>
    </div>
  );
}

export function QuoteCard({ quote, label }: { quote: string; label: string }) {
  return (
    <div className="flex-1 rounded-(--radius-hero) border border-(--border-1) bg-(--surface-1) p-8 shadow-(--shadow-e1)">
      <p className="mb-4 text-(length:--text-deck-3) leading-(--leading-deck-3) font-medium text-(--text-1)">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="text-(length:--text-meta) font-medium tracking-wide text-(--text-2) uppercase">{label}</p>
    </div>
  );
}

export function FailureFix({ failure, fix }: { failure: string; fix: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-(--border-1) py-4 last:border-0">
      <p className="text-(length:--text-body) leading-(--leading-body) text-(--text-2)">{failure}</p>
      <span className="text-(--border-2)">→</span>
      <p className="text-(length:--text-body) leading-(--leading-body) font-medium text-(--text-1)">{fix}</p>
    </div>
  );
}

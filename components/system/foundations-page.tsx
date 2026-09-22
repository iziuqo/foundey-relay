import { TokenSwatch } from "./token-swatch";
import { ContrastPair } from "./contrast-pair";
import { ThemePanel } from "./theme-panel";
import { TypeSample } from "./type-sample";
import { SpacingSample } from "./spacing-sample";
import {
  primitiveScales,
  semanticTokens,
  semanticContrastPairs,
  tiers,
  tierContrastPairs,
} from "./tokens-data";

const typeRoles = [
  {
    role: "Display",
    className: "text-(length:--text-display) leading-(--leading-display) font-semibold text-(--text-1)",
    varLabel: "--text-display",
    where: "Status sentence, all clear",
    sample: "2 things before the UPS truck.",
  },
  {
    role: "Hero title",
    className: "text-(length:--text-hero) leading-(--leading-hero) font-semibold text-(--text-1)",
    varLabel: "--text-hero",
    where: "Hero card only",
    sample: "Label printer offline at Pack 7.",
  },
  {
    role: "Title",
    className: "text-(length:--text-title) leading-(--leading-title) font-semibold text-(--text-1)",
    varLabel: "--text-title",
    where: "Sheet titles, section heads",
    sample: "Why is this first?",
  },
  {
    role: "Row title",
    className: "text-(length:--text-row) leading-(--leading-row) font-medium text-(--text-1)",
    varLabel: "--text-row",
    where: "Queue rows, people rows",
    sample: "Order 4821 blocked at Pack 9",
  },
  {
    role: "Body",
    className: "text-(length:--text-body) leading-(--leading-body) font-normal text-(--text-1)",
    varLabel: "--text-body",
    where: "Why text, detail body",
    sample: "Truck leaves in 50 min: 30 points.",
  },
  {
    role: "Meta",
    className: "text-(length:--text-meta) leading-(--leading-meta) font-medium text-(--text-2)",
    varLabel: "--text-meta",
    where: "Causes, time pills, labels",
    sample: "Blocks 140 orders for UPS 11:30",
  },
  {
    role: "Kbd",
    className: "text-(length:--text-kbd) leading-(--leading-kbd) font-medium text-(--text-2)",
    varLabel: "--text-kbd",
    where: "Shortcut hints only",
    sample: "⌘K",
  },
];

const spacingSteps: { sizeClass: string; label: string }[] = [
  { sizeClass: "h-1 w-1", label: "1" },
  { sizeClass: "h-2 w-2", label: "2" },
  { sizeClass: "h-3 w-3", label: "3" },
  { sizeClass: "h-4 w-4", label: "4" },
  { sizeClass: "h-6 w-6", label: "6" },
  { sizeClass: "h-8 w-8", label: "8" },
  { sizeClass: "h-10 w-10", label: "10" },
  { sizeClass: "h-12 w-12", label: "12 (a control's md height)" },
  { sizeClass: "h-16 w-16", label: "16" },
];

export function FoundationsPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-16">
      <header>
        <h1 className="text-(length:--text-title) font-semibold text-(--text-1)">Foundations</h1>
        <p className="mt-2 text-(length:--text-body) text-(--text-2)">
          Color, type, spacing, and depth — read live from the tokens in{" "}
          <code className="text-(length:--text-kbd)">app/globals.css</code>, not typed by hand. Toggle Dark
          / Wire above to see every value on this page update.
        </p>
      </header>

      <section aria-labelledby="color-heading" className="flex flex-col gap-8">
        <h2 id="color-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Color
        </h2>

        <div>
          <h3 className="mb-3 text-(length:--text-meta) font-semibold text-(--text-2)">Semantic</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {semanticTokens.map((name) => (
              <TokenSwatch key={name} varName={name} label={name} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-(length:--text-meta) font-semibold text-(--text-2)">
            Semantic contrast (WCAG, live)
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {semanticContrastPairs.map((pair) => (
              <ContrastPair key={pair.label} fgVar={pair.fg} bgVar={pair.bg} label={pair.label} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-(length:--text-meta) font-semibold text-(--text-2)">
            Tier (§4.2: tier hues never appear outside these tokens)
          </h3>
          <div className="flex flex-col gap-6">
            {tiers.map((tier) => (
              <div key={tier.key}>
                <p className="mb-2 text-(length:--text-meta) font-medium text-(--text-1)">{tier.label}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                  <TokenSwatch varName={`--${tier.key}-fg`} label={`${tier.key}-fg`} />
                  <TokenSwatch varName={`--${tier.key}-bg`} label={`${tier.key}-bg`} />
                  <TokenSwatch varName={`--${tier.key}-border`} label={`${tier.key}-border`} />
                  <TokenSwatch varName={`--${tier.key}-glow`} label={`${tier.key}-glow`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {tierContrastPairs.map((pair) => (
              <ContrastPair key={pair.label} fgVar={pair.fg} bgVar={pair.bg} label={pair.label} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-(length:--text-meta) font-semibold text-(--text-2)">
            Primitive scales (never used directly by components)
          </h3>
          <div className="flex flex-col gap-3">
            {primitiveScales.map((scale) => (
              <div key={scale.name} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-(length:--text-meta) text-(--text-2)">{scale.name}</span>
                <div className="flex flex-1 gap-1">
                  {scale.steps.map((step) => (
                    <TokenColorBlock key={step} varName={`--${scale.name}-${step}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="type-heading" className="flex flex-col gap-3">
        <h2 id="type-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Type
        </h2>
        <p className="text-(length:--text-body) text-(--text-2)">
          Inter, tabular numerals on every time and count. Fluid between 390 and 1440 (§4.3) — resize the
          window to watch the px readout move. Nothing below 14px carries content.
        </p>
        <div className="rounded-(--radius-control) border border-(--border-1) px-4">
          {typeRoles.map((role) => (
            <TypeSample key={role.role} {...role} />
          ))}
        </div>
      </section>

      <section aria-labelledby="spacing-heading" className="flex flex-col gap-3">
        <h2 id="spacing-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Spacing
        </h2>
        <p className="text-(length:--text-body) text-(--text-2)">
          <code className="text-(length:--text-kbd)">--spacing</code> stays Tailwind&rsquo;s 0.25rem — a
          semantic size like a control&rsquo;s md height is a token, not a spacing override (§4.1 rule 1).
        </p>
        <div className="grid grid-cols-2 gap-3 rounded-(--radius-control) border border-(--border-1) p-4 sm:grid-cols-3">
          {spacingSteps.map((step) => (
            <SpacingSample key={step.label} {...step} />
          ))}
        </div>
      </section>

      <section aria-labelledby="depth-heading" className="flex flex-col gap-3">
        <h2 id="depth-heading" className="text-(length:--text-title) font-semibold text-(--text-1)">
          Depth
        </h2>
        <p className="text-(length:--text-body) text-(--text-2)">
          Light: hairline border plus a 1px shadow. Dark: a lighter surface plus a 1px inner top highlight,
          never a darker shadow (§4.5).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ThemePanel theme="light">
            <DepthRow />
          </ThemePanel>
          <ThemePanel theme="dark">
            <DepthRow />
          </ThemePanel>
        </div>
      </section>
    </div>
  );
}

function TokenColorBlock({ varName }: { varName: string }) {
  return (
    <span
      title={varName}
      // eslint-disable-next-line react/forbid-dom-props -- inspection tooling, see token-swatch.tsx
      style={{ backgroundColor: `var(${varName})` }}
      className="h-8 flex-1 rounded-(--radius-chip) border border-(--border-1)"
    />
  );
}

function DepthRow() {
  return (
    <div className="flex gap-3">
      <div className="flex size-16 items-center justify-center rounded-(--radius-control) bg-(--surface-1) text-(length:--text-kbd) text-(--text-2) shadow-(--shadow-e1)">
        e1
      </div>
      <div className="flex size-16 items-center justify-center rounded-(--radius-control) bg-(--surface-1) text-(length:--text-kbd) text-(--text-2) shadow-(--shadow-e2)">
        e2
      </div>
      <div className="flex size-16 items-center justify-center rounded-(--radius-control) bg-(--surface-1) text-(length:--text-kbd) text-(--text-2) shadow-(--shadow-e3)">
        e3
      </div>
    </div>
  );
}

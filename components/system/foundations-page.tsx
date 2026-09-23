import { TokenSwatch } from "./token-swatch";
import { ContrastPair } from "./contrast-pair";
import { FocusSection, IconographySection, ModeLadder } from "./foundations-extra";
import { ModePanel } from "./kit";
import Link from "next/link";
import { TypeSample } from "./type-sample";
import { TokenMeasure } from "./token-measure";
import {
  chromaBanned,
  chromaWhitelist,
  easeTokens,
  heightLadder,
  motionTokens,
  radiusLadder,
  semanticContrastPairs,
  semanticGroups,
  tierContrastPairs,
  tiers,
  typeScale,
} from "./tokens-data";

export function FoundationsPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-20">
      <header>
        <h1 className="t-section text-(--text-1)">Foundations</h1>
        <p data-prose-num className="t-body mt-3 max-w-[68ch] text-(--text-2)">
          Every value on this page is read out of the running cascade, not typed here. Switch the
          mode above and watch the numbers move — <strong className="font-semibold text-(--text-1)">wire
          is a real mode</strong>, not a filter: it multiplies every chroma channel in the token file
          by zero and leaves lightness alone, which is why the ranking survives it.
        </p>
      </header>

      <section aria-labelledby="type-heading" className="flex flex-col gap-4">
        <h2 id="type-heading" className="t-section text-(--text-1)">
          Type
        </h2>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          Inter Variable, self-hosted for its optical-size axis, with IBM Plex Mono for identifiers
          only. Eight steps, ratio 1.125 below 16px and 1.2 above, and{" "}
          <strong className="font-semibold text-(--text-1)">every step ships its own tracking</strong> —
          a step is one class, never four utilities assembled by hand, so tracking cannot be
          forgotten.
        </p>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          Three things on the worker screen are read from two metres: the hero title, the countdown,
          and which tier a row is in. At a 24-inch 1080p panel&rsquo;s 0.277mm pixel pitch, that
          needs 19px or more for a sentence and about 12px for a known word. Everything else is a
          one-metre lean-in surface, and 14 to 16px is right for it.
        </p>
        <div className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1) px-5">
          {typeScale.map((step) => (
            <TypeSample key={step.utility} {...step} />
          ))}
        </div>
      </section>

      <section aria-labelledby="color-heading" className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 id="color-heading" className="t-section text-(--text-1)">
            Colour
          </h2>
          <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
            The interface is near-monochrome. Rank descends in three channels at once — lightness,
            chroma and weight — so pulling the hue out leaves the ranking intact.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {semanticGroups.map((group) => (
            <div key={group.title}>
              <h3 className="t-eyebrow mb-3 text-(--text-2)">{group.title}</h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.tokens.map((name) => (
                  <TokenSwatch key={name} varName={name} label={name} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <ModeLadder />

        <div>
          <h3 className="t-eyebrow mb-3 text-(--text-2)">Contrast, measured live</h3>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
            {semanticContrastPairs.map((pair) => (
              <ContrastPair key={pair.label} fgVar={pair.fg} bgVar={pair.bg} label={pair.label} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="t-eyebrow text-(--text-2)">The four tiers</h3>
          <div className="overflow-hidden rounded-(--r-4) border border-(--line-1)">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-(--surface-2)">
                  <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                    Tier
                  </th>
                  <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                    Label
                  </th>
                  <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                    Tint
                  </th>
                  <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                    Line
                  </th>
                  <th scope="col" className="t-eyebrow px-4 py-2.5 text-left text-(--text-2)">
                    Icon
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.key} className="border-t border-(--line-1) bg-(--surface-1)">
                    <th scope="row" className="t-meta px-4 py-3 text-left font-medium text-(--text-1)">
                      {tier.label}
                    </th>
                    <td className="px-4 py-3">
                      <TokenSwatch varName={`--${tier.key}-fg`} label={`${tier.key}-fg`} />
                    </td>
                    <td className="px-4 py-3">
                      <TokenSwatch varName={`--${tier.key}-bg`} label={`${tier.key}-bg`} />
                    </td>
                    <td className="px-4 py-3">
                      <TokenSwatch varName={`--${tier.key}-line`} label={`${tier.key}-line`} />
                    </td>
                    <td className="t-meta px-4 py-3 text-(--text-2)">
                      {tier.icon}, weight {tier.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
            {tierContrastPairs.map((pair) => (
              <ContrastPair key={pair.label} fgVar={pair.fg} bgVar={pair.bg} label={pair.label} />
            ))}
          </div>
          <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
            Only Act now carries a row tint. &ldquo;When you can&rdquo; and &ldquo;For your info&rdquo;
            sit deliberately close in lightness — they never appear in the same list, and they are
            told apart by chroma and by icon shape.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
          <h3 className="t-eyebrow text-(--text-2)">Where a saturated hue may appear</h3>
          <ul className="flex flex-col gap-1.5">
            {chromaWhitelist.map((rule) => (
              <li key={rule} className="t-body flex gap-2.5 text-(--text-2)">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-(--text-3)" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <p className="t-body mt-1 text-(--text-2)">
            <strong className="font-semibold text-(--text-1)">Banned everywhere else.</strong>{" "}
            {chromaBanned}
          </p>
        </div>
      </section>

      <section aria-labelledby="geometry-heading" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 id="geometry-heading" className="t-section text-(--text-1)">
            Geometry
          </h2>
          <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
            Radius is a function of height — <code className="t-mono">r = round(h × 0.28)</code>,
            snapped to the ladder — not a constant. Anything sharing a row shares one height token
            and one vertical centre.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
          <div className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
            <h3 className="t-eyebrow mb-4 text-(--text-2)">Radius</h3>
            <ul className="flex flex-col gap-3">
              {radiusLadder.map((step) => (
                <li key={step.token} className="flex items-center gap-3">
                  <TokenMeasure varName={step.token} kind="radius" />
                  <div className="min-w-0">
                    <p className="t-meta text-(--text-1)">{step.token.replace(/^--/, "")}</p>
                    <p className="t-meta truncate text-(--text-2)">{step.where}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
            <h3 className="t-eyebrow mb-4 text-(--text-2)">Heights</h3>
            <ul className="flex flex-col gap-3">
              {heightLadder.map((step) => (
                <li key={step.token} className="flex items-center gap-3">
                  <TokenMeasure varName={step.token} kind="height" />
                  <div className="min-w-0">
                    <p className="t-meta text-(--text-1)">{step.token.replace(/^--/, "")}</p>
                    <p className="t-meta truncate text-(--text-2)">{step.where}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="depth-heading" className="flex flex-col gap-4">
        <h2 id="depth-heading" className="t-section text-(--text-1)">
          Depth
        </h2>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          Three steps, and each has exactly one job: e1 a resting card, e2 the hero and the toast,
          e3 overlays. In dark, depth is a lighter surface plus a 1px inner top highlight — a dark
          card never casts a shadow, and a bordered card never contains a bordered card, because
          alpha-white borders compound.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {(["light", "dark", "wire"] as const).map((mode) => (
            <ModePanel key={mode} mode={mode}>
              <DepthRow />
            </ModePanel>
          ))}
        </div>
      </section>

      <FocusSection />

      <IconographySection />

      <section aria-labelledby="motion-heading" className="flex flex-col gap-4">
        <h2 id="motion-heading" className="t-section text-(--text-1)">
          Motion
        </h2>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          Three curves and two springs, and no component may inline a curve. Nothing exceeds 700ms,
          nothing loops except the all-clear aurora, and nothing moves while the hero is being read
          unless the reader caused it. The eighteen named moments are playable, each beside its
          reduced variant, on <Link href="/system/motion" className="font-medium text-(--accent) underline underline-offset-2">Motion</Link>.
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2">
          <div className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
            <h3 className="t-eyebrow mb-3 text-(--text-2)">Duration</h3>
            <ul className="flex flex-col gap-2">
              {motionTokens.map((token) => (
                <li key={token.token} className="flex items-baseline justify-between gap-3">
                  <span className="t-meta text-(--text-1)">{token.where}</span>
                  <TokenMeasure varName={token.token} kind="text" />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-5">
            <h3 className="t-eyebrow mb-3 text-(--text-2)">Easing</h3>
            <ul className="flex flex-col gap-2">
              {easeTokens.map((token) => (
                <li key={token.token} className="flex flex-col">
                  <span className="t-meta text-(--text-1)">{token.where}</span>
                  <TokenMeasure varName={token.token} kind="text" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function DepthRow() {
  return (
    <div className="flex gap-3">
      {(["--e1", "--e2", "--e3"] as const).map((token) => (
        <div
          key={token}
          className="t-mono flex size-16 items-center justify-center rounded-(--r-4) border border-(--line-1) bg-(--surface-1) text-(--text-2)"
          // eslint-disable-next-line react/forbid-dom-props -- inspection tooling, see token-swatch.tsx
          style={{ boxShadow: `var(${token})` }}
        >
          {token.replace(/^--/, "")}
        </div>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FidelitySwitch } from "@/components/site/fidelity-switch";
import { cn } from "@/lib/cn";
import { Action, Arrow, Bound, Section, Shot, StatCell } from "@/components/site/pieces";
import { Reveal } from "@/components/site/reveal";
import { SiteFooter, SiteNav } from "@/components/site/site-chrome";
import {
  BEATS,
  FAILURES,
  GATES,
  LINKS,
  OMISSIONS,
  STATS,
  SURFACES,
  TIERS,
} from "@/components/site/site-data";

export const metadata: Metadata = {
  title: "Relay — a one-hour brief, built overnight",
  description:
    "A redesign of a fulfillment operations dashboard for the Foundey Senior Product Designer challenge: what was wrong, what replaced it, how it was built in a night, and what was deliberately left undone.",
  openGraph: {
    title: "Relay — a one-hour brief, built overnight",
    description:
      "The hour went into the argument. The build ran while nobody was at the keyboard, against eleven gates that grade themselves.",
    type: "article",
  },
};

export default function CaseStudyPage() {
  return (
    <div className="site-root min-h-dvh">
      <SiteNav />

      <main id="top">
        {/* ---------------------------------------------------------------- hero */}
        <section className="site-texture relative overflow-hidden border-b border-(--site-line-soft)">
          <Bound className="relative py-16 sm:py-24">
            <p className="t-site-eyebrow text-(--site-text-3)">
              Foundey · Senior Product Designer · September 2026
            </p>

            <h1 className="t-site-display mt-8 max-w-[16ch] text-balance text-(--site-text-1)">
              Fifty minutes to answer it.
              <span className="block text-(--site-text-3)">One night to build it.</span>
            </h1>

            <p className="t-site-lead mt-8 max-w-(--site-prose) text-pretty text-(--site-text-2)">
              Foundey asked for a low-fidelity redesign of a warehouse operations
              dashboard, in under an hour. What follows is the argument I wrote and the
              product <strong className="font-medium text-(--site-text-1)">AI agents built
              from it overnight</strong>, against eleven gates that grade themselves. My own
              hands on it came to a handful of prompts and a few minutes of reading. Nothing
              here was drawn in Figma.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Action href={LINKS.prototype} variant="primary">
                Open the prototype
              </Action>
              <Action href={LINKS.deck}>Read the deck</Action>
              <Action href={LINKS.github} external>
                Code on GitHub
              </Action>
            </div>

            <Shot
              className="mt-14"
              src="/shots/work-dark.png"
              alt="Relay's worker screen: a status sentence reading 2 need you now, one hero task with the reason underneath it and a countdown ring, then a queue in four labelled tiers, and a rail of carrier cutoffs."
              caption="/work · SEA4 · one frozen Tuesday at 10:40. No data is invented at runtime."
              priority
            />
          </Bound>
        </section>

        {/* --------------------------------------------------------------- stats */}
        <section aria-label="The work in numbers" className="py-14 sm:py-16">
          <Bound>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
              {STATS.map((stat) => (
                <li key={stat.label}>
                  <StatCell {...stat} />
                </li>
              ))}
            </ul>
          </Bound>
        </section>

        <Bound>
          <div className="site-rule" />
        </Bound>

        {/* ------------------------------------------------------------ 01 brief */}
        <Reveal as="div">
          <Section
            id="brief"
            numeral="01"
            eyebrow="The ask"
            title="Two sentences, from two people who cannot see each other."
            lead="The brief gave a fulfillment centre, a dashboard nobody trusts, and two complaints. Everything below is an answer to one of them."
          >
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  quote: "I never know what needs my attention first.",
                  who: "An outbound exception coordinator, on the floor",
                  answer: "Answered by /work",
                },
                {
                  quote: "I cannot see what each worker is doing.",
                  who: "A shift manager, at a desk",
                  answer: "Answered by /team",
                },
              ].map((item) => (
                <figure
                  key={item.answer}
                  className="rounded-(--r-5) border border-(--site-line-soft) bg-(--site-bg-2) p-8"
                >
                  <blockquote className="t-site-h3 text-pretty text-(--site-text-1)">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="t-site-mono mt-5 text-(--site-text-3)">
                    {item.who}
                    <span className="mt-2 block text-(--site-text-2)">{item.answer}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {["Under 1 hour", "Low fidelity or wireframes", "Graded on product thinking"].map(
                (chip) => (
                  <li
                    key={chip}
                    className="t-site-mono flex h-(--h-xs) items-center rounded-(--r-full) border border-(--site-line) px-3 text-(--site-text-3)"
                  >
                    {chip}
                  </li>
                ),
              )}
            </ul>
          </Section>
        </Reveal>

        {/* -------------------------------------------------------- 02 diagnosis */}
        <Reveal as="div">
          <Section
            id="diagnosis"
            numeral="02"
            eyebrow="The diagnosis"
            title="The old screen already ranked. Ranking was never what was missing."
            lead="Its queue was titled “Needs Your Attention, ranked by urgency”, and people still said they did not know what to do first. So the order was not the problem. Four other things were."
          >
            <ol className="grid gap-px overflow-hidden rounded-(--r-5) border border-(--site-line-soft) bg-(--site-line-soft) sm:grid-cols-2">
              {FAILURES.map((failure, i) => (
                <li key={failure.id} className="bg-(--site-bg-2) p-8">
                  <p className="t-site-mono text-(--site-text-3)">
                    {String(i + 1).padStart(2, "0")} · {failure.quote}
                  </p>
                  <h3 className="t-site-h3 mt-4 text-pretty text-(--site-text-1)">
                    {failure.claim}
                  </h3>
                  <p className="t-site-body mt-3 text-pretty text-(--site-text-2)">
                    {failure.detail}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        </Reveal>

        {/* ----------------------------------------------------------- 03 answer */}
        <Reveal as="div">
          <Section
            id="answer"
            numeral="03"
            eyebrow="The answer"
            title="One thing at the top, and the reason written underneath it."
            lead="Not a better sort. A screen that commits to a single next action, says out loud why that one, and can be finished."
          >
            <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr]">
              <div className="flex flex-col gap-10">
                <div>
                  <h3 className="t-site-h3 text-(--site-text-1)">The score, in plain words</h3>
                  <p className="t-site-body mt-3 max-w-(--site-prose) text-(--site-text-2)">
                    “Why is this first?” opens the actual arithmetic. Not a confidence bar,
                    not a coloured dot — the three numbers that produced the rank and the
                    threshold they crossed.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-2 rounded-(--r-4) border border-(--site-line-soft) bg-(--site-bg-2) p-4">
                    {[
                      { part: "Time", n: "30" },
                      { part: "Orders", n: "22" },
                      { part: "Impact", n: "10" },
                    ].map((term, i) => (
                      <span key={term.part} className="flex items-center gap-2">
                        {i > 0 ? <span className="t-site-mono text-(--site-text-3)">+</span> : null}
                        <span className="t-site-mono rounded-(--r-1) bg-(--site-bg-3) px-2 py-1 text-(--site-text-2)">
                          {term.part} {term.n}
                        </span>
                      </span>
                    ))}
                    <span className="t-site-mono text-(--site-text-3)">=</span>
                    <span className="t-site-mono rounded-(--r-1) px-2 py-1 text-(--site-act)">
                      62
                    </span>
                    <span className="t-site-mono ml-auto text-(--site-text-3)">
                      60+ means act now
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="t-site-h3 text-(--site-text-1)">
                    Four tiers, instead of a feed
                  </h3>
                  <p className="t-site-body mt-3 max-w-(--site-prose) text-(--site-text-2)">
                    Grouped by what happens next, never by where the task came from. The
                    tier name is the instruction.
                  </p>
                  <ul className="mt-6 flex flex-col">
                    {TIERS.map((tier) => (
                      <li
                        key={tier.name}
                        className="flex items-baseline gap-4 border-t border-(--site-line-soft) py-4"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-2.5 shrink-0 translate-y-px rounded-(--r-full)",
                            tier.dot,
                          )}
                        />
                        <span className={cn("t-site-body shrink-0 font-medium", tier.fg)}>
                          {tier.name}
                        </span>
                        <span className="t-site-body text-(--site-text-2)">{tier.meaning}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="t-site-h3 text-(--site-text-1)">And a way to be done</h3>
                  <p className="t-site-body mt-3 max-w-(--site-prose) text-(--site-text-2)">
                    Finish the last one and the queue does not refill itself. It says the
                    shift is clear and shows what was finished. A queue with no end has no
                    pace.
                  </p>
                </div>
              </div>

              <Shot
                src="/shots/work-390-light.png"
                alt="The worker's screen at 390 pixels wide: the same hero and the same four tiers, with the primary action moved into a sticky bar at thumb height."
                caption="390px. The primary action moves to a thumb-height bar — a handheld decision, not a reflow."
                width={998}
                height={2160}
                className="mx-auto max-w-sm"
              />
            </div>
          </Section>
        </Reveal>

        {/* ------------------------------------------------------------ 04 proof */}
        <Reveal as="div">
          <Section
            id="proof"
            numeral="04"
            eyebrow="The proof"
            title="If the ranking only works in colour, it does not work."
            lead="Wire is a real mode with its own token values — every chroma channel multiplied by zero, lightness untouched. It is not a grayscale filter, and a lint rule keeps it that way. Switch it and check that you can still tell what to do first."
          >
            <FidelitySwitch />
            <p className="t-site-body mt-8 max-w-(--site-prose) text-(--site-text-2)">
              This is also the brief&rsquo;s low-fidelity answer, kept live instead of
              screenshotted: the same shipped screens, with every colour channel switched
              off. Rank survives in shape, label, position and weight.
            </p>
          </Section>
        </Reveal>

        {/* ------------------------------------------------------------ 05 night */}
        <Reveal as="div">
          <Section
            id="night"
            numeral="05"
            eyebrow="The process"
            title="I wrote the prompts. The agents wrote the code."
            lead="Read out of git log, in the machine's own time zone. Twelve commits landed between the last thing I typed one night and lunchtime the next day. Six of them arrived between midnight and half past eight, and three beats on this whole timeline are a person."
          >
            <div className="flex flex-col gap-8">
              <ul className="t-site-mono flex flex-wrap gap-x-6 gap-y-2 text-(--site-text-3)">
                <li className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-(--r-full) border border-(--site-text-2)"
                  />
                  Me, deciding something
                </li>
                <li className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-(--r-full) bg-(--site-text-3)"
                  />
                  An agent, shipping something
                </li>
              </ul>

              <ol className="relative flex flex-col">
                {/* The spine, lit only across the hours nobody was awake for. */}
                <span
                  aria-hidden="true"
                  className="site-night-spine absolute inset-y-2 left-[calc(4.5rem+0.5px)] w-px sm:left-[calc(6rem+0.5px)]"
                />
                {BEATS.map((beat) => (
                  <li key={`${beat.day}-${beat.time}`} className="relative flex gap-6 pb-10">
                    <div className="w-18 shrink-0 text-right sm:w-24">
                      <p className="t-site-mono text-(--site-text-1)">{beat.time}</p>
                      <p className="t-site-mono text-(--site-text-3)">{beat.day}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={
                        beat.human
                          ? "relative z-10 mt-1.5 size-2.5 shrink-0 -translate-x-1/2 rounded-(--r-full) border border-(--site-text-2) bg-(--site-bg)"
                          : "relative z-10 mt-1.5 size-2.5 shrink-0 -translate-x-1/2 rounded-(--r-full) bg-(--site-text-3)"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="t-site-h3 text-pretty text-(--site-text-1)">
                        {beat.title}
                        {beat.night ? (
                          <span className="t-site-mono ml-3 align-middle text-(--site-text-3)">
                            unattended
                          </span>
                        ) : null}
                      </h3>
                      <p className="t-site-body mt-2 max-w-[48rem] text-pretty text-(--site-text-2)">
                        {beat.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="t-site-body max-w-(--site-prose) text-(--site-text-2)">
                My part is small, and it is meant to be: an argument, a plan, a few hard
                constraints, and a prompt at the end of the night. Minutes of typing, not
                hours of drawing. What makes that safe is not trust — it is that every claim
                an agent makes here is checkable by a command someone else can run, and that
                the agent which grades the work is never the one that did it.
              </p>
            </div>
          </Section>
        </Reveal>

        {/* ------------------------------------------------------------ 06 gates */}
        <Reveal as="div">
          <Section
            id="gates"
            numeral="06"
            eyebrow="The constraints"
            title="Nothing is graded by looking at the thing it grades."
            lead="Eleven gates. Nine are a command, so they cannot be talked out of a red. The last two are judgement, and are done by a session that did not build the thing."
          >
            <ul className="grid gap-px overflow-hidden rounded-(--r-5) border border-(--site-line-soft) bg-(--site-line-soft) sm:grid-cols-2 lg:grid-cols-3">
              {GATES.map((gate) => (
                <li key={gate.id} className="flex flex-col gap-3 bg-(--site-bg-2) p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="t-site-mono text-(--site-text-1)">{gate.id}</span>
                    <span
                      className={
                        gate.how === "command"
                          ? "t-site-mono text-(--site-text-3)"
                          : "t-site-mono text-(--site-next)"
                      }
                    >
                      {gate.how}
                    </span>
                  </div>
                  <p className="t-site-body text-pretty text-(--site-text-2)">{gate.holds}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-(--r-5) border border-(--site-line-soft) p-8">
              <h3 className="t-site-h3 text-(--site-text-1)">What the gates cost to run</h3>
              <dl className="mt-6 grid gap-6 sm:grid-cols-3">
                {[
                  { k: "283 unit tests", v: "0.5s — the priority model, copy, tokens, contrast pairs" },
                  { k: "304 end-to-end tests", v: "78s — size contract, six widths, axe, wire, reduced motion" },
                  { k: "48 pixel baselines", v: "10s — eight surfaces at six widths, compared not described" },
                ].map((row) => (
                  <div key={row.k}>
                    <dt className="t-site-body font-medium text-(--site-text-1)">{row.k}</dt>
                    <dd className="t-site-mono mt-1 text-(--site-text-3)">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Section>
        </Reveal>

        {/* ------------------------------------------------------------- 07 cuts */}
        <Reveal as="div">
          <Section
            id="cuts"
            numeral="07"
            eyebrow="The honest part"
            title="What I did not do."
            lead="A case study that only lists wins is a sales page. These are the choices a reviewer would find anyway by opening the repo, so they are here first."
          >
            <ol className="flex flex-col">
              {OMISSIONS.map((omission, i) => (
                <li
                  key={omission.title}
                  className="grid gap-4 border-t border-(--site-line-soft) py-8 md:grid-cols-[3rem_1fr] md:gap-8"
                >
                  <span className="t-site-mono text-(--site-text-3)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="t-site-h3 text-pretty text-(--site-text-1)">
                      {omission.title}
                    </h3>
                    <p className="t-site-body mt-3 max-w-(--site-prose) text-pretty text-(--site-text-2)">
                      {omission.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </Reveal>

        {/* ---------------------------------------------------------- 08 explore */}
        <Reveal as="div">
          <Section
            id="explore"
            numeral="08"
            eyebrow="Go and look"
            title="Everything here is running, not rendered."
            lead="Two product screens, the deck, a design system read out of its own stylesheet, and the repository behind all of it."
          >
            <ul className="grid gap-6 sm:grid-cols-2">
              {SURFACES.map((surface) => (
                <li key={surface.title}>
                  <Link
                    href={surface.href}
                    className="group flex h-full flex-col overflow-hidden rounded-(--r-5) border border-(--site-line-soft) bg-(--site-bg-2) transition-colors hover:border-(--site-text-3) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)"
                  >
                    {surface.shot ? (
                      <Image
                        src={surface.shot.src}
                        alt={surface.shot.alt}
                        width={2160}
                        height={1350}
                        sizes="(max-width: 640px) 100vw, 544px"
                        className="block h-auto w-full border-b border-(--site-line-soft)"
                      />
                    ) : null}
                    <div className="flex flex-1 flex-col p-7">
                      <p className="t-site-eyebrow text-(--site-text-3)">{surface.eyebrow}</p>
                      <h3 className="t-site-h3 mt-3 flex items-center gap-2 text-(--site-text-1)">
                        {surface.title}
                        <Arrow className="size-3.5 text-(--site-text-3) transition-colors group-hover:text-(--site-text-1)" />
                      </h3>
                      <p className="t-site-body mt-3 text-pretty text-(--site-text-2)">
                        {surface.detail}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-6 rounded-(--r-5) border border-(--site-line-soft) p-8 md:grid-cols-2">
              <div>
                <h3 className="t-site-h3 text-(--site-text-1)">The Figma files</h3>
                <p className="t-site-body mt-3 text-(--site-text-2)">
                  Generated from the shipped screens and their tokens, after the fact —
                  variables in three modes, every component a variant set, and eight flows
                  runnable in presentation mode.
                </p>
                <ul className="mt-4 flex flex-col">
                  {[
                    { href: LINKS.figmaSystem, label: "Design system" },
                    { href: LINKS.figmaPrototype, label: "Prototype — 21 frames at 1440, 21 at 390" },
                    { href: LINKS.figmaDeck, label: "Deck" },
                  ].map((file) => (
                    <li key={file.label}>
                      <a
                        href={file.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="t-site-body inline-flex h-11 items-center gap-1.5 text-(--site-text-1) underline decoration-(--site-line) underline-offset-4 transition-colors hover:decoration-(--site-text-3) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)"
                      >
                        {file.label}
                        <Arrow className="size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-start justify-between gap-6">
                <div>
                  <h3 className="t-site-h3 text-(--site-text-1)">The repository</h3>
                  <p className="t-site-body mt-3 text-(--site-text-2)">
                    The plan, the gates, the tests, the pixel baselines, and this page. The
                    commit messages are the log the timeline above was read from.
                  </p>
                </div>
                <Action href={LINKS.github} variant="primary" external>
                  github.com/iziuqo/foundey-relay
                </Action>
              </div>
            </div>
          </Section>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}

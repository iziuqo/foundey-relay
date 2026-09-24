import Link from "next/link";
import { Arrow, Bound, Mark } from "./pieces";
import { LINKS } from "./site-data";

const JUMPS = [
  { href: "#diagnosis", label: "The diagnosis" },
  { href: "#answer", label: "The answer" },
  { href: "#night", label: "The night shift" },
  { href: "#cuts", label: "What I skipped" },
];

/**
 * The top bar. Sticky, 56px like the app's own, and translucent over a backdrop blur —
 * `backdrop-filter` rather than `filter`, which is the distinction the source gate draws
 * and the reason wire mode is a token mode in the first place.
 */
export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--site-line-soft) bg-(--site-bg)/85 backdrop-blur-md">
      <Bound>
        <nav
          aria-label="This page"
          className="flex h-(--h-topbar) items-center justify-between gap-4"
        >
          <Link
            href="#top"
            className="tap-48 flex h-11 items-center gap-2.5 rounded-(--r-2) text-(--site-text-1) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--site-focus)"
          >
            <Mark className="size-5" />
            <span className="t-site-body font-semibold">Relay</span>
            <span className="t-site-mono hidden text-(--site-text-3) sm:inline">
              / case study
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <ul className="hidden items-center lg:flex">
              {JUMPS.map((jump) => (
                <li key={jump.href}>
                  <a
                    href={jump.href}
                    className="t-site-mono tap-48 flex h-(--h-md) items-center rounded-(--r-2) px-3 text-(--site-text-3) transition-colors hover:text-(--site-text-1) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)"
                  >
                    {jump.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noreferrer noopener"
              className="t-site-mono tap-48 hidden h-(--h-md) items-center gap-1.5 rounded-(--r-2) px-3 text-(--site-text-3) transition-colors hover:text-(--site-text-1) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus) sm:flex"
            >
              GitHub
              <Arrow className="size-3" />
            </a>
            <Link
              href={LINKS.prototype}
              className="t-site-mono tap-48 flex h-9 items-center rounded-(--r-full) bg-(--site-text-1) px-4 text-(--site-bg) transition-colors hover:bg-(--site-text-2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)"
            >
              Open the prototype
            </Link>
          </div>
        </nav>
      </Bound>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-(--site-line-soft) py-16">
      <Bound>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-(--site-prose)">
            <div className="flex items-center gap-2.5 text-(--site-text-1)">
              <Mark className="size-5" />
              <span className="t-site-body font-semibold">Relay</span>
            </div>
            <p className="t-site-body mt-4 text-(--site-text-2)">
              Built for the Foundey Senior Product Designer challenge, September 2026, by
              izaias — design engineer, product designer and researcher.
            </p>
            <p className="t-site-mono mt-4 text-(--site-text-3)">
              This page is part of the same repository and obeys the same rules as the
              product: every colour is a token, nothing is a filter, and it is in the axe
              and no-scroll suites with every other route.
            </p>
          </div>

          <ul className="flex flex-col">
            {[
              { href: LINKS.prototype, label: "The prototype", external: false },
              { href: LINKS.deck, label: "The deck", external: false },
              { href: LINKS.system, label: "The design system", external: false },
              { href: LINKS.github, label: "The code", external: true },
            ].map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="t-site-body inline-flex h-11 items-center gap-1.5 text-(--site-text-1) underline decoration-(--site-line) underline-offset-4 transition-colors hover:decoration-(--site-text-3) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)"
                  >
                    {link.label}
                    <Arrow className="size-3" />
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="t-site-body inline-flex h-11 items-center text-(--site-text-1) underline decoration-(--site-line) underline-offset-4 transition-colors hover:decoration-(--site-text-3) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Bound>
    </footer>
  );
}

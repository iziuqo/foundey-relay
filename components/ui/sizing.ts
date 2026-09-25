/**
 * The size contract — one place, so a control cannot invent its own geometry.
 *
 * Height decides radius: `r = round(h × 0.28)`, snapped to the ladder. v2 computed
 * `border-radius: 12px` on every control it had, from a 28px pill to a 48px button
 * (measured), so r/h ranged 0.25 → 0.43 and the small controls read as over-rounded
 * pills beside under-rounded large ones.
 *
 * Height also decides the icon size and the horizontal padding, which is what keeps
 * optical weight constant: a 16px icon at stroke 1.5 inside a 32px control carries the
 * same visual weight as a 20px icon at 1.75 inside a 48px one. Each step therefore sets
 * `--icon-stroke` as well as the size; `globals.css` applies it, because lucide's own
 * `stroke-width="2"` attribute would otherwise flatten the whole ladder to one weight.
 *
 * The rule this table exists to enforce: **anything sharing a row shares one entry.**
 * No 32 beside 40, ever. `tests/e2e/craft.spec.ts` measures it.
 */

export const CONTROL = {
  /**
   * 28 — chips and time pills. **Presentational only.** An interactive control never
   * takes this step: it cannot reach a 44px target on a phone without a pseudo-element,
   * and `input`/`select` are replaced elements that have no pseudo-elements to give.
   */
  xs: {
    height: "h-(--h-xs)",
    square: "size-(--h-xs)",
    radius: "rounded-(--r-2)",
    text: "t-meta",
    padding: "px-2.5",
    gap: "gap-1.5",
    icon: "[&_svg]:icon-sm [--icon-stroke:var(--icon-stroke-sm)]",
  },
  /** 32 — secondary actions inside dense surfaces. 48 on a handheld. */
  sm: {
    height: "h-(--h-sm) max-md:h-(--h-lg)",
    square: "size-(--h-sm) max-md:size-(--h-lg)",
    radius: "rounded-(--r-2) max-md:rounded-(--r-4)",
    text: "t-meta",
    padding: "px-3 max-md:px-5",
    gap: "gap-1.5",
    icon: "[&_svg]:icon-sm [--icon-stroke:var(--icon-stroke-sm)] max-md:[&_svg]:icon-lg max-md:[--icon-stroke:var(--icon-stroke-lg)]",
  },
  /** 40 — the default: inputs, selects, most buttons. 48 on a handheld. */
  md: {
    height: "h-(--h-md) max-md:h-(--h-lg)",
    square: "size-(--h-md) max-md:size-(--h-lg)",
    radius: "rounded-(--r-3) max-md:rounded-(--r-4)",
    text: "t-body",
    padding: "px-3.5 max-md:px-5",
    gap: "gap-2",
    icon: "[&_svg]:icon-md [--icon-stroke:var(--icon-stroke-md)] max-md:[&_svg]:icon-lg max-md:[--icon-stroke:var(--icon-stroke-lg)]",
  },
  /** 48 — the primary action, and the only step that needs no help to be tappable. */
  lg: {
    height: "h-(--h-lg)",
    square: "size-(--h-lg)",
    radius: "rounded-(--r-4)",
    text: "t-body",
    padding: "px-5",
    gap: "gap-2",
    icon: "[&_svg]:icon-lg [--icon-stroke:var(--icon-stroke-lg)]",
  },
} as const;

export type ControlSize = keyof typeof CONTROL;

/**
 * Focus is an outline, not a ring. Tailwind's `ring` + `ring-offset` needs the offset
 * painted in a background colour, which is wrong the moment a control sits on a tinted
 * surface — a white halo around a button inside the Act-now hero. `outline` follows the
 * border radius, needs no background to match, and is never animated: it has to be
 * there on the frame the key lands.
 */
export const FOCUS =
  // No `outline-none` here, deliberately: in Tailwind v4 it sets --tw-outline-style to
  // `none`, and `outline-2` reads that same variable — so the pair silently cancels and
  // the focus ring never paints. `outline-solid` on the focus-visible state is what
  // makes it appear. (Found by the /system focus test, which is why that test exists.)
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) " +
  "data-[force=focus]:outline-solid data-[force=focus]:outline-2 data-[force=focus]:outline-offset-2 data-[force=focus]:outline-(--focus)";

/**
 * Press: 0.985, buttons only, and fast enough not to delay the thing being pressed.
 * Scaling a whole 64px row instead of the control inside it is the failure to avoid.
 */
export const PRESS =
  "transition-[background-color,color,border-color,transform] duration-(--dur-press-out) ease-(--ease-out) " +
  // M3 is two durations, not one: 80ms down and 120ms up. A press that returns as fast
  // as it depresses reads as a twitch; the slower release is what makes it feel like a
  // physical key coming back.
  "active:duration-(--dur-press-in) data-[force=active]:duration-(--dur-press-in) " +
  "active:scale-[0.985] data-[force=active]:scale-[0.985] " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

export const DISABLED = "disabled:opacity-45 disabled:pointer-events-none";

/**
 * Handheld hit area, for the cases the ladder above cannot reach.
 *
 * Below 768 every interactive step resolves to 48, so a phone has one control height
 * and every target clears 44×44 by construction. This is the fallback for anything
 * that still ends up smaller — an xs control pressed into service as a button, or a
 * control whose box is constrained by its container. It extends the *target* with a
 * transparent pseudo-element rather than growing the box and breaking the row's
 * rhythm; the rule lives in globals.css, scoped to coarse pointers and narrow
 * viewports. It does nothing on `input` and `select`, which are replaced elements with
 * no pseudo-elements — those must take a real 48 instead, which the ladder gives them.
 */
export const TAP = "tap-48";

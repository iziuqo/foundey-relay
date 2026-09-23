/** The instant every slide embed is a picture of. Pinned rather than read from the
 * clock, so `/deck`, `/deck/print` and the exported PDF all show the same minute — and
 * written with an offset, not as a local time, so a machine in São Paulo and one in
 * Tokyo agree on it (G7). */
export const DECK_NOW = new Date("2026-09-22T10:40:00-07:00");

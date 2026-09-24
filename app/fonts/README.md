# Fonts

`InterVariable-latin.woff2` — Inter v4 (SIL OFL 1.1, see `Inter-LICENSE.txt`), subset from
[rsms.me/inter](https://rsms.me/inter/font-files/InterVariable.woff2) (352KB → 50KB, 454 glyphs)
while **keeping both variable axes**: `opsz` 14–32 and `wght` 400–600. The weight axis is
narrowed to what the UI uses (400/500/600, and nothing above 600 — `tests/unit/tokens.test.ts`
enforces that): the full 100–900 range was 72KB, and on the G8 mobile profile the extra 22KB of
font was worth about two points of performance (LOG M14). Widening it back means changing
`weight` in `app/layout.tsx` too.

The `opsz` axis is the reason this file is vendored instead of using `next/font/google`, which does
not expose it (plan v3 §4.1, advisor §3.1). Per-step `font-variation-settings: "opsz" <n>` is what
makes the 33px hero title read as a headline rather than large body copy.

Regenerate with:

```
pip install fonttools brotli
curl -o /tmp/InterVariable.woff2 https://rsms.me/inter/font-files/InterVariable.woff2
pyftsubset /tmp/InterVariable.woff2 --output-file=app/fonts/InterVariable-latin.woff2 \
  --flavor=woff2 \
  --layout-features='kern,liga,calt,ss02,cv05,cv08,tnum,zero,case,frac,ordn' \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2190,U+2192,U+2212,U+2215,U+FEFF,U+FFFD,U+2318,U+21E7,U+2325,U+23CE,U+2713,U+00B7' \
  --no-hinting --desubroutinize --name-IDs='*' --drop-tables+=DSIG

# then narrow the weight axis (100–900 → 400–600); opsz is kept whole
fonttools varLib.instancer app/fonts/InterVariable-latin.woff2 wght=400:600 opsz=14:32 \
  -o app/fonts/InterVariable-latin.woff2 --no-overlap-flag
```

The unicode range covers Latin-1, the punctuation Relay's copy uses (`·`, en/em dashes, arrows),
and the keyboard glyphs the shortcut hints render (`⌘ ⇧ ⌥ ⏎ ✓`). Adding a character outside it
silently falls back to the system sans — check here first if a glyph looks wrong.

IBM Plex Mono (identifiers only) comes from `next/font/google`; it has no optical-size axis to
preserve, so there is nothing to vendor.

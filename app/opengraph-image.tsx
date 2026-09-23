/* eslint-disable react/forbid-dom-props -- next/og's ImageResponse renders through
   Satori, not React DOM: it only understands inline flexbox styles, not Tailwind
   classes or CSS custom properties, so every element here needs `style` (plan §9.2
   P1 9-11's token-only rule is about the app's own real DOM). */
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The old /og.png 404ed because nothing generated it (v1 README §9.2 P1 22). Satori (the
// renderer behind ImageResponse) only lays out flexbox and can't read CSS custom
// properties from globals.css, so these are the light theme's real v3 token values,
// hand copied once rather than kept live and converted from OKLCH to sRGB:
// --n-1 (--bg), --n-8 (--text-2), --n-9 (--text-1). The mark is
// --text-1 like the app's own, not an accent: v3 spends hue on priority only (§4.2).
// Satori reads ttf/otf/woff, not the woff2 the app self-hosts, so the type is its
// bundled sans rather than Inter. The dot-grid texture (§4.4) is left out: Satori does not
// paint a repeating radial-gradient, and a card this size does not need it.
const BG = "#f6f7f8";
const TEXT = "#101214";
const TEXT_2 = "#505356";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          backgroundColor: BG,
                    fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 32 }}>
          <svg width={72} height={72} viewBox="0 0 24 24" fill="none">
            <rect x={3} y={4} width={4} height={16} rx={1.5} fill={TEXT} />
            <rect x={10} y={8} width={4} height={12} rx={1.5} fill={TEXT} opacity={0.7} />
            <rect x={17} y={12} width={4} height={8} rx={1.5} fill={TEXT} opacity={0.45} />
          </svg>
          <span style={{ fontSize: 96, fontWeight: 600, color: TEXT, letterSpacing: -2.4 }}>Relay</span>
        </div>
        <span style={{ fontSize: 34, color: TEXT_2, maxWidth: 900 }}>
          Making the next right action obvious.
        </span>
      </div>
    ),
    { ...size },
  );
}

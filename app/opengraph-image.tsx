/* eslint-disable react/forbid-dom-props -- next/og's ImageResponse renders through
   Satori, not React DOM: it only understands inline flexbox styles, not Tailwind
   classes or CSS custom properties, so every element here needs `style` (plan §9.2
   P1 9-11's token-only rule is about the app's own real DOM). */
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// §9.2 P1 22 (README): the old /og.png 404s because nothing generates it. Satori (the
// renderer behind ImageResponse) only lays out flexbox and can't read CSS custom
// properties from globals.css, so these are the app's real token values, hand copied
// once rather than kept live — --gray-1 (bg), --gray-12 (--text-1), --indigo-9 (--accent).
const BG = "#fafaf9";
const TEXT = "#1f1f23";
const ACCENT = "#4f46e5";

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
          background: BG,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 32 }}>
          <svg width={72} height={72} viewBox="0 0 24 24" fill="none">
            <rect x={3} y={4} width={4} height={16} rx={1.5} fill={ACCENT} />
            <rect x={10} y={8} width={4} height={12} rx={1.5} fill={ACCENT} opacity={0.7} />
            <rect x={17} y={12} width={4} height={8} rx={1.5} fill={ACCENT} opacity={0.45} />
          </svg>
          <span style={{ fontSize: 88, fontWeight: 600, color: TEXT, letterSpacing: -2 }}>Relay</span>
        </div>
        <span style={{ fontSize: 32, color: TEXT, opacity: 0.7, maxWidth: 900 }}>
          Making the next right action obvious.
        </span>
      </div>
    ),
    { ...size },
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Inter is vendored rather than pulled from next/font/google because Google's build
// does not expose the `opsz` axis, and per-step optical sizing is what makes the 33px
// hero title read as a headline instead of large body copy (v3 plan §4.1). The file is
// a latin subset carrying opsz 14–32 and wght 100–900 in 72KB — see app/fonts/README.md
// for the subsetting command and the exact unicode range.
const inter = localFont({
  src: "./fonts/InterVariable-latin.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Identifiers only — order numbers, bin codes, door numbers, keyboard hints. Plex over
// Geist Mono deliberately: Geist would read as Vercel cosplay, and Plex is an
// industrial face with a native slashed zero and unambiguous Il1.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // Vercel sets VERCEL_URL on every deploy (preview and production) with no config
  // needed; falls back to localhost for `next dev`/`next start`.
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  title: "Relay",
  description: "Relay: ranked queue for outbound exceptions.",
};

// Sets data-theme/data-fidelity on <html> from last session's storage before first
// paint, so there's no flash to the wrong theme while the store rehydrates client
// side (§8.3). Reads the same key the store persists to; anything unexpected falls
// back to light/hi, D2's defaults.
const themeBootstrapScript = `(function () {
  try {
    var raw = window.localStorage.getItem("relay-demo-v2");
    var state = raw ? JSON.parse(raw).state : null;
    var theme = state && state.theme === "dark" ? "dark" : "light";
    var fidelity = state && state.wireframe ? "wire" : "hi";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-fidelity", fidelity);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.setAttribute("data-fidelity", "hi");
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables go on <html>, not <body>: --font-sans in globals.css is
    // declared on :root and references --font-inter, and a custom property that
    // references an undefined property at the element where it is *declared* becomes
    // invalid at computed-value time. With the classes on <body> the whole stack
    // resolved to the initial font (Times), silently.
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable}`}
      data-theme="light"
      data-fidelity="hi"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

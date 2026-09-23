import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" data-theme="light" data-fidelity="hi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

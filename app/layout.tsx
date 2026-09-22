import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relay",
  description: "Relay: ranked queue for outbound exceptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

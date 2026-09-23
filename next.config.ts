import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Humans on :3000, tests on :3100 — but two `next dev` processes cannot share one
   * build directory: the second one dies on the dev lock in `.next/`, and Playwright
   * reports "Process from config.webServer was not able to start" with no mention of
   * the real cause. Three v3 sessions have lost time to this (LOG M5, M6, M8), and the
   * workaround each time was an rsync'd scratch copy of the repo — which reintroduces
   * exactly the "tested code is not the code on disk" risk the two-port split exists to
   * remove. The test server gets its own build dir instead.
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;

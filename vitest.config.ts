import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The same "@/" the app and tsconfig use. Without it a unit test cannot import from
  // `components/` at all, which is how a pure helper ends up either untested or copied
  // into the test file.
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: [
      "lib/**/*.test.ts",
      "state/**/*.test.ts",
      "tests/unit/**/*.test.ts",
    ],
    environment: "node",
  },
});

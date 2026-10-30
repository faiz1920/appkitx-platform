import { defineConfig, devices } from "@playwright/test";

/*
 * PC Builder development-preview end-to-end suite.
 *
 * The builder route is only mounted by `astro dev` (see
 * src/integrations/pc-builder-dev-preview.ts), so this suite runs against a
 * dev server instead of the production preview used by the main e2e suite.
 * The production suite and deployment configuration are untouched.
 */

const previewPort = 4521;
const previewUrl = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: "./e2e-pc-builder",
  fullyParallel: false,
  webServer: {
    command: `npm run dev -- --port ${previewPort} --host 127.0.0.1`,
    url: `${previewUrl}/pc-builder`,
    // Reuse a running dev server when present; Playwright starts one otherwise.
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL: previewUrl,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

import { defineConfig, devices } from "@playwright/test";

const previewPort = 4399;
const previewUrl = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: `wrangler dev --port ${previewPort} --ip 127.0.0.1 --local`,
    url: previewUrl,
    reuseExistingServer: false,
  },
  use: {
    baseURL: previewUrl,
    /*
     * The analytics consent banner is first-visit UI; most specs assert page
     * content and should not have a fixed overlay in the way. Preselect the
     * "denied" choice, which also matches the default GA4 consent state. The
     * consent spec overrides this with an empty storage state.
     */
    storageState: {
      cookies: [],
      origins: [
        {
          origin: previewUrl,
          localStorage: [{ name: "appkitx.consent", value: "denied" }],
        },
      ],
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});

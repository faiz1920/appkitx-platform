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
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});

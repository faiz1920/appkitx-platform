import { defineConfig, devices } from "@playwright/test";

const previewPort = 4399;

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: `npm run preview -- --port ${previewPort}`,
    port: previewPort,
  },
  use: {
    baseURL: `http://localhost:${previewPort}`,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

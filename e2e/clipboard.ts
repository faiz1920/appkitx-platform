import type { Page } from "@playwright/test";

/*
 * Playwright exposes clipboard permissions only in Chromium. Firefox maps
 * neither permission, and WebKit maps clipboard-read but not clipboard-write.
 * Keep the real Clipboard API integration in Chromium; in the other engines
 * install a per-document in-memory implementation so the production handler
 * still performs an awaited `navigator.clipboard.writeText(...)` call through
 * the real Copy button, and tests can assert the exact payload written.
 */
export async function prepareClipboard(
  page: Page,
  browserName: string,
): Promise<void> {
  if (browserName === "chromium") {
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    return;
  }

  await page.addInitScript(() => {
    let clipboardText = "";

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: async () => clipboardText,
        writeText: async (text: string) => {
          clipboardText = String(text);
        },
      },
    });
  });
}

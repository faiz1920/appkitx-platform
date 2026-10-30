import type { Locator, Page } from "@playwright/test";

/*
 * Playwright WebKit follows Safari's default macOS keyboard setting, where
 * Tab visits text controls but skips links and buttons. Safari's Option+Tab
 * (Alt+Tab in Playwright) traverses every focusable control, so use it to
 * exercise the real keyboard order in WebKit instead of changing focus
 * programmatically or asserting a reduced order. Chromium and Firefox retain
 * their native Tab behavior.
 */
export async function pressTab(
  page: Page,
  browserName: string,
  { shift = false }: { shift?: boolean } = {},
): Promise<void> {
  const key =
    browserName === "webkit"
      ? shift
        ? "Shift+Alt+Tab"
        : "Alt+Tab"
      : shift
        ? "Shift+Tab"
        : "Tab";

  await page.keyboard.press(key);
}

export async function tabTo(
  page: Page,
  browserName: string,
  target: Locator,
  max = 20,
): Promise<void> {
  for (let attempt = 0; attempt < max; attempt += 1) {
    await pressTab(page, browserName);
    const reached = await target.evaluate(
      (element) => element === document.activeElement,
    );
    if (reached) return;
  }

  throw new Error("Did not reach the target element via Tab");
}

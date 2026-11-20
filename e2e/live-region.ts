import type { Page } from "@playwright/test";

/*
 * Count DOM mutations inside one live region. Tests use this to prove that a
 * repeated identical error does not rewrite the region and trigger another
 * announcement. Only one region is observed at a time per page.
 */

interface ObserverWindow extends Window {
  __liveRegionState?: { count: number };
  __liveRegionObserver?: MutationObserver;
}

export async function observeLiveRegion(
  page: Page,
  selector: string,
): Promise<void> {
  await page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector);
    if (!element) throw new Error(`Live region not found: ${targetSelector}`);

    const state = { count: 0 };
    const observer = new MutationObserver((records) => {
      state.count += records.length;
    });
    observer.observe(element, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    const target = window as ObserverWindow;
    target.__liveRegionState = state;
    target.__liveRegionObserver = observer;
  }, selector);
}

export async function stopObservingLiveRegion(page: Page): Promise<number> {
  return page.evaluate(() => {
    const target = window as ObserverWindow;
    target.__liveRegionObserver?.disconnect();
    return target.__liveRegionState?.count ?? 0;
  });
}

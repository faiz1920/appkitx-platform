/*
 * Key/value storage adapters for saved builds (M10.5).
 *
 * The repository depends on this tiny synchronous interface rather than on
 * `window.localStorage` directly, so domain tests run without a browser and
 * the persistence mechanism can be replaced later. Browser storage access is
 * probed because it throws in private modes, sandboxed frames and when the
 * user has disabled site data.
 */

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface MemoryStorage extends KeyValueStorage {
  /** Test helper: inspect the raw stored value. */
  snapshot(): Record<string, string>;
}

export function createMemoryStorage(
  initial: Record<string, string> = {},
): MemoryStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    snapshot() {
      return Object.fromEntries(values);
    },
  };
}

/**
 * Return `localStorage` only when it is usable. A null result becomes a
 * handled "storage unavailable" error in the repository; it never crashes the
 * builder and never silently falls back to a different persistence location.
 */
export function createBrowserStorage(): KeyValueStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const probeKey = "appkitx.pc-builder.storage-probe";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

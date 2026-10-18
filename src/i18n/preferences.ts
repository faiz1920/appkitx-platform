import { defaultLocale, type LocaleCode } from "./config";
import { nonDefaultLocales, translatedPagePaths } from "./routing";

/*
 * Client-side locale preferences (audit M4).
 *
 * The only client-side navigation on the site is the pre-paint script built
 * here; there are no HTTP redirects and no server-side Accept-Language
 * handling anywhere.
 *
 * - An explicit choice made through the language switcher (stored under
 *   PREFERENCE_STORAGE_KEY) is honored on later visits, in both directions.
 * - Browser-language detection ships DISABLED (AUTO_DETECT_ENABLED = false):
 *   a first visit never navigates, regardless of the browser's language.
 *   Flipping the single flag to true enables it — and only then does the
 *   built script contain any detection code. Enable it only after the SEO
 *   review recorded in the README.
 * - Navigation never leaves the translated page set, and the script is
 *   skipped entirely on noindex pages (the 404).
 */

export const PREFERENCE_STORAGE_KEY = "appkitx.locale";

/** Single kill switch for browser-language detection. */
export const AUTO_DETECT_ENABLED = false;

export interface LocalePreferenceConfig {
  storageKey: string;
  defaultLocale: LocaleCode;
  nonDefaultLocales: readonly LocaleCode[];
  translatedPaths: readonly string[];
  detectBrowserLanguage: boolean;
}

export interface LocalePreferencePageConfig extends LocalePreferenceConfig {
  currentLocale: LocaleCode;
}

export function localePreferenceConfig(): LocalePreferenceConfig {
  return {
    storageKey: PREFERENCE_STORAGE_KEY,
    defaultLocale,
    nonDefaultLocales: nonDefaultLocales(),
    translatedPaths: translatedPagePaths(),
    detectBrowserLanguage: AUTO_DETECT_ENABLED,
  };
}

/*
 * Build the self-contained pre-paint script for one page. The output is a
 * plain IIFE string with an embedded constants-only JSON payload — no
 * imports, no bundler, safe to inline into <head> with is:inline so it runs
 * before first paint (no layout flash on a remembered-choice navigation).
 */
export function buildLocalePreferenceScript(
  config: LocalePreferencePageConfig,
): string {
  const serialized = JSON.stringify(config).replace(/</g, "\\u003c");

  const detection = config.detectBrowserLanguage
    ? `
  if (config.currentLocale !== config.defaultLocale) return;
  var languages = [];
  if (Array.isArray(navigator.languages)) languages = navigator.languages.slice();
  else if (navigator.language) languages = [navigator.language];
  for (var i = 0; i < languages.length; i++) {
    var tag = String(languages[i]).toLowerCase();
    var base = tag.split("-")[0];
    for (var j = 0; j < config.nonDefaultLocales.length; j++) {
      var code = config.nonDefaultLocales[j].toLowerCase();
      if (tag === code || base === code) {
        navigateTo(config.nonDefaultLocales[j]);
        return;
      }
    }
  }`
    : "";

  return `(function () {
  var config = ${serialized};
  var supported = [config.defaultLocale].concat(config.nonDefaultLocales);
  function normalize(pathname) {
    var segments = pathname.split("/").filter(function (segment) { return segment !== ""; });
    if (segments.length > 0 && config.nonDefaultLocales.indexOf(segments[0]) !== -1) {
      segments.shift();
    }
    return "/" + segments.join("/");
  }
  function navigateTo(targetLocale) {
    if (targetLocale === config.currentLocale) return;
    var basePath = normalize(window.location.pathname);
    if (config.translatedPaths.indexOf(basePath) === -1) return;
    var target =
      targetLocale === config.defaultLocale
        ? basePath
        : basePath === "/"
          ? "/" + targetLocale + "/"
          : "/" + targetLocale + basePath;
    window.location.replace(target);
  }
  var stored = null;
  try {
    stored = window.localStorage.getItem(config.storageKey);
    if (stored !== null && supported.indexOf(stored) === -1) {
      window.localStorage.removeItem(config.storageKey);
      stored = null;
    }
  } catch (error) {
    stored = null;
  }
  if (stored !== null) {
    navigateTo(stored);
    return;
  }${detection}
})();`;
}

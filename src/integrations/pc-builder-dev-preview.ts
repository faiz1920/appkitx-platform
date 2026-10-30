import type { AstroIntegration } from "astro";

/*
 * Mounts the PC Builder development preview during `astro dev` only.
 *
 * Production safety: the route is never injected for `astro build`, so no
 * HTML is emitted, no sitemap entry is created and no navigation, canonical,
 * hreflang or CSP configuration changes. The page is additionally marked
 * noindex by BaseLayout. Remove this integration (and src/dev/pc-builder)
 * when the builder is approved for public release in a later milestone.
 */
export default function pcBuilderDevPreview(): AstroIntegration {
  return {
    name: "appkitx-pc-builder-dev-preview",
    hooks: {
      "astro:config:setup": ({ command, injectRoute, logger }) => {
        if (command !== "dev") return;
        injectRoute({
          pattern: "/pc-builder",
          entrypoint: "./src/dev/pc-builder/PcBuilderPage.astro",
        });
        logger.info(
          "Mounted the PC Builder development preview at /pc-builder (development only).",
        );
      },
    },
  };
}

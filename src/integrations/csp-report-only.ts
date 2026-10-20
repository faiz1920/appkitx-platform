import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import {
  buildInlineScriptInventory,
  type HtmlDocument,
} from "../lib/csp-inline-hashes";
import {
  buildCspReportOnlyPolicy,
  updateCspReportOnlyHeader,
} from "../lib/csp-report-only";

function collectHtmlFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(path));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files.sort();
}

function displayPath(root: string, path: string): string {
  return relative(root, path).split(sep).join("/");
}

export default function cspReportOnly(): AstroIntegration {
  return {
    name: "appkitx-csp-report-only",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const headersPath = join(root, "_headers");
        let headersContent: string;

        try {
          headersContent = readFileSync(headersPath, "utf8");
        } catch {
          throw new Error(
            `CSP report-only generation failed: ${headersPath} was not found. Ensure public/_headers is copied into the build output before astro:build:done.`,
          );
        }

        const files = collectHtmlFiles(root);

        if (files.length === 0) {
          throw new Error(
            `CSP report-only generation failed: no HTML files were found under ${root}.`,
          );
        }

        const documents: HtmlDocument[] = files.map((path) => ({
          file: displayPath(root, path),
          html: readFileSync(path, "utf8"),
        }));
        const inventory = buildInlineScriptInventory(root, documents);

        if (inventory.uniqueExecutable.length === 0) {
          throw new Error(
            "CSP report-only generation failed: no executable inline scripts were found.",
          );
        }

        const policy = buildCspReportOnlyPolicy(inventory);
        const updated = updateCspReportOnlyHeader(headersContent, policy);

        try {
          writeFileSync(headersPath, updated, "utf8");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          throw new Error(
            `CSP report-only generation failed: could not write ${headersPath}: ${message}`,
          );
        }

        logger.info(
          `Generated Content-Security-Policy-Report-Only with ${inventory.uniqueExecutable.length} inline hashes in dist/_headers.`,
        );
      },
    },
  };
}

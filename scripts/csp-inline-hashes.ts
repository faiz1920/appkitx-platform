import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  buildInlineScriptInventory,
  formatInventoryReport,
  type HtmlDocument,
} from "../src/lib/csp-inline-hashes.ts";

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

function displayPath(path: string): string {
  return relative(process.cwd(), path).split(sep).join("/");
}

function run(): void {
  const root = process.argv[2] ?? "dist";
  let files: string[];

  try {
    files = collectHtmlFiles(root);
  } catch {
    throw new Error(
      `Build directory not found: ${root}. Run "npm run build" first.`,
    );
  }

  if (files.length === 0) {
    throw new Error(`No HTML files found under ${root}.`);
  }

  const documents: HtmlDocument[] = files.map((path) => ({
    file: displayPath(path),
    html: readFileSync(path, "utf8"),
  }));
  const inventory = buildInlineScriptInventory(root, documents);

  process.stdout.write(formatInventoryReport(inventory));
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`CSP inline-script inventory failed: ${message}`);
  process.exitCode = 1;
}

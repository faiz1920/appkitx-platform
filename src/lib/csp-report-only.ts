import type { InlineScriptInventory } from "./csp-inline-hashes";

export const CSP_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only";
export const CSP_REPORT_ONLY_MAX_LINE_LENGTH = 2000;
export const CSP_REPORT_ONLY_RUM_SCRIPT_HOST =
  "https://static.cloudflareinsights.com";
export const CSP_REPORT_ONLY_RUM_FALLBACK_HOST =
  "https://cloudflareinsights.com";

const HASH_PATTERN = /^sha256-[A-Za-z0-9+/]+={0,2}$/;

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function formatHeaderLine(policy: string): string {
  return `  ${CSP_REPORT_ONLY_HEADER}: ${policy}`;
}

export function buildCspReportOnlyPolicy(
  inventory: InlineScriptInventory,
): string {
  if (inventory.uniqueExecutable.length === 0) {
    throw new Error(
      "Cannot build the CSP report-only policy: no executable inline scripts were found.",
    );
  }

  const hashes = [...inventory.uniqueExecutable]
    .sort((left, right) => compare(left.hash, right.hash))
    .map((entry) => {
      if (!HASH_PATTERN.test(entry.hash)) {
        throw new Error(
          `Cannot build the CSP report-only policy: invalid hash "${entry.hash}".`,
        );
      }

      return `'${entry.hash}'`;
    });

  const policy = [
    "default-src 'none'",
    `script-src 'self' ${CSP_REPORT_ONLY_RUM_SCRIPT_HOST} ${hashes.join(" ")}`,
    "style-src 'self'",
    "img-src 'self'",
    "font-src 'self' data:",
    `connect-src 'self' ${CSP_REPORT_ONLY_RUM_FALLBACK_HOST}`,
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "worker-src 'none'",
  ].join("; ");

  validatePolicy(policy);

  return policy;
}

export function updateCspReportOnlyHeader(
  headersContent: string,
  policy: string,
): string {
  validatePolicy(policy);

  const eol = headersContent.includes("\r\n") ? "\r\n" : "\n";
  const lines = headersContent.split(/\r?\n/);
  const globalBlocks = lines
    .map((line, index) => ({ line, index }))
    .filter(
      ({ line }) =>
        line === line.trimStart() &&
        line.trim() === "/*" &&
        !line.trimStart().startsWith("#"),
    );

  if (globalBlocks.length === 0) {
    throw new Error(
      'Cannot update _headers: the global "/*" block was not found.',
    );
  }

  if (globalBlocks.length > 1) {
    throw new Error(
      'Cannot update _headers: multiple global "/*" blocks were found.',
    );
  }

  const globalIndex = globalBlocks[0].index;
  const blockEnd = findBlockEnd(lines, globalIndex);
  const blockHeaderIndexes: number[] = [];
  const cspIndexes: number[] = [];

  for (let index = globalIndex + 1; index < blockEnd; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    if (line.startsWith(" ") || line.startsWith("\t")) {
      blockHeaderIndexes.push(index);
    }

    if (
      trimmed
        .toLowerCase()
        .startsWith(`${CSP_REPORT_ONLY_HEADER.toLowerCase()}:`)
    ) {
      cspIndexes.push(index);
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    if (index >= globalIndex && index < blockEnd) {
      continue;
    }

    const lower = lines[index].trim().toLowerCase();

    if (lower.startsWith(`${CSP_REPORT_ONLY_HEADER.toLowerCase()}:`)) {
      throw new Error(
        `Cannot update _headers: ${CSP_REPORT_ONLY_HEADER} exists outside the global "/*" block.`,
      );
    }
  }

  for (const line of lines) {
    if (line.trim().toLowerCase().startsWith("content-security-policy:")) {
      throw new Error(
        "Cannot update _headers: an enforcing Content-Security-Policy header is present.",
      );
    }
  }

  const headerLine = formatHeaderLine(policy);
  let updated: string[];

  if (cspIndexes.length === 1) {
    updated = [...lines];
    updated[cspIndexes[0]] = headerLine;
  } else if (cspIndexes.length > 1) {
    updated = lines.filter((_, index) => !cspIndexes.includes(index));
    updated.splice(cspIndexes[0], 0, headerLine);
  } else {
    const insertionIndex =
      blockHeaderIndexes.length > 0
        ? blockHeaderIndexes[blockHeaderIndexes.length - 1] + 1
        : globalIndex + 1;
    updated = [...lines];
    updated.splice(insertionIndex, 0, headerLine);
  }

  const cspCount = updated.filter((line) =>
    line
      .trim()
      .toLowerCase()
      .startsWith(`${CSP_REPORT_ONLY_HEADER.toLowerCase()}:`),
  ).length;

  if (cspCount !== 1) {
    throw new Error(
      `Cannot update _headers: expected exactly one ${CSP_REPORT_ONLY_HEADER} header, found ${cspCount}.`,
    );
  }

  return updated.join(eol);
}

function findBlockEnd(lines: string[], globalIndex: number): number {
  for (let index = globalIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.trim() === "") {
      continue;
    }

    if (line.trimStart().startsWith("#")) {
      continue;
    }

    if (!line.startsWith(" ") && !line.startsWith("\t")) {
      return index;
    }
  }

  return lines.length;
}

function validatePolicy(policy: string): void {
  if (policy.trim() === "") {
    throw new Error("Cannot use an empty CSP report-only policy.");
  }

  if (/[\r\n]/.test(policy)) {
    throw new Error(
      "Cannot use a CSP report-only policy containing a line break.",
    );
  }

  for (const forbidden of [
    "'unsafe-inline'",
    "'unsafe-eval'",
    "'strict-dynamic'",
    "report-uri",
    "report-to",
  ]) {
    if (policy.includes(forbidden)) {
      throw new Error(
        `Cannot use a CSP report-only policy containing ${forbidden}.`,
      );
    }
  }

  if (formatHeaderLine(policy).length > CSP_REPORT_ONLY_MAX_LINE_LENGTH) {
    throw new Error(
      `Cannot use a CSP report-only header longer than ${CSP_REPORT_ONLY_MAX_LINE_LENGTH} characters.`,
    );
  }
}

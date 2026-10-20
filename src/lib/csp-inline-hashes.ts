import { createHash } from "node:crypto";

export type ScriptKind = "executable" | "data" | "external";

export interface HtmlDocument {
  file: string;
  html: string;
}

export interface ScriptElement {
  index: number;
  type: string;
  src?: string;
  body: string;
  kind: ScriptKind;
  bytes: number;
  hash?: string;
}

export interface InventoryEntry {
  file: string;
  index: number;
  type: string;
  kind: ScriptKind;
  bytes: number;
  hash?: string;
}

export interface UniqueExecutableBody {
  hash: string;
  type: string;
  bytes: number;
  occurrences: number;
  files: string[];
}

export interface InlineScriptInventory {
  root: string;
  htmlFiles: number;
  entries: InventoryEntry[];
  executable: InventoryEntry[];
  data: InventoryEntry[];
  external: InventoryEntry[];
  uniqueExecutable: UniqueExecutableBody[];
}

export class ScriptParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScriptParseError";
  }
}

const JAVASCRIPT_TYPES = new Set([
  "application/ecmascript",
  "application/javascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/jscript",
]);

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isScriptOpenAt(html: string, offset: number): boolean {
  if (html.slice(offset, offset + 7).toLowerCase() !== "<script") {
    return false;
  }

  const next = html[offset + 7];
  return next === undefined || /[\s/>]/.test(next);
}

function findStartTagEnd(html: string, from: number, file: string): number {
  let quote: string | undefined;

  for (let index = from; index < html.length; index += 1) {
    const character = html[index];

    if (quote !== undefined) {
      if (character === quote) {
        quote = undefined;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === ">") {
      return index;
    }
  }

  throw new ScriptParseError(`Unterminated <script> start tag in ${file}.`);
}

function parseAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const pattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const name = match[1]?.toLowerCase();

    if (!name || attributes.has(name)) {
      continue;
    }

    attributes.set(name, match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attributes;
}

function classifyScript(
  typeValue: string,
  src: string | undefined,
): { kind: ScriptKind; type: string } {
  const normalized = typeValue.trim().toLowerCase();
  const mime = normalized.split(";")[0]?.trim() ?? "";
  const type = mime === "" ? "classic" : mime;

  if (src !== undefined) {
    return { kind: "external", type };
  }

  if (mime === "" || mime === "module" || JAVASCRIPT_TYPES.has(mime)) {
    return { kind: "executable", type };
  }

  return { kind: "data", type };
}

export function computeCspHash(body: string): string {
  return `sha256-${createHash("sha256").update(body, "utf8").digest("base64")}`;
}

export function parseScriptElements(
  html: string,
  file: string,
): ScriptElement[] {
  const scripts: ScriptElement[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < html.length) {
    const offset = html.indexOf("<", cursor);

    if (offset === -1) {
      break;
    }

    if (html.startsWith("<!--", offset)) {
      const commentEnd = html.indexOf("-->", offset + 4);

      if (commentEnd === -1) {
        throw new ScriptParseError(`Unterminated HTML comment in ${file}.`);
      }

      cursor = commentEnd + 3;
      continue;
    }

    if (!isScriptOpenAt(html, offset)) {
      cursor = offset + 1;
      continue;
    }

    const startTagEnd = findStartTagEnd(html, offset + 7, file);
    const attributes = parseAttributes(html.slice(offset + 7, startTagEnd));
    const bodyStart = startTagEnd + 1;
    const closing = /<\/script\s*>/gi;
    closing.lastIndex = bodyStart;
    const closingMatch = closing.exec(html);

    if (closingMatch === null) {
      throw new ScriptParseError(`Unterminated <script> element in ${file}.`);
    }

    const body = html.slice(bodyStart, closingMatch.index);
    const src = attributes.get("src");
    const classified = classifyScript(attributes.get("type") ?? "", src);
    const bytes = Buffer.byteLength(body, "utf8");
    const hash =
      classified.kind === "executable" ? computeCspHash(body) : undefined;

    index += 1;
    scripts.push({
      index,
      type: classified.type,
      src,
      body,
      kind: classified.kind,
      bytes,
      hash,
    });

    cursor = closingMatch.index + closingMatch[0].length;
  }

  return scripts;
}

function toEntry(file: string, script: ScriptElement): InventoryEntry {
  return {
    file,
    index: script.index,
    type: script.type,
    kind: script.kind,
    bytes: script.bytes,
    hash: script.hash,
  };
}

export function buildInlineScriptInventory(
  root: string,
  documents: readonly HtmlDocument[],
): InlineScriptInventory {
  const orderedDocuments = [...documents].sort((left, right) =>
    compare(left.file, right.file),
  );
  const entries: InventoryEntry[] = [];

  for (const document of orderedDocuments) {
    for (const script of parseScriptElements(document.html, document.file)) {
      entries.push(toEntry(document.file, script));
    }
  }

  entries.sort(
    (left, right) => compare(left.file, right.file) || left.index - right.index,
  );

  const executable = entries.filter((entry) => entry.kind === "executable");
  const data = entries.filter((entry) => entry.kind === "data");
  const external = entries.filter((entry) => entry.kind === "external");
  const uniqueBodies = new Map<
    string,
    { type: string; bytes: number; occurrences: number; files: Set<string> }
  >();

  for (const entry of executable) {
    if (entry.hash === undefined) {
      continue;
    }

    const existing = uniqueBodies.get(entry.hash);

    if (existing !== undefined) {
      existing.occurrences += 1;
      existing.files.add(entry.file);
      continue;
    }

    uniqueBodies.set(entry.hash, {
      type: entry.type,
      bytes: entry.bytes,
      occurrences: 1,
      files: new Set([entry.file]),
    });
  }

  const uniqueExecutable = [...uniqueBodies.entries()]
    .map(([hash, body]) => ({
      hash,
      type: body.type,
      bytes: body.bytes,
      occurrences: body.occurrences,
      files: [...body.files].sort(compare),
    }))
    .sort((left, right) => compare(left.hash, right.hash));

  return {
    root,
    htmlFiles: documents.length,
    entries,
    executable,
    data,
    external,
    uniqueExecutable,
  };
}

function summarizeData(entries: readonly InventoryEntry[]): string[] {
  const summary = new Map<
    string,
    { occurrences: number; files: Set<string> }
  >();

  for (const entry of entries) {
    const existing = summary.get(entry.type);

    if (existing !== undefined) {
      existing.occurrences += 1;
      existing.files.add(entry.file);
      continue;
    }

    summary.set(entry.type, {
      occurrences: 1,
      files: new Set([entry.file]),
    });
  }

  return [...summary.entries()]
    .sort(([left], [right]) => compare(left, right))
    .map(
      ([type, values]) =>
        `${type}\t${values.occurrences}\t${values.files.size}`,
    );
}

export function formatInventoryReport(
  inventory: InlineScriptInventory,
): string {
  const lines = [
    "CSP inline executable script inventory",
    `Root: ${inventory.root}`,
    `HTML files: ${inventory.htmlFiles}`,
    `Inline executable scripts: ${inventory.executable.length} occurrences`,
    `Unique executable bodies: ${inventory.uniqueExecutable.length}`,
    `Inline data scripts: ${inventory.data.length}`,
    `External scripts (excluded): ${inventory.external.length}`,
    "",
    "INLINE EXECUTABLE OCCURRENCES",
    "FILE\tINDEX\tTYPE\tBYTES\tHASH",
  ];

  for (const entry of inventory.executable) {
    lines.push(
      `${entry.file}\t${entry.index}\t${entry.type}\t${entry.bytes}\t${entry.hash ?? ""}`,
    );
  }

  lines.push(
    "",
    "UNIQUE EXECUTABLE BODIES",
    "HASH\tTYPE\tBYTES\tOCCURRENCES\tFILES",
  );

  for (const entry of inventory.uniqueExecutable) {
    lines.push(
      `${entry.hash}\t${entry.type}\t${entry.bytes}\t${entry.occurrences}\t${entry.files.join(", ")}`,
    );
  }

  lines.push("", "DATA SCRIPT SUMMARY", "TYPE\tOCCURRENCES\tFILES");
  const dataSummary = summarizeData(inventory.data);

  if (dataSummary.length === 0) {
    lines.push("(none)");
  } else {
    lines.push(...dataSummary);
  }

  lines.push(
    "",
    "External scripts are excluded from this inventory. Production-only Cloudflare RUM is injected outside the repository build and must be tested separately.",
  );

  return `${lines.join("\n")}\n`;
}

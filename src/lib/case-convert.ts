/*
 * Pure case conversion for the Case Converter.
 *
 * Text modes (upper, lower, title, sentence, capitalized, alternating)
 * preserve whitespace, punctuation, and line breaks. Identifier modes
 * (camel, pascal, snake, kebab, constant) tokenize the input and join the
 * tokens, so whitespace and punctuation are intentionally removed.
 *
 * Title Case is a pragmatic English + Spanish hybrid: first and last words of
 * each line, and the first word after a colon or sentence-ending punctuation,
 * are always capitalized; a short list of articles, conjunctions, and
 * prepositions stays lowercase in the middle. It does not claim to match AP,
 * APA, Chicago, or MLA exactly.
 *
 * Casing follows the JavaScript default Unicode mappings, which are
 * locale-independent. Scripts without case (for example Devanagari, Chinese,
 * and Arabic) are unchanged by the text case modes; identifier modes still
 * join their words because those modes remove separators.
 */

export const CASE_MODES = [
  "uppercase",
  "lowercase",
  "title",
  "sentence",
  "capitalized",
  "camel",
  "pascal",
  "snake",
  "kebab",
  "constant",
  "alternating",
] as const;

export type CaseMode = (typeof CASE_MODES)[number];

/*
 * Articles, conjunctions, and short prepositions from English and Spanish.
 * The list is deliberately shared: the text's language is not known, and
 * both languages use short function words in titles.
 */
const MINOR_WORDS = new Set([
  // English
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "per",
  "so",
  "the",
  "to",
  "up",
  "via",
  "vs",
  "yet",
  // Spanish
  "al",
  "ante",
  "bajo",
  "con",
  "contra",
  "de",
  "del",
  "desde",
  "durante",
  "e",
  "el",
  "en",
  "entre",
  "hacia",
  "hasta",
  "la",
  "las",
  "lo",
  "los",
  "mediante",
  "ni",
  "o",
  "para",
  "por",
  "según",
  "sin",
  "sobre",
  "tras",
  "u",
  "un",
  "una",
  "unas",
  "unos",
  "y",
]);

const WORD_SPAN_PATTERN = /[\p{L}\p{M}\p{N}]+(?:['’\-‐‑][\p{L}\p{M}\p{N}]+)*/gu;

const HYPHEN_PATTERN = /[-‐‑]/;
const HYPHEN_SPLIT_PATTERN = /([-‐‑])/;

const SENTENCE_TERMINALS = new Set([
  ".",
  "!",
  "?",
  "…",
  "。",
  "！",
  "？",
  "।",
  "॥",
  "۔",
]);

const SENTENCE_CLOSERS = new Set(['"', "'", "”", "’", "»", ")", "]"]);

/* CJK full stops are boundaries without a following space. */
const CJK_SENTENCE_TERMINALS = new Set(["。", "！", "？"]);

const SENTENCE_BOUNDARY_BEFORE_PATTERN = /[.!?…:。！？।॥۔—–]/u;

interface WordSpan {
  start: number;
  end: number;
}

function wordSpans(text: string): WordSpan[] {
  const spans: WordSpan[] = [];
  for (const match of text.matchAll(WORD_SPAN_PATTERN)) {
    const start = match.index;
    if (start === undefined) continue;
    spans.push({ start, end: start + match[0].length });
  }
  return spans;
}

function capitalizeFirstLetter(value: string): string {
  const lowered = value.toLowerCase();

  /* Digit-led ordinals are normalized as a unit, not as "1St" or "42Nd". */
  if (/^\p{N}+(?:st|nd|rd|th)$/u.test(lowered)) {
    return lowered;
  }

  const [first = ""] = lowered;
  if (!isCasedCharacter(first)) {
    /*
     * Never capitalize a later letter just because it follows leading digits
     * or symbols. Tokens such as "3D" and "100K" keep their existing case;
     * first-character letters take the normal path below.
     */
    return value;
  }

  return lowered.replace(/^\p{L}/u, (letter) => letter.toUpperCase());
}

function capitalizeHyphenated(value: string): string {
  return value
    .split(HYPHEN_SPLIT_PATTERN)
    .map((part) =>
      HYPHEN_PATTERN.test(part) ? part : capitalizeFirstLetter(part),
    )
    .join("");
}

function isMinorWord(value: string): boolean {
  return !HYPHEN_PATTERN.test(value) && MINOR_WORDS.has(value.toLowerCase());
}

function toTitleCase(text: string): string {
  const spans = wordSpans(text);
  if (spans.length === 0) return text;

  let result = "";
  let cursor = 0;

  /*
   * Walk the line boundaries in step with the sorted word spans. Each newline
   * is located once, instead of scanning to the start and end of the current
   * line for every word.
   */
  let lineStart = 0;
  let lineEnd = text.indexOf("\n");
  if (lineEnd < 0) lineEnd = text.length;
  let lineHasWord = false;

  spans.forEach((span, index) => {
    while (span.start > lineEnd) {
      lineStart = lineEnd + 1;
      const nextNewline = text.indexOf("\n", lineStart);
      lineEnd = nextNewline < 0 ? text.length : nextNewline;
      lineHasWord = false;
    }

    result += text.slice(cursor, span.start);
    const word = text.slice(span.start, span.end);

    /*
     * Only the first word of a line can be first on the line; once a word has
     * been seen, the prefix necessarily contains non-whitespace. The same
     * applies to the last word, so the trailing slice is checked once per
     * line rather than once per word.
     */
    const isFirstOnLine =
      !lineHasWord && !text.slice(lineStart, span.start).trim();

    const nextSpan = spans[index + 1];
    const isLastOnLine =
      (!nextSpan || nextSpan.start > lineEnd) &&
      !text.slice(span.end, lineEnd).trim();

    const before = text.slice(cursor, span.start);

    const forced =
      !index ||
      index === spans.length - 1 ||
      isFirstOnLine ||
      isLastOnLine ||
      SENTENCE_BOUNDARY_BEFORE_PATTERN.test(before);

    result +=
      forced || !isMinorWord(word)
        ? capitalizeHyphenated(word)
        : word.toLowerCase();
    cursor = span.end;
    lineHasWord = true;
  });

  return result + text.slice(cursor);
}

function toCapitalizedCase(text: string): string {
  const spans = wordSpans(text);
  if (spans.length === 0) return text;

  let result = "";
  let cursor = 0;

  for (const span of spans) {
    result += text.slice(cursor, span.start);
    result += capitalizeHyphenated(text.slice(span.start, span.end));
    cursor = span.end;
  }

  return result + text.slice(cursor);
}

function isCasedCharacter(character: string): boolean {
  return character.toLowerCase() !== character.toUpperCase();
}

function toSentenceCase(text: string): string {
  const characters = Array.from(text.toLowerCase());
  let result = "";
  let startOfSentence = true;

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index] ?? "";

    if (character === "\n" || character === "\r") {
      result += character;
      startOfSentence = true;
      continue;
    }

    if (startOfSentence) {
      if (isCasedCharacter(character)) {
        result += character.toUpperCase();
        startOfSentence = false;
        continue;
      }
      if (/[\p{L}\p{M}\p{N}]/u.test(character)) {
        result += character;
        startOfSentence = false;
        continue;
      }
      result += character;
      continue;
    }

    result += character;

    if (!SENTENCE_TERMINALS.has(character)) continue;

    let next = index + 1;
    while (
      next < characters.length &&
      (SENTENCE_TERMINALS.has(characters[next] ?? "") ||
        SENTENCE_CLOSERS.has(characters[next] ?? ""))
    ) {
      next += 1;
    }

    const following = characters[next];
    if (
      CJK_SENTENCE_TERMINALS.has(character) ||
      following === undefined ||
      /\s/u.test(following)
    ) {
      startOfSentence = true;
    }
  }

  return result;
}

function toAlternatingCase(text: string): string {
  let uppercase = false;
  let result = "";

  for (const character of text) {
    if (!isCasedCharacter(character)) {
      result += character;
      continue;
    }

    result += uppercase ? character.toUpperCase() : character.toLowerCase();
    uppercase = !uppercase;
  }

  return result;
}

function identifierTokens(text: string): string[] {
  const withoutApostrophes = text.replace(/['’]/g, "");
  const withBoundaries = withoutApostrophes
    /*
     * Do not split a digit from an uppercase run that starts an ordinal
     * suffix ("1ST" is one token); the acronym pass handles real boundaries.
     */
    .replace(/([\p{Ll}\p{N}])(\p{Lu})(?!\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2");

  return withBoundaries
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((token) => token !== "");
}

function toCamelCase(tokens: readonly string[]): string {
  return tokens
    .map((token, index) =>
      index === 0 ? token.toLowerCase() : capitalizeFirstLetter(token),
    )
    .join("");
}

function toPascalCase(tokens: readonly string[]): string {
  return tokens.map(capitalizeFirstLetter).join("");
}

function toSnakeCase(tokens: readonly string[]): string {
  return tokens.map((token) => token.toLowerCase()).join("_");
}

function toKebabCase(tokens: readonly string[]): string {
  return tokens.map((token) => token.toLowerCase()).join("-");
}

function toConstantCase(tokens: readonly string[]): string {
  return tokens.map((token) => token.toUpperCase()).join("_");
}

export function convertCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "title":
      return toTitleCase(text);
    case "sentence":
      return toSentenceCase(text);
    case "capitalized":
      return toCapitalizedCase(text);
    case "alternating":
      return toAlternatingCase(text);
    default: {
      const tokens = identifierTokens(text);
      if (tokens.length === 0) return "";

      switch (mode) {
        case "camel":
          return toCamelCase(tokens);
        case "pascal":
          return toPascalCase(tokens);
        case "snake":
          return toSnakeCase(tokens);
        case "kebab":
          return toKebabCase(tokens);
        case "constant":
          return toConstantCase(tokens);
      }
    }
  }
}

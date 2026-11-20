/*
 * Pure text statistics for the Word Counter.
 *
 * Counting rules:
 * - Characters are user-perceived characters (grapheme clusters), not UTF-16
 *   code units, so emoji and combining marks count once.
 * - Words are runs of Unicode letters, combining marks, digits, and numbers.
 *   Internal apostrophes and decimal separators stay inside a word; hyphens
 *   split words. Punctuation and emoji are never words; numbers are.
 * - Sentences are counted per paragraph. Latin/Indic endings need following
 *   whitespace or the paragraph end; CJK 。！？ are boundaries on their own.
 *   Decimal points, URLs, and other punctuation inside a token do not split.
 * - Paragraphs are blocks separated by a blank line and containing at least
 *   one word-like character. Single line breaks stay inside a paragraph.
 * - Lines are non-empty lines.
 * - Reading and speaking times are estimates at 200 and 130 words per minute,
 *   rounded to the nearest second with a one-second minimum for non-empty text.
 *
 * Nothing here touches the network, the DOM, or browser storage.
 */

export interface TextStatistics {
  /** Grapheme clusters in the full text, including whitespace. */
  characters: number;
  /** Grapheme clusters excluding whitespace. */
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  /** Non-empty lines. */
  lines: number;
  readingSeconds: number;
  speakingSeconds: number;
}

export interface DurationParts {
  minutes: number;
  seconds: number;
}

export const READING_WORDS_PER_MINUTE = 200;
export const SPEAKING_WORDS_PER_MINUTE = 130;

const WORD_LIKE_PATTERN = /[\p{L}\p{M}\p{N}]/u;
const WHITESPACE_GRAPHEME_PATTERN = /^\p{White_Space}+$/u;

/*
 * Includes the common sentence ends across Latin, Hispanic, Indic, and CJK
 * text. Latin and Indic endings need following whitespace or the paragraph
 * end so decimals and URLs stay intact; CJK endings are boundaries on their
 * own because those scripts normally do not put a space after a full stop.
 */
const SENTENCE_TERMINAL_PATTERN =
  /(?:[.!?…।॥۔]+["'”’»)\]]*(?=\s|$)|[。！？]+["'”’»)\]]*)/gu;

const WORD_PATTERN =
  /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*(?:[.,][\p{N}]+)*/gu;

const ZERO_WIDTH_JOINER = 0x200d;
const LINE_FEED = 0x0a;

const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("en", { granularity: "grapheme" })
    : null;

function hasWordLikeCharacter(value: string): boolean {
  return WORD_LIKE_PATTERN.test(value);
}

function isRegionalIndicator(codePoint: number): boolean {
  return codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff;
}

function isEmojiModifier(codePoint: number): boolean {
  return codePoint >= 0x1f3fb && codePoint <= 0x1f3ff;
}

function isVariationSelector(codePoint: number): boolean {
  return (
    (codePoint >= 0xfe00 && codePoint <= 0xfe0f) ||
    (codePoint >= 0xe0100 && codePoint <= 0xe01ef)
  );
}

function isTagCharacter(codePoint: number): boolean {
  return codePoint >= 0xe0020 && codePoint <= 0xe007f;
}

function isExtend(codePoint: number, character: string): boolean {
  return (
    /\p{M}/u.test(character) ||
    isVariationSelector(codePoint) ||
    isEmojiModifier(codePoint) ||
    isTagCharacter(codePoint)
  );
}

/**
 * A dependency-free fallback for environments without Intl.Segmenter.
 *
 * It handles the common multi-code-point clusters in the Word Counter:
 * combining marks, variation selectors, emoji modifiers, tag characters,
 * zero-width-joiner sequences, regional-indicator flag pairs, and CRLF.
 * It is not a complete implementation of Unicode grapheme-cluster breaking
 * (for example, Hangul jamo sequences and prepend characters are not
 * composed); the full Intl.Segmenter path remains the primary implementation.
 */
export function fallbackGraphemes(value: string): string[] {
  const clusters: string[] = [];
  let current = "";
  let regionalIndicators = 0;
  let joinNext = false;

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;

    if (current === "") {
      current = character;
      regionalIndicators = isRegionalIndicator(codePoint) ? 1 : 0;
      joinNext = false;
      continue;
    }

    if (current === "\r" && codePoint === LINE_FEED) {
      current += character;
      continue;
    }

    if (isExtend(codePoint, character)) {
      current += character;
      regionalIndicators = 0;
      joinNext = false;
      continue;
    }

    if (codePoint === ZERO_WIDTH_JOINER) {
      current += character;
      regionalIndicators = 0;
      joinNext = true;
      continue;
    }

    if (joinNext) {
      current += character;
      regionalIndicators = isRegionalIndicator(codePoint) ? 1 : 0;
      joinNext = false;
      continue;
    }

    if (isRegionalIndicator(codePoint) && regionalIndicators === 1) {
      current += character;
      regionalIndicators = 2;
      continue;
    }

    clusters.push(current);
    current = character;
    regionalIndicators = isRegionalIndicator(codePoint) ? 1 : 0;
  }

  if (current !== "") clusters.push(current);
  return clusters;
}

function countWords(value: string): number {
  return value.match(WORD_PATTERN)?.length ?? 0;
}

function countCharacters(value: string): {
  characters: number;
  charactersNoSpaces: number;
} {
  let characters = 0;
  let charactersNoSpaces = 0;

  const count = (grapheme: string): void => {
    characters += 1;
    if (!WHITESPACE_GRAPHEME_PATTERN.test(grapheme)) {
      charactersNoSpaces += 1;
    }
  };

  if (graphemeSegmenter) {
    for (const segment of graphemeSegmenter.segment(value)) {
      count(segment.segment);
    }
  } else {
    for (const grapheme of fallbackGraphemes(value)) {
      count(grapheme);
    }
  }

  return { characters, charactersNoSpaces };
}

function countSentencesInParagraph(paragraph: string): number {
  /* Single line breaks stay inside a paragraph and must not split a sentence. */
  const flattened = paragraph.replace(/\s+/gu, " ");
  const marked = flattened.replace(SENTENCE_TERMINAL_PATTERN, "$&\n");
  return marked.split("\n").filter(hasWordLikeCharacter).length;
}

function estimateSeconds(words: number, wordsPerMinute: number): number {
  if (words <= 0) return 0;
  return Math.max(1, Math.round((words / wordsPerMinute) * 60));
}

/** Split a second count into whole minutes and remaining seconds. */
export function durationParts(seconds: number): DurationParts {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return {
    minutes: Math.floor(safe / 60),
    seconds: safe % 60,
  };
}

export function readingSeconds(words: number): number {
  return estimateSeconds(words, READING_WORDS_PER_MINUTE);
}

export function speakingSeconds(words: number): number {
  return estimateSeconds(words, SPEAKING_WORDS_PER_MINUTE);
}

export function countText(value: string): TextStatistics {
  if (value.trim() === "") {
    return {
      characters: value === "" ? 0 : countCharacters(value).characters,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingSeconds: 0,
      speakingSeconds: 0,
    };
  }

  const normalized = value.replace(/\r\n?/g, "\n");
  const { characters, charactersNoSpaces } = countCharacters(value);
  const words = countWords(value);

  const paragraphs = normalized
    .split(/\n[^\S\n]*\n(?:[^\S\n]*\n)*/)
    .filter(hasWordLikeCharacter);

  const sentences = paragraphs.reduce(
    (total, paragraph) => total + countSentencesInParagraph(paragraph),
    0,
  );

  const lines = normalized
    .split("\n")
    .filter((line) => line.trim() !== "").length;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs: paragraphs.length,
    lines,
    readingSeconds: readingSeconds(words),
    speakingSeconds: speakingSeconds(words),
  };
}

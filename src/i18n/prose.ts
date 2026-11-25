/*
 * Inline markers for dictionary prose (audit M4, extended by contextual
 * linking).
 *
 * Prose strings in the dictionary mark inline code with backticks, e.g.
 * "Formula: `(X ÷ 100) × Y`.". splitCodeSpans turns such a string into text
 * and code segments so ProseText can render real <code> nodes from plain
 * data — no HTML strings, no set:html, nothing to escape by hand.
 *
 * Contextual links use a deliberately small Markdown-style form:
 * "the [EMI calculator](/emi-calculator) adds a schedule". splitProseSpans
 * returns link segments whose href is a site-relative path; ProseText
 * localizes that path before rendering an ordinary <a> element.
 *
 * Unmatched or malformed markers are kept as literal text so a translation
 * mistake shows up visibly instead of swallowing the rest of the sentence.
 */

export interface ProseSegment {
  text: string;
  code: boolean;
  /** Site-relative href when this segment is an inline link. */
  href?: string;
}

/** Anchor text: non-empty, no brackets, backticks, or line breaks. */
const LINK_LABEL = /^[^[\]`\n]+$/;

/** Internal target: starts with one slash, no whitespace, parentheses, or protocol. */
const LINK_HREF = /^\/(?!\/)[^\s()]*$/;

export function splitCodeSpans(text: string): ProseSegment[] {
  const segments: ProseSegment[] = [];
  let pending = 0;
  for (let index = 0; index < text.length; index++) {
    if (text[index] !== "`") continue;
    const close = text.indexOf("`", index + 1);
    if (close === -1) break;
    if (index > pending) {
      segments.push({ text: text.slice(pending, index), code: false });
    }
    segments.push({ text: text.slice(index + 1, close), code: true });
    index = close;
    pending = close + 1;
  }
  if (pending < text.length) {
    segments.push({ text: text.slice(pending), code: false });
  }
  return segments;
}

/*
 * Merge adjacent plain-text segments produced while rejecting a malformed
 * marker, so callers see the original sentence as one text run.
 */
function mergeTextSegments(segments: ProseSegment[]): ProseSegment[] {
  const merged: ProseSegment[] = [];
  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (
      last !== undefined &&
      !last.code &&
      last.href === undefined &&
      !segment.code &&
      segment.href === undefined
    ) {
      last.text += segment.text;
      continue;
    }
    merged.push(segment);
  }
  return merged;
}

/*
 * Split prose into text, code, and internal-link segments. Links are parsed
 * first so an anchor can sit next to inline code without either marker
 * interfering with the other.
 */
export function splitProseSpans(text: string): ProseSegment[] {
  const segments: ProseSegment[] = [];
  const pushText = (chunk: string): void => {
    for (const segment of splitCodeSpans(chunk)) segments.push(segment);
  };

  let cursor = 0;
  while (cursor < text.length) {
    const open = text.indexOf("[", cursor);
    if (open === -1) {
      pushText(text.slice(cursor));
      break;
    }
    const closeLabel = text.indexOf("]", open + 1);
    if (closeLabel === -1) {
      pushText(text.slice(cursor));
      break;
    }
    const openHref = closeLabel + 1;
    if (text[openHref] !== "(") {
      pushText(text.slice(cursor, open + 1));
      cursor = open + 1;
      continue;
    }
    const closeHref = text.indexOf(")", openHref + 1);
    if (closeHref === -1) {
      pushText(text.slice(cursor));
      break;
    }
    const label = text.slice(open + 1, closeLabel);
    const href = text.slice(openHref + 1, closeHref);
    if (
      !LINK_LABEL.test(label) ||
      label.trim().length === 0 ||
      !LINK_HREF.test(href)
    ) {
      pushText(text.slice(cursor, open + 1));
      cursor = open + 1;
      continue;
    }
    pushText(text.slice(cursor, open));
    segments.push({ text: label, code: false, href });
    cursor = closeHref + 1;
  }

  return mergeTextSegments(segments);
}

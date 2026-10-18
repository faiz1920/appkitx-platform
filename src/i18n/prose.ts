/*
 * Inline-code marker for dictionary prose (audit M4).
 *
 * Prose strings in the dictionary mark inline code with backticks, e.g.
 * "Formula: `(X ÷ 100) × Y`.". splitCodeSpans turns such a string into text
 * and code segments so ProseText can render real <code> nodes from plain
 * data — no HTML strings, no set:html, nothing to escape by hand.
 *
 * Unmatched backticks are kept as literal text so a translation mistake
 * shows up visibly instead of swallowing the rest of the sentence.
 */

export interface ProseSegment {
  text: string;
  code: boolean;
}

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

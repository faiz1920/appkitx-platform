import { describe, expect, it } from "vitest";
import { dictionaries } from "../src/i18n/config";
import {
  countText,
  durationParts,
  fallbackGraphemes,
  readingSeconds,
  speakingSeconds,
  READING_WORDS_PER_MINUTE,
  SPEAKING_WORDS_PER_MINUTE,
} from "../src/lib/word-count";

describe("countText", () => {
  it("returns zeros for empty input", () => {
    expect(countText("")).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingSeconds: 0,
      speakingSeconds: 0,
    });
  });

  it("counts whitespace as characters but not as words, lines, or paragraphs", () => {
    expect(countText("   ")).toEqual({
      characters: 3,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingSeconds: 0,
      speakingSeconds: 0,
    });
    expect(countText("\n\n").characters).toBe(2);
    expect(countText("\n\n").words).toBe(0);
  });

  it("counts characters, words, sentences, paragraphs, and lines", () => {
    expect(countText("Hello world. This is a test.")).toEqual({
      characters: 28,
      charactersNoSpaces: 23,
      words: 6,
      sentences: 2,
      paragraphs: 1,
      lines: 1,
      readingSeconds: 2,
      speakingSeconds: 3,
    });
  });

  it("handles repeated whitespace and blank-line paragraphs", () => {
    const result = countText("one   two\n\nthree\nfour");
    expect(result.words).toBe(4);
    expect(result.sentences).toBe(2);
    expect(result.paragraphs).toBe(2);
    expect(result.lines).toBe(3);
    expect(result.charactersNoSpaces).toBe(15);
  });

  it("does not count punctuation-only content as words or sentences", () => {
    const result = countText("!!! ... ???");
    expect(result.words).toBe(0);
    expect(result.sentences).toBe(0);
    expect(result.paragraphs).toBe(0);
    expect(result.lines).toBe(1);
    expect(result.characters).toBeGreaterThan(0);
  });

  it("counts numbers and hyphens while keeping apostrophes together", () => {
    expect(countText("well-known don't").words).toBe(3);
    expect(countText("2026 budget 3.14").words).toBe(3);
    expect(countText("2026 budget 3.14").sentences).toBe(1);
  });

  it("does not split decimals or URLs into sentences", () => {
    expect(countText("Version 3.14 is out. Next.").sentences).toBe(2);
    expect(countText("See example.com for details.").sentences).toBe(1);
  });

  it("counts CJK exclamation/question marks and closed CJK sentences", () => {
    expect(countText("你好！你好？你好。").sentences).toBe(3);
    expect(countText("你好。”你好。").sentences).toBe(2);
    expect(countText("Hello。World").sentences).toBe(2);
    expect(countText("你好，世界。").sentences).toBe(1);
  });

  it("counts Spanish accents and inverted punctuation", () => {
    const result = countText("¡Hola! ¿Cómo estás? Bien.");
    expect(result.words).toBe(4);
    expect(result.sentences).toBe(3);
    expect(result.characters).toBe(25);
    expect(result.charactersNoSpaces).toBe(22);
  });

  it("counts Hindi words and danda sentence endings", () => {
    const result = countText("नमस्ते दुनिया। यह एक परीक्षण है।");
    expect(result.words).toBe(6);
    expect(result.sentences).toBe(2);
    expect(result.paragraphs).toBe(1);
    expect(result.characters).toBe(22);
    expect(result.charactersNoSpaces).toBe(17);
  });

  it("treats CJK full stops as sentence boundaries without spaces", () => {
    const result = countText("你好世界。你好。");
    expect(result.words).toBe(2);
    expect(result.sentences).toBe(2);
    expect(countText("你好 世界").words).toBe(2);
  });

  it("counts grapheme clusters for emoji and combining marks", () => {
    const emoji = countText("👍🏽");
    expect(emoji.characters).toBe(1);
    expect(emoji.charactersNoSpaces).toBe(1);
    expect(emoji.words).toBe(0);

    const composed = countText("cafe\u0301");
    expect(composed.characters).toBe(4);
    expect(composed.words).toBe(1);
  });

  it("counts a large pasted document correctly", () => {
    const words = Array.from({ length: 20_000 }, (_, index) => `word${index}`);
    const stats = countText(`${words.join(" ")}. Done.`);

    expect(stats.words).toBe(20_001);
    expect(stats.sentences).toBe(2);
    expect(stats.paragraphs).toBe(1);
    expect(stats.lines).toBe(1);
    expect(stats.characters).toBeGreaterThan(100_000);
  });

  it("counts only non-empty lines", () => {
    expect(countText("one\n two \n").lines).toBe(2);
    expect(countText("one\n two \n").paragraphs).toBe(1);
    expect(countText("one\n\n two \n").paragraphs).toBe(2);
  });

  it("documents the abbreviation limitation", () => {
    /* Abbreviations are treated as sentence ends. */
    expect(countText("Dr. Smith arrived. He waited.").sentences).toBe(3);
  });
});

describe("fallbackGraphemes", () => {
  it("keeps ordinary ASCII characters separate", () => {
    expect(fallbackGraphemes("abc")).toEqual(["a", "b", "c"]);
  });

  it("groups combining marks with their base", () => {
    expect(fallbackGraphemes("cafe\u0301")).toEqual(["c", "a", "f", "e\u0301"]);
  });

  it("groups skin-tone emoji modifiers and ZWJ family sequences", () => {
    expect(fallbackGraphemes("👍🏽")).toEqual(["👍🏽"]);
    expect(fallbackGraphemes("👨‍👩‍👧")).toEqual(["👨‍👩‍👧"]);
  });

  it("pairs regional indicators into flags", () => {
    expect(fallbackGraphemes("🇺🇸")).toEqual(["🇺🇸"]);
    expect(fallbackGraphemes("🇺🇸🇨🇦")).toEqual(["🇺🇸", "🇨🇦"]);
  });

  it("groups variation selectors and keycap sequences", () => {
    expect(fallbackGraphemes("❤️")).toEqual(["❤️"]);
    expect(fallbackGraphemes("1️⃣")).toEqual(["1️⃣"]);
  });

  it("groups tag sequences and CRLF pairs", () => {
    expect(
      fallbackGraphemes(
        "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
      ),
    ).toHaveLength(1);
    expect(fallbackGraphemes("a\r\nb")).toEqual(["a", "\r\n", "b"]);
  });

  it("handles mixed Unicode scripts while preserving the source text", () => {
    const text = "A😀🏽👨‍👩‍👧🇺🇸中नमस्ते";
    const clusters = fallbackGraphemes(text);

    expect(clusters.join("")).toBe(text);
    expect(clusters).toEqual([
      "A",
      "😀🏽",
      "👨‍👩‍👧",
      "🇺🇸",
      "中",
      "न",
      "म",
      "स्",
      "ते",
    ]);
  });
});

describe("Word Counter documentation", () => {
  for (const [code, dictionary] of Object.entries(dictionaries)) {
    it(`${code} documents CJK punctuation and fallback limits`, () => {
      const prose = dictionary.tools.wordCounter.sections
        .flatMap((section) => [
          ...(section.paragraphs ?? []),
          ...(section.items ?? []),
        ])
        .join(" ");

      expect(prose, code).toContain("`。`");
      expect(prose, code).toContain("`！`");
      expect(prose, code).toContain("`？`");
      expect(prose, code).toContain("`Intl.Segmenter`");
      expect(prose, code).toMatch(/hangul/i);
    });
  }
});

describe("time estimates", () => {
  it("uses the documented reading and speaking rates", () => {
    expect(READING_WORDS_PER_MINUTE).toBe(200);
    expect(SPEAKING_WORDS_PER_MINUTE).toBe(130);
  });

  it("returns zero for no words and a one-second minimum otherwise", () => {
    expect(readingSeconds(0)).toBe(0);
    expect(speakingSeconds(0)).toBe(0);
    expect(readingSeconds(1)).toBe(1);
    expect(speakingSeconds(1)).toBe(1);
  });

  it("rounds to the nearest second", () => {
    expect(readingSeconds(10)).toBe(3);
    expect(speakingSeconds(10)).toBe(5);
    expect(readingSeconds(100)).toBe(30);
    expect(speakingSeconds(130)).toBe(60);
    expect(readingSeconds(200)).toBe(60);
    expect(readingSeconds(300)).toBe(90);
    expect(speakingSeconds(300)).toBe(138);
  });
});

describe("durationParts", () => {
  it("splits seconds into whole minutes and seconds", () => {
    expect(durationParts(0)).toEqual({ minutes: 0, seconds: 0 });
    expect(durationParts(59)).toEqual({ minutes: 0, seconds: 59 });
    expect(durationParts(60)).toEqual({ minutes: 1, seconds: 0 });
    expect(durationParts(138)).toEqual({ minutes: 2, seconds: 18 });
  });

  it("clamps negative and non-finite values", () => {
    expect(durationParts(-5)).toEqual({ minutes: 0, seconds: 0 });
    expect(durationParts(Number.NaN)).toEqual({ minutes: 0, seconds: 0 });
    expect(durationParts(Number.POSITIVE_INFINITY)).toEqual({
      minutes: 0,
      seconds: 0,
    });
  });
});

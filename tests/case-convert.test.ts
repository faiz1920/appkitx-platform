import { describe, expect, it } from "vitest";
import {
  CASE_MODES,
  convertCase,
  type CaseMode,
} from "../src/lib/case-convert";

const baseline = "hello world from appkitx";

const expected: Record<CaseMode, string> = {
  uppercase: "HELLO WORLD FROM APPKITX",
  lowercase: "hello world from appkitx",
  title: "Hello World From Appkitx",
  sentence: "Hello world from appkitx",
  capitalized: "Hello World From Appkitx",
  camel: "helloWorldFromAppkitx",
  pascal: "HelloWorldFromAppkitx",
  snake: "hello_world_from_appkitx",
  kebab: "hello-world-from-appkitx",
  constant: "HELLO_WORLD_FROM_APPKITX",
  alternating: "hElLo WoRlD fRoM aPpKiTx",
};

describe("CASE_MODES", () => {
  it("keeps the documented order", () => {
    expect(CASE_MODES).toEqual([
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
    ]);
  });
});

describe("convertCase", () => {
  it("supports every mode", () => {
    for (const mode of CASE_MODES) {
      expect(convertCase(baseline, mode), mode).toBe(expected[mode]);
    }
  });

  it("returns an empty string for empty input in every mode", () => {
    for (const mode of CASE_MODES) {
      expect(convertCase("", mode), mode).toBe("");
    }
  });

  it("preserves punctuation and whitespace in text modes", () => {
    expect(convertCase("  Hello, world!  ", "uppercase")).toBe(
      "  HELLO, WORLD!  ",
    );
    expect(convertCase("hello\nworld", "uppercase")).toBe("HELLO\nWORLD");
    expect(convertCase("!!!", "title")).toBe("!!!");
    expect(convertCase("!!!", "sentence")).toBe("!!!");
    expect(convertCase("!!!", "alternating")).toBe("!!!");
  });

  it("collapses whitespace and punctuation in identifier modes", () => {
    for (const mode of [
      "camel",
      "pascal",
      "snake",
      "kebab",
      "constant",
    ] as const) {
      expect(convertCase("!!!", mode), mode).toBe("");
      expect(convertCase("   ", mode), mode).toBe("");
    }
    expect(convertCase("  hello,   world!  ", "snake")).toBe("hello_world");
    expect(convertCase("first line\nsecond", "camel")).toBe("firstLineSecond");
    expect(convertCase("first line\nsecond", "kebab")).toBe(
      "first-line-second",
    );
  });
});

describe("title case", () => {
  it("keeps short English function words lowercase in the middle", () => {
    expect(convertCase("the lord of the rings", "title")).toBe(
      "The Lord of the Rings",
    );
    expect(convertCase("of mice and men", "title")).toBe("Of Mice and Men");
  });

  it("keeps short Spanish function words lowercase in the middle", () => {
    expect(convertCase("el señor de los anillos", "title")).toBe(
      "El Señor de los Anillos",
    );
    expect(convertCase("una historia de amor", "title")).toBe(
      "Una Historia de Amor",
    );
  });

  it("capitalizes after a colon and at each line boundary", () => {
    expect(convertCase("star wars: a new hope", "title")).toBe(
      "Star Wars: A New Hope",
    );
    expect(convertCase("the lord of the rings\nof mice and men", "title")).toBe(
      "The Lord of the Rings\nOf Mice and Men",
    );
  });

  it("capitalizes hyphenated segments and apostrophe words sensibly", () => {
    expect(convertCase("mother-in-law", "title")).toBe("Mother-In-Law");
    expect(convertCase("don't stop", "title")).toBe("Don't Stop");
  });

  it("differs from capitalized case on function words", () => {
    expect(convertCase("the lord of the rings", "capitalized")).toBe(
      "The Lord Of The Rings",
    );
  });
});

describe("ordinal capitalization", () => {
  it("does not capitalize the suffix of digit-led ordinals", () => {
    const cases = [
      ["1st place", "1st Place"],
      ["2nd place", "2nd Place"],
      ["3rd time lucky", "3rd Time Lucky"],
      ["4th of July", "4th of July"],
      ["42nd street", "42nd Street"],
      ["the 1st place", "The 1st Place"],
      ["2026 edition", "2026 Edition"],
      ["version 2 update 3rd time", "Version 2 Update 3rd Time"],
      ["1st", "1st"],
      ["2nd", "2nd"],
      ["3rd", "3rd"],
      ["4th", "4th"],
      ["42nd", "42nd"],
      ["hello world", "Hello World"],
    ] as const;

    for (const [input, expected] of cases) {
      expect(convertCase(input, "title"), input).toBe(expected);
    }
  });

  it("keeps ordinals intact in capitalized and identifier modes", () => {
    expect(convertCase("1st place", "capitalized")).toBe("1st Place");
    expect(convertCase("42nd street", "capitalized")).toBe("42nd Street");
    expect(convertCase("1st place", "pascal")).toBe("1stPlace");
    expect(convertCase("42nd street", "pascal")).toBe("42ndStreet");
    expect(convertCase("1st place", "camel")).toBe("1stPlace");
    expect(convertCase("first 2nd place", "camel")).toBe("first2ndPlace");
    expect(convertCase("1st place", "snake")).toBe("1st_place");
    expect(convertCase("1st place", "kebab")).toBe("1st-place");
    expect(convertCase("1st place", "constant")).toBe("1ST_PLACE");
  });

  it("normalizes uppercased ordinal suffixes before identifier splitting", () => {
    expect(convertCase("1ST PLACE", "title")).toBe("1st Place");
    expect(convertCase("1ST PLACE", "pascal")).toBe("1stPlace");
    expect(convertCase("42ND STREET", "pascal")).toBe("42ndStreet");
    expect(convertCase("version 2 update 3RD time", "camel")).toBe(
      "version2Update3rdTime",
    );
  });

  it("preserves existing case for other digit-led tokens", () => {
    expect(convertCase("3D model on 100K street", "title")).toBe(
      "3D Model on 100K Street",
    );
  });
});

describe("title case performance shape", () => {
  it("does not scan the whole line for every word", () => {
    const words = Array.from({ length: 20_000 }, (_, index) => `word${index}`);
    const input = words.join(" ");
    const expected = words
      .map((word) => `Word${word.slice("word".length)}`)
      .join(" ");

    let indexOfCalls = 0;
    let lastIndexOfCalls = 0;
    const instrumented = new String(input) as unknown as string & {
      indexOf(searchString: string, position?: number): number;
      lastIndexOf(searchString: string, position?: number): number;
    };

    instrumented.indexOf = (searchString, position) => {
      indexOfCalls += 1;
      return input.indexOf(searchString, position);
    };
    instrumented.lastIndexOf = (searchString, position) => {
      lastIndexOfCalls += 1;
      return input.lastIndexOf(searchString, position);
    };

    expect(convertCase(instrumented, "title")).toBe(expected);
    expect(indexOfCalls + lastIndexOfCalls).toBeLessThan(100);
  });
});

describe("sentence case", () => {
  it("lowercases and capitalizes each line and sentence", () => {
    expect(convertCase("the QUICK brown-fox, don't stop!", "sentence")).toBe(
      "The quick brown-fox, don't stop!",
    );
    expect(convertCase("first line\nsecond line", "sentence")).toBe(
      "First line\nSecond line",
    );
  });

  it("does not split decimals and handles closing quotes", () => {
    expect(convertCase("version 3.14 is out. next", "sentence")).toBe(
      "Version 3.14 is out. Next",
    );
    expect(convertCase('Hello. "she left." next.', "sentence")).toBe(
      'Hello. "She left." Next.',
    );
  });

  it("handles CJK full stops without spaces", () => {
    expect(convertCase("hello。world", "sentence")).toBe("Hello。World");
  });
});

describe("identifier cases", () => {
  it("splits camel and acronym boundaries", () => {
    expect(convertCase("HTTPServer helloWorld version2Test", "snake")).toBe(
      "http_server_hello_world_version2_test",
    );
    expect(convertCase("HTTPServer helloWorld version2Test", "camel")).toBe(
      "httpServerHelloWorldVersion2Test",
    );
    expect(convertCase("HTTPServer helloWorld version2Test", "pascal")).toBe(
      "HttpServerHelloWorldVersion2Test",
    );
  });

  it("drops apostrophes and separates punctuation and numbers", () => {
    expect(convertCase("don't stop", "camel")).toBe("dontStop");
    expect(convertCase("foo-bar_baz 42", "snake")).toBe("foo_bar_baz_42");
    expect(convertCase("version 2 test", "camel")).toBe("version2Test");
  });

  it("handles mixed case consistently", () => {
    expect(convertCase("hello WORLD", "pascal")).toBe("HelloWorld");
    expect(convertCase("hello WORLD", "constant")).toBe("HELLO_WORLD");
  });
});

describe("alternating case", () => {
  it("toggles only letters and starts lowercase", () => {
    expect(convertCase("hello world!", "alternating")).toBe("hElLo WoRlD!");
    expect(convertCase("hi, there", "alternating")).toBe("hI, tHeRe");
  });
});

describe("Unicode behavior", () => {
  it("changes case for accented Latin text", () => {
    expect(convertCase("canción de prueba", "uppercase")).toBe(
      "CANCIÓN DE PRUEBA",
    );
    expect(convertCase("canción de prueba", "title")).toBe("Canción de Prueba");
    expect(convertCase("canción de prueba", "capitalized")).toBe(
      "Canción De Prueba",
    );
    expect(convertCase("canción de prueba", "sentence")).toBe(
      "Canción de prueba",
    );
  });

  it("leaves scripts without case unchanged in text modes", () => {
    for (const mode of [
      "uppercase",
      "lowercase",
      "title",
      "sentence",
      "capitalized",
    ] as const) {
      expect(convertCase("नमस्ते दुनिया", mode), mode).toBe("नमस्ते दुनिया");
    }
  });

  it("joins words in identifier modes even without case", () => {
    expect(convertCase("नमस्ते दुनिया", "camel")).toBe("नमस्तेदुनिया");
    expect(convertCase("नमस्ते दुनिया", "snake")).toBe("नमस्ते_दुनिया");
  });

  it("preserves emoji and punctuation in text modes", () => {
    expect(convertCase("hello 😀", "uppercase")).toBe("HELLO 😀");
    expect(convertCase("hello 😀", "alternating")).toBe("hElLo 😀");
  });
});

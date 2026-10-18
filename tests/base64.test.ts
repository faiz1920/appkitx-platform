import { describe, expect, it } from "vitest";
import { decodeBase64, encodeBase64 } from "../src/lib/base64";

/*
 * M7 Phase 1 Base64 policy: standard + URL-safe alphabets on decode, optional
 * padding, whitespace ignored, malformed input and invalid UTF-8 rejected,
 * and a distinct "empty" issue for blank input. Encoding always produces
 * standard padded Base64 from UTF-8 bytes.
 */

describe("encodeBase64", () => {
  it("encodes ASCII text with standard padding", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
    expect(encodeBase64("a")).toBe("YQ==");
    expect(encodeBase64("\n")).toBe("Cg==");
  });

  it("encodes from UTF-8 bytes, so accents and emoji survive", () => {
    expect(encodeBase64("héllo 🚀")).toBe("aMOpbGxvIPCfmoA=");
  });

  it("encodes an empty string as an empty string", () => {
    expect(encodeBase64("")).toBe("");
  });

  it("round-trips text through decode", () => {
    for (const text of [
      "hello",
      "héllo 🚀",
      "日本語",
      "a+b/c=",
      "  spaced  ",
    ]) {
      const result = decodeBase64(encodeBase64(text));
      expect(result, text).toEqual({ ok: true, value: text });
    }
  });
});

describe("decodeBase64", () => {
  it("decodes standard padded Base64", () => {
    expect(decodeBase64("aGVsbG8=")).toEqual({ ok: true, value: "hello" });
    expect(decodeBase64("aMOpbGxvIPCfmoA=")).toEqual({
      ok: true,
      value: "héllo 🚀",
    });
  });

  it("ignores whitespace anywhere in the input", () => {
    expect(decodeBase64(" aGVs\nbG8= ")).toEqual({ ok: true, value: "hello" });
    expect(decodeBase64("aGVs\tbG8=")).toEqual({ ok: true, value: "hello" });
  });

  it("accepts unpadded input", () => {
    expect(decodeBase64("aGVsbG8")).toEqual({ ok: true, value: "hello" });
    expect(decodeBase64("YQ")).toEqual({ ok: true, value: "a" });
  });

  it("accepts the URL-safe alphabet and normalizes it", () => {
    expect(decodeBase64("Pz8-")).toEqual({ ok: true, value: "??>" });
    expect(decodeBase64("Pz8_")).toEqual({ ok: true, value: "???" });
    expect(encodeBase64("??>")).toBe("Pz8+");
    expect(encodeBase64("???")).toBe("Pz8/");
  });

  it("reports empty and whitespace-only input as empty", () => {
    expect(decodeBase64("")).toEqual({ ok: false, issue: "empty" });
    expect(decodeBase64("   ")).toEqual({ ok: false, issue: "empty" });
    expect(decodeBase64("\n\t ")).toEqual({ ok: false, issue: "empty" });
  });

  it("rejects malformed input instead of guessing", () => {
    for (const input of [
      "aGVsbG8*",
      "aGVsbG8===",
      "A",
      "AA=A",
      "=aGVsbG8=",
      "aGVsbG8=".replace("a", "§"),
      "Pz8+ extra",
    ]) {
      expect(decodeBase64(input), input).toEqual({
        ok: false,
        issue: "invalid",
      });
    }
  });

  it("rejects byte sequences that are not valid UTF-8", () => {
    expect(decodeBase64("//4=")).toEqual({ ok: false, issue: "invalid" });
    expect(decodeBase64("__4=")).toEqual({ ok: false, issue: "invalid" });
    expect(decodeBase64("wA==")).toEqual({ ok: false, issue: "invalid" });
  });

  it("decodes non-canonical trailing bits like mainstream decoders", () => {
    expect(decodeBase64("QR==")).toEqual({ ok: true, value: "A" });
    expect(decodeBase64("QQ==")).toEqual({ ok: true, value: "A" });
  });
});

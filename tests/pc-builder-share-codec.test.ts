import { describe, expect, it } from "vitest";
import { DEFAULT_QUESTIONNAIRE } from "../src/lib/pc-builder/recommendations";
import {
  MAX_SHARE_ENCODED_LENGTH,
  buildShareLink,
  createSharePayload,
  decodeSharePayload,
  encodeSharePayload,
  extractSharePayloadFromHash,
  questionnaireMetadataFromQuestionnaire,
  savedBuildToSharePayload,
  type SavedBuild,
  type SavedBuildSelection,
} from "../src/lib/pc-builder/saved-builds";

const selections: SavedBuildSelection[] = [
  { category: "cpu", componentIds: ["cpu-intel-core-i5-14600k"] },
  { category: "gpu", componentIds: ["gpu-nvidia-geforce-rtx-4070-fe"] },
  {
    category: "ram",
    componentIds: [
      "ram-corsair-vengeance-32gb-ddr5-6000",
      "ram-kingston-fury-beast-32gb-ddr5-5600",
    ],
  },
];

const createdAt = "2026-10-31T10:00:00.000Z";

function manualPayload() {
  return {
    schemaVersion: 1 as const,
    name: "Shared gaming build",
    source: "manual" as const,
    selections,
  };
}

function guidedPayload() {
  return {
    schemaVersion: 1 as const,
    name: "Shared guided build",
    source: "guided" as const,
    selections,
    questionnaire: questionnaireMetadataFromQuestionnaire(
      DEFAULT_QUESTIONNAIRE,
    ),
    createdAt,
  };
}

function encodeRawBinary(binary: string): string {
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encodeRawJson(value: unknown): string {
  return encodeRawBinary(JSON.stringify(value));
}

function decodeRaw(encoded: string): string {
  const padded =
    encoded.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (encoded.length % 4)) % 4);
  return atob(padded);
}

describe("share payload codec", () => {
  it("round-trips a manual payload", () => {
    const payload = manualPayload();
    const encoded = encodeSharePayload(payload);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;

    const decoded = decodeSharePayload(encoded.value);
    expect(decoded).toEqual({ ok: true, value: payload });
  });

  it("round-trips guided metadata and creation time", () => {
    const payload = guidedPayload();
    const encoded = encodeSharePayload(payload);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const decoded = decodeSharePayload(encoded.value);
    expect(decoded).toEqual({ ok: true, value: payload });
  });

  it("round-trips unicode build names through UTF-8", () => {
    const payload = { ...manualPayload(), name: "Büro-PC 🎮" };
    const encoded = encodeSharePayload(payload);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const decoded = decodeSharePayload(encoded.value);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.value.name).toBe("Büro-PC 🎮");
  });

  it("produces deterministic URL-safe output", () => {
    const first = encodeSharePayload(manualPayload());
    const second = encodeSharePayload(manualPayload());
    expect(first).toEqual(second);
    if (first.ok) {
      expect(first.value).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(first.value).not.toContain("=");
    }
  });

  it("contains only the compact share fields", () => {
    const encoded = encodeSharePayload(guidedPayload());
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;

    const raw = JSON.parse(decodeRaw(encoded.value)) as Record<string, unknown>;
    expect(Object.keys(raw).sort()).toEqual(
      ["c", "n", "q", "s", "t", "v"].sort(),
    );
    expect(raw).not.toHaveProperty("specs");
    expect(raw).not.toHaveProperty("components");
    expect(raw).not.toHaveProperty("compatibility");
    expect(raw).not.toHaveProperty("power");
  });

  it("builds a fragment link and never puts the payload in the query", () => {
    const encoded = encodeSharePayload(manualPayload());
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;

    const link = buildShareLink(
      "https://appkitx.test/pc-builder?preview=1",
      encoded.value,
    );
    expect(link.ok).toBe(true);
    if (!link.ok) return;
    expect(
      link.value.startsWith("https://appkitx.test/pc-builder?preview=1#build="),
    ).toBe(true);
    expect(link.value.split("#")[1]).toBe(`build=${encoded.value}`);
    expect(link.value.split("?")[1]?.split("#")[0]).toBe("preview=1");
  });

  it("extracts only #build payloads", () => {
    expect(extractSharePayloadFromHash("#build=abc")).toBe("abc");
    expect(extractSharePayloadFromHash("#build=")).toBe("");
    expect(extractSharePayloadFromHash("#build")).toBe("");
    expect(extractSharePayloadFromHash("#components")).toBeNull();
    expect(extractSharePayloadFromHash("")).toBeNull();
  });

  it("rejects empty, oversized and malformed encodings", () => {
    expect(decodeSharePayload("")).toMatchObject({
      ok: false,
      error: { code: "empty" },
    });
    expect(
      decodeSharePayload("a".repeat(MAX_SHARE_ENCODED_LENGTH + 1)),
    ).toMatchObject({ ok: false, error: { code: "oversized" } });
    expect(decodeSharePayload("!!!!")).toMatchObject({
      ok: false,
      error: { code: "malformed-encoding" },
    });
    expect(decodeSharePayload("abcde")).toMatchObject({
      ok: false,
      error: { code: "malformed-encoding" },
    });
  });

  it("rejects truncated and invalid UTF-8 payloads", () => {
    const encoded = encodeSharePayload(manualPayload());
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const truncated = encoded.value.slice(
      0,
      Math.floor(encoded.value.length / 2),
    );
    const result = decodeSharePayload(truncated);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect([
        "malformed-encoding",
        "invalid-json",
        "invalid-payload",
      ]).toContain(result.error.code);
    }

    const binary = encodeRawBinary(String.fromCharCode(0xff, 0xfe, 0xfd));
    expect(decodeSharePayload(binary)).toMatchObject({
      ok: false,
      error: { code: "malformed-encoding" },
    });
  });

  it("rejects invalid JSON", () => {
    expect(decodeSharePayload(encodeRawBinary("not json"))).toMatchObject({
      ok: false,
      error: { code: "invalid-json" },
    });
  });

  it("rejects unsupported schema versions and missing versions", () => {
    expect(
      decodeSharePayload(
        encodeRawJson({
          v: 2,
          n: "Future build",
          s: "manual",
          c: [["cpu", ["cpu-intel-core-i5-14600k"]]],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: "unsupported-version" } });

    expect(
      decodeSharePayload(
        encodeRawJson({
          n: "No version",
          s: "manual",
          c: [["cpu", ["cpu-intel-core-i5-14600k"]]],
        }),
      ),
    ).toMatchObject({ ok: false, error: { code: "invalid-payload" } });
  });

  it("rejects invalid structures, ids and metadata", () => {
    const invalidPayloads: unknown[] = [
      {
        v: 1,
        n: "Empty selections",
        s: "manual",
        c: [],
      },
      {
        v: 1,
        n: "Unknown category",
        s: "manual",
        c: [["cloud", ["cpu-intel-core-i5-14600k"]]],
      },
      {
        v: 1,
        n: "Bad id",
        s: "manual",
        c: [["cpu", ["NOT VALID"]]],
      },
      {
        v: 1,
        n: "",
        s: "manual",
        c: [["cpu", ["cpu-intel-core-i5-14600k"]]],
      },
      {
        v: 1,
        n: "Manual with questionnaire",
        s: "manual",
        c: [["cpu", ["cpu-intel-core-i5-14600k"]]],
        q: { u: "gaming", r: "1440p", p: "balanced", b: 1200, cur: "UNIT" },
      },
      {
        v: 1,
        n: "Malformed selection",
        s: "manual",
        c: [["cpu"]],
      },
    ];
    for (const payload of invalidPayloads) {
      const result = decodeSharePayload(encodeRawJson(payload));
      expect(result).toMatchObject({
        ok: false,
        error: { code: "invalid-payload" },
      });
    }
  });

  it("rejects invalid payloads before encoding", () => {
    const result = encodeSharePayload({
      schemaVersion: 1,
      name: "",
      source: "manual",
      selections,
    });
    expect(result).toMatchObject({
      ok: false,
      error: { code: "invalid-payload" },
    });
  });

  it("creates validated payloads for current builds", () => {
    const payload = createSharePayload({
      name: "Current build",
      source: "manual",
      selections,
      createdAt,
    });
    expect(payload.ok).toBe(true);
    if (!payload.ok) return;
    expect(payload.value.createdAt).toBe(createdAt);

    const invalid = createSharePayload({
      name: "Current build",
      source: "manual",
      selections: [],
    });
    expect(invalid.ok).toBe(false);
  });

  it("converts a saved build into a share payload without storage", () => {
    const build: SavedBuild = {
      schemaVersion: 1,
      id: "build-test-1",
      name: "Saved build",
      source: "guided",
      createdAt,
      updatedAt: createdAt,
      selections,
      questionnaire: questionnaireMetadataFromQuestionnaire(
        DEFAULT_QUESTIONNAIRE,
      ),
    };
    const payload = savedBuildToSharePayload(build);
    expect(payload).toEqual({
      schemaVersion: 1,
      name: "Saved build",
      source: "guided",
      selections,
      questionnaire: questionnaireMetadataFromQuestionnaire(
        DEFAULT_QUESTIONNAIRE,
      ),
      createdAt,
    });
    const encoded = encodeSharePayload(payload);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    expect(decodeSharePayload(encoded.value)).toEqual({
      ok: true,
      value: payload,
    });
  });

  it("rejects malformed or oversized links", () => {
    expect(buildShareLink("https://appkitx.test/pc-builder", "")).toMatchObject(
      {
        ok: false,
        error: { code: "empty" },
      },
    );
    expect(
      buildShareLink("https://appkitx.test/pc-builder", "not valid!"),
    ).toMatchObject({
      ok: false,
      error: { code: "malformed-encoding" },
    });
    expect(buildShareLink("", "abc")).toMatchObject({
      ok: false,
      error: { code: "invalid-payload" },
    });
    expect(
      buildShareLink(
        "https://appkitx.test/pc-builder",
        "a".repeat(MAX_SHARE_ENCODED_LENGTH + 1),
      ),
    ).toMatchObject({ ok: false, error: { code: "oversized" } });
  });
});

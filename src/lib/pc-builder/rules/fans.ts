/* Case fan rules: case mounting size and motherboard header availability. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_FAN_CASE_SIZE = "fan-case-size";
export const RULE_FAN_HEADERS = "fan-motherboard-headers";

export const fanCaseRule: CompatibilityRule = (ctx) => {
  const { caseFans, pcCase } = ctx;
  if (caseFans.length === 0 || !pcCase) return [];

  const ids = [...caseFans.map((f) => f.id), pcCase.id];
  const sizes = [...new Set(caseFans.map((f) => f.specs.sizeMm))];
  const supported = pcCase.specs.fanSizesMm;

  if (supported === null || supported.length === 0) {
    return [
      makeResult(
        RULE_FAN_CASE_SIZE,
        "unknown",
        ids,
        "The case's supported fan sizes are not documented in the available data, so fan mounting cannot be verified.",
        {
          observed: { fanSizesMm: sizes.join(", ") },
          recommendation:
            "Check the case specification for supported fan sizes.",
        },
      ),
    ];
  }

  const unsupported = sizes.filter((size) => !supported.includes(size));
  if (unsupported.length > 0) {
    return [
      makeResult(
        RULE_FAN_CASE_SIZE,
        "incompatible",
        ids,
        `The case has no documented mounting for ${unsupported.join(", ")} mm fan(s) (supported sizes: ${supported.join(", ")} mm).`,
        {
          observed: {
            fanSizesMm: sizes.join(", "),
            caseSupportedSizesMm: supported.join(", "),
          },
          recommendation: "Choose fans in a size the case supports.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_FAN_CASE_SIZE,
      "compatible",
      ids,
      `All selected fan sizes (${sizes.join(", ")} mm) are supported by the case.`,
      { observed: { fanSizesMm: sizes.join(", ") } },
    ),
  ];
};

export const fanHeadersRule: CompatibilityRule = (ctx) => {
  const { caseFans, motherboard } = ctx;
  if (caseFans.length === 0 || !motherboard) return [];

  const ids = [...caseFans.map((f) => f.id), motherboard.id];
  const headers = motherboard.specs.fanHeaders;

  if (headers === null) {
    return [
      makeResult(
        RULE_FAN_HEADERS,
        "unknown",
        ids,
        "The motherboard's fan header count is not documented in the available data, so fan connectivity cannot be verified.",
        {
          observed: { fansSelected: caseFans.length },
          recommendation:
            "Check the motherboard specification for available fan headers.",
        },
      ),
    ];
  }

  if (caseFans.length > headers) {
    return [
      makeResult(
        RULE_FAN_HEADERS,
        "warning",
        ids,
        `${caseFans.length} fans are selected but the motherboard only documents ${headers} fan header(s). Extra fans need a splitter or a fan hub.`,
        {
          observed: { fansSelected: caseFans.length, fanHeaders: headers },
          recommendation:
            "Add a fan splitter or powered hub, or reduce the fan count.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_FAN_HEADERS,
      "compatible",
      ids,
      `${caseFans.length} fan(s) can connect directly to the motherboard's ${headers} fan header(s).`,
      {
        observed: { fansSelected: caseFans.length, fanHeaders: headers },
      },
    ),
  ];
};

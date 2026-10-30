/* Motherboard ↔ case form factor rule. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_MOTHERBOARD_CASE_FORM_FACTOR = "motherboard-case-form-factor";

export const motherboardCaseRule: CompatibilityRule = (ctx) => {
  const { motherboard, pcCase } = ctx;
  if (!motherboard || !pcCase) return [];

  const ids = [motherboard.id, pcCase.id];
  const formFactor = motherboard.specs.formFactor;
  const supported = pcCase.specs.supportedFormFactors;

  if (supported.length === 0) {
    return [
      makeResult(
        RULE_MOTHERBOARD_CASE_FORM_FACTOR,
        "unknown",
        ids,
        "The case's supported motherboard form factors are not documented in the available data.",
        {
          recommendation:
            "Check the case specification for supported motherboard sizes.",
        },
      ),
    ];
  }

  if (!supported.includes(formFactor)) {
    return [
      makeResult(
        RULE_MOTHERBOARD_CASE_FORM_FACTOR,
        "incompatible",
        ids,
        `The ${formFactor} motherboard does not fit: the case supports ${supported.join(", ")} motherboards.`,
        {
          observed: {
            motherboardFormFactor: formFactor,
            caseSupports: supported.join(", "),
          },
          recommendation:
            "Choose a case that supports this motherboard form factor.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_MOTHERBOARD_CASE_FORM_FACTOR,
      "compatible",
      ids,
      `The case supports ${formFactor} motherboards.`,
      { observed: { motherboardFormFactor: formFactor } },
    ),
  ];
};

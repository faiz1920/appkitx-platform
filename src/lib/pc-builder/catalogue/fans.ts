import type { CaseFanComponent } from "../types";
import { CATALOGUE_VERIFIED_DATE, manufacturerSource } from "./meta";

export const caseFans: readonly CaseFanComponent[] = [
  {
    id: "case-fan-noctua-nf-a12x25-pwm",
    category: "case-fan",
    manufacturer: "Noctua",
    name: "NF-A12x25 PWM",
    model: "NF-A12x25 PWM",
    description:
      "120 mm premium fan with Sterrox LCP blades, 4-pin PWM, 450–2000 rpm speed range.",
    url: "https://noctua.at/en/nf-a12x25-pwm/specification",
    availability: "in-production",
    source: manufacturerSource(
      "Noctua product specification",
      "https://noctua.at/en/nf-a12x25-pwm/specification",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      sizeMm: 120,
      connector: "4-pin-pwm",
      airflowDirection: "standard",
      rpmMin: 450,
      rpmMax: 2000,
    },
  },
  {
    id: "case-fan-noctua-nf-a14-pwm",
    category: "case-fan",
    manufacturer: "Noctua",
    name: "NF-A14 PWM",
    model: "NF-A14 PWM",
    description:
      "140 mm premium fan with square frame (fits 120 mm mounting holes), 4-pin PWM, 300–1500 rpm speed range.",
    url: "https://noctua.at/en/nf-a14-pwm/specification",
    availability: "in-production",
    source: manufacturerSource(
      "Noctua product specification",
      "https://noctua.at/en/nf-a14-pwm/specification",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      sizeMm: 140,
      connector: "4-pin-pwm",
      airflowDirection: "standard",
      rpmMin: 300,
      rpmMax: 1500,
    },
  },
  {
    id: "case-fan-arctic-p12-pwm",
    category: "case-fan",
    manufacturer: "ARCTIC",
    name: "P12 PWM",
    model: "P12 PWM",
    description:
      "120 mm pressure-optimised fan, 4-pin PWM, 200–1800 rpm speed range.",
    url: "https://www.arctic.de/en/P12-PWM/ACFAN00119A",
    availability: "in-production",
    source: manufacturerSource(
      "ARCTIC product specification",
      "https://www.arctic.de/en/P12-PWM/ACFAN00119A",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      sizeMm: 120,
      connector: "4-pin-pwm",
      airflowDirection: "standard",
      rpmMin: 200,
      rpmMax: 1800,
    },
  },
];

import type { CoolerComponent } from "../types";
import { CATALOGUE_VERIFIED_DATE, manufacturerSource } from "./meta";

export const coolers: readonly CoolerComponent[] = [
  {
    id: "cooler-noctua-nh-d15",
    category: "cooler",
    manufacturer: "Noctua",
    name: "NH-D15",
    model: "NH-D15",
    description:
      "Dual-tower air cooler with two NF-A15 140 mm fans, 165 mm height. Noctua does not publish a TDP rating; cooling capacity must be assessed independently.",
    url: "https://noctua.at/en/nh-d15/specification",
    availability: "in-production",
    source: manufacturerSource(
      "Noctua product specification",
      "https://noctua.at/en/nh-d15/specification",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      type: "air",
      supportedSockets: [
        "AM4",
        "AM5",
        "LGA1150",
        "LGA1151",
        "LGA1155",
        "LGA1156",
        "LGA1200",
        "LGA1700",
      ],
      heightMm: 165,
      radiatorSizeMm: null,
      tdpRatingW: null,
    },
  },
  {
    id: "cooler-cooler-master-hyper-212-spectrum-v3",
    category: "cooler",
    manufacturer: "Cooler Master",
    name: "Hyper 212 Spectrum V3",
    model: "Hyper 212 Spectrum V3",
    description:
      "Single-tower air cooler with a 120 mm Spectrum fan, 152 mm height, four heat pipes with direct-contact base.",
    url: "https://www.coolermaster.com/en-global/products/hyper-212-spectrum-v3/",
    availability: "in-production",
    source: manufacturerSource(
      "Cooler Master product specification",
      "https://www.coolermaster.com/en-global/products/hyper-212-spectrum-v3/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      type: "air",
      supportedSockets: ["AM4", "AM5", "LGA1151", "LGA1200", "LGA1700"],
      heightMm: 152,
      radiatorSizeMm: null,
      tdpRatingW: null,
    },
  },
  {
    id: "cooler-corsair-icue-h100i-rgb-elite",
    category: "cooler",
    manufacturer: "Corsair",
    name: "iCUE H100i RGB ELITE",
    model: "iCUE H100i RGB ELITE",
    description:
      "240 mm all-in-one liquid CPU cooler with two 120 mm AF ELITE fans and a split-flow copper cold plate.",
    url: "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060058-ww/",
    availability: "in-production",
    source: manufacturerSource(
      "Corsair product specification",
      "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060058-ww/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      type: "aio-liquid",
      supportedSockets: ["AM4", "AM5", "LGA1151", "LGA1200", "LGA1700"],
      heightMm: null,
      radiatorSizeMm: 240,
      tdpRatingW: null,
    },
  },
];

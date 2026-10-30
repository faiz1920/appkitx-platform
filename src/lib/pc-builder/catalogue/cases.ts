import type { CaseComponent } from "../types";
import { CATALOGUE_VERIFIED_DATE, manufacturerSource } from "./meta";

export const cases: readonly CaseComponent[] = [
  {
    id: "case-corsair-4000d-airflow",
    category: "case",
    manufacturer: "Corsair",
    name: "4000D AIRFLOW",
    model: "CC-9011200-WW",
    description:
      "Mid-tower ATX case with a high-airflow steel front panel, 360 mm GPU clearance and two included 120 mm fans.",
    url: "https://www.corsair.com/us/en/p/pc-cases/cc-9011200-ww/",
    availability: "in-production",
    source: manufacturerSource(
      "Corsair product specification",
      "https://www.corsair.com/us/en/p/pc-cases/cc-9011200-ww/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
      maxGpuLengthMm: 360,
      maxCoolerHeightMm: 170,
      psuFormFactors: ["ATX"],
      radiatorSupportMm: [120, 240, 280, 360],
      maxGpuSlots: null,
      driveBays25inch: 2,
      driveBays35inch: 2,
      fanSizesMm: [120, 140],
      includedFans: 2,
    },
  },
  {
    id: "case-nzxt-h510",
    category: "case",
    manufacturer: "NZXT",
    name: "H510",
    model: "H510",
    description:
      "Compact mid-tower ATX case with a tempered glass side panel, front USB-C and two included Aer F120 fans.",
    url: "https://nzxt.com/product/h510",
    availability: "discontinued",
    source: manufacturerSource(
      "NZXT product specification",
      "https://nzxt.com/product/h510",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
      maxGpuLengthMm: 381,
      maxCoolerHeightMm: 165,
      psuFormFactors: ["ATX"],
      radiatorSupportMm: [120, 240, 280],
      maxGpuSlots: null,
      driveBays25inch: null,
      driveBays35inch: null,
      fanSizesMm: [120, 140],
      includedFans: 2,
    },
  },
  {
    id: "case-cooler-master-nr200",
    category: "case",
    manufacturer: "Cooler Master",
    name: "MasterBox NR200",
    model: "NR200",
    description:
      "Mini-ITX small-form-factor case with ventilated steel panels, 330 mm triple-slot GPU clearance and SFX/SFX-L PSU support.",
    url: "https://www.coolermaster.com/en-global/products/masterbox-nr200/",
    availability: "in-production",
    source: manufacturerSource(
      "Cooler Master product specification",
      "https://www.coolermaster.com/en-global/products/masterbox-nr200/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      supportedFormFactors: ["Mini-ITX"],
      maxGpuLengthMm: 330,
      maxCoolerHeightMm: 155,
      psuFormFactors: ["SFX", "SFX-L"],
      radiatorSupportMm: [240, 280],
      maxGpuSlots: null,
      driveBays25inch: null,
      driveBays35inch: null,
      fanSizesMm: [120],
      includedFans: 2,
    },
  },
];

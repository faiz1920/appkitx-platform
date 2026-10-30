import type { RamComponent } from "../types";
import { CATALOGUE_VERIFIED_DATE, manufacturerSource } from "./meta";

export const ramKits: readonly RamComponent[] = [
  {
    id: "ram-corsair-vengeance-32gb-ddr5-6000",
    category: "ram",
    manufacturer: "Corsair",
    name: "Vengeance 32GB (2 x 16GB) DDR5-6000 CL30",
    model: "CMK32GX5M2B6000C30",
    description:
      "32 GB dual-channel DDR5 kit, 6000 MT/s at CL30, Intel XMP 3.0, non-ECC unbuffered DIMMs.",
    url: "https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c30/",
    availability: "in-production",
    source: manufacturerSource(
      "Corsair product specification",
      "https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c30/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      generation: "DDR5",
      moduleCapacityGB: 16,
      moduleCount: 2,
      totalCapacityGB: 32,
      speedMTs: 6000,
      formFactor: "DIMM",
      ecc: false,
      registered: false,
    },
  },
  {
    id: "ram-gskill-ripjaws-v-16gb-ddr4-3200",
    category: "ram",
    manufacturer: "G.SKILL",
    name: "Ripjaws V 16GB (2 x 8GB) DDR4-3200 CL16",
    model: "F4-3200C16D-16GVKB",
    description:
      "16 GB dual-channel DDR4 kit, 3200 MT/s at CL16-18-18-38, Intel XMP 2.0, non-ECC unbuffered DIMMs.",
    url: "https://www.gskill.com/product/165/166/1536650959/F4-3200C16D-16GVKB",
    availability: "in-production",
    source: manufacturerSource(
      "G.SKILL product specification",
      "https://www.gskill.com/product/165/166/1536650959/F4-3200C16D-16GVKB",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      generation: "DDR4",
      moduleCapacityGB: 8,
      moduleCount: 2,
      totalCapacityGB: 16,
      speedMTs: 3200,
      formFactor: "DIMM",
      ecc: false,
      registered: false,
    },
  },
  {
    id: "ram-kingston-fury-beast-16gb-ddr5-5200",
    category: "ram",
    manufacturer: "Kingston",
    name: "FURY Beast 16GB (2 x 8GB) DDR5-5200 CL40",
    model: "KF552C40BBK2-16",
    description:
      "16 GB dual-channel DDR5 kit, 5200 MT/s at CL40, Intel XMP 3.0, non-ECC unbuffered DIMMs.",
    url: "https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory",
    availability: "in-production",
    source: manufacturerSource(
      "Kingston product specification",
      "https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      generation: "DDR5",
      moduleCapacityGB: 8,
      moduleCount: 2,
      totalCapacityGB: 16,
      speedMTs: 5200,
      formFactor: "DIMM",
      ecc: false,
      registered: false,
    },
  },
];

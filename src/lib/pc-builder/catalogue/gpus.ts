import type { GpuComponent } from "../types";
import { CATALOGUE_VERIFIED_DATE, manufacturerSource } from "./meta";

export const gpus: readonly GpuComponent[] = [
  {
    id: "gpu-amd-radeon-rx-7800-xt",
    category: "gpu",
    manufacturer: "AMD",
    name: "Radeon RX 7800 XT",
    model: "Radeon RX 7800 XT",
    description:
      "RDNA 3 graphics card with 16 GB GDDR6, PCIe 4.0 x16 interface and 263 W total board power (reference design).",
    url: "https://www.amd.com/en/products/graphics/amd-radeon-rx-7800-xt",
    releaseDate: "2023-09-06",
    availability: "in-production",
    source: manufacturerSource(
      "AMD product specification",
      "https://www.amd.com/en/products/graphics/amd-radeon-rx-7800-xt",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      pcieGeneration: 4,
      pcieLanes: 16,
      lengthMm: 267,
      slotWidth: 2.5,
      powerDrawW: 263,
      recommendedPsuW: 700,
      powerConnectors: [{ type: "pcie-8pin", count: 2 }],
      displayOutputs: ["HDMI 2.1a", "DisplayPort 2.1 x3"],
    },
  },
  {
    id: "gpu-nvidia-geforce-rtx-4070-fe",
    category: "gpu",
    manufacturer: "NVIDIA",
    name: "GeForce RTX 4070 Founders Edition",
    model: "GeForce RTX 4070 Founders Edition",
    description:
      "Ada Lovelace graphics card with 12 GB GDDR6X, 200 W total graphics power and a 16-pin power connector (adapter included).",
    url: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-4070ti/",
    releaseDate: "2023-04-13",
    availability: "in-production",
    source: manufacturerSource(
      "NVIDIA product specification",
      "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-4070ti/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      pcieGeneration: 4,
      pcieLanes: 16,
      lengthMm: 240,
      slotWidth: 2,
      powerDrawW: 200,
      recommendedPsuW: 650,
      powerConnectors: [{ type: "12vhpwr-16pin", count: 1 }],
      displayOutputs: ["HDMI 2.1a", "DisplayPort 1.4a x3"],
    },
  },
  {
    id: "gpu-nvidia-geforce-rtx-4090-fe",
    category: "gpu",
    manufacturer: "NVIDIA",
    name: "GeForce RTX 4090 Founders Edition",
    model: "GeForce RTX 4090 Founders Edition",
    description:
      "Flagship Ada Lovelace graphics card with 24 GB GDDR6X, 450 W total graphics power and a 16-pin power connector.",
    url: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/",
    releaseDate: "2022-10-12",
    availability: "discontinued",
    source: manufacturerSource(
      "NVIDIA product specification",
      "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      pcieGeneration: 4,
      pcieLanes: 16,
      lengthMm: 304,
      slotWidth: 3,
      powerDrawW: 450,
      recommendedPsuW: 850,
      powerConnectors: [{ type: "12vhpwr-16pin", count: 1 }],
      displayOutputs: ["HDMI 2.1a", "DisplayPort 1.4a x3"],
    },
  },
];

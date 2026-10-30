import type { PsuComponent } from "../types";
import { CATALOGUE_VERIFIED_DATE, manufacturerSource } from "./meta";

export const psus: readonly PsuComponent[] = [
  {
    id: "psu-corsair-rm750x-2021",
    category: "psu",
    manufacturer: "Corsair",
    name: "RM750x (2021)",
    model: "CP-9020199",
    description:
      "750 W fully modular ATX power supply, 80 PLUS Gold certified, Zero RPM fan mode.",
    url: "https://www.corsair.com/us/en/p/psu/cp-9020199-na/",
    availability: "in-production",
    source: manufacturerSource(
      "Corsair product specification",
      "https://www.corsair.com/us/en/p/psu/cp-9020199-na/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      wattage: 750,
      efficiency: "80 PLUS Gold",
      modularity: "full",
      formFactor: "ATX",
      atxVersion: null,
      connectors: {
        eps8pin: 2,
        pcie8pin: 4,
        pcie16pin: 0,
        sata: null,
      },
    },
  },
  {
    id: "psu-corsair-cv650",
    category: "psu",
    manufacturer: "Corsair",
    name: "CV650",
    model: "CP-9020211",
    description:
      "650 W non-modular ATX power supply, 80 PLUS Bronze certified, 120 mm low-noise fan.",
    url: "https://www.corsair.com/us/en/p/psu/cp-9020211-na/",
    availability: "in-production",
    source: manufacturerSource(
      "Corsair product specification",
      "https://www.corsair.com/us/en/p/psu/cp-9020211-na/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      wattage: 650,
      efficiency: "80 PLUS Bronze",
      modularity: "non-modular",
      formFactor: "ATX",
      atxVersion: null,
      connectors: {
        eps8pin: 1,
        pcie8pin: 2,
        pcie16pin: 0,
        sata: null,
      },
    },
  },
  {
    id: "psu-msi-mpg-a850g-pcie5",
    category: "psu",
    manufacturer: "MSI",
    name: "MPG A850G PCIE5",
    model: "MPG A850G PCIE5",
    description:
      "850 W fully modular ATX 3.0 power supply, 80 PLUS Gold certified, with a native 16-pin (12VHPWR) connector.",
    url: "https://www.msi.com/Power-Supply/MPG-A850G-PCIE5",
    availability: "in-production",
    source: manufacturerSource(
      "MSI product specification",
      "https://www.msi.com/Power-Supply/MPG-A850G-PCIE5/Specification",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      wattage: 850,
      efficiency: "80 PLUS Gold",
      modularity: "full",
      formFactor: "ATX",
      atxVersion: "ATX 3.0",
      connectors: {
        eps8pin: 2,
        pcie8pin: null,
        pcie16pin: 1,
        sata: null,
      },
    },
  },
];

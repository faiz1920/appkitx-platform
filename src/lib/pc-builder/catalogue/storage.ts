import type { StorageComponent } from "../types";
import { CATALOGUE_VERIFIED_DATE, manufacturerSource } from "./meta";

export const storageDevices: readonly StorageComponent[] = [
  {
    id: "storage-samsung-990-pro-1tb",
    category: "storage",
    manufacturer: "Samsung",
    name: "990 PRO 1TB",
    model: "MZ-V9P1T0BW",
    description:
      "PCIe 4.0 x4 NVMe M.2 2280 SSD with Samsung V-NAND TLC, up to 7,450 MB/s sequential read.",
    url: "https://semiconductor.samsung.com/consumer-storage/internal-ssd/990-pro/",
    releaseDate: "2022-11-01",
    availability: "in-production",
    source: manufacturerSource(
      "Samsung product specification",
      "https://semiconductor.samsung.com/consumer-storage/internal-ssd/990-pro/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      storageType: "ssd",
      capacityGB: 1000,
      interface: "nvme",
      formFactor: "m2",
      m2LengthMm: 2280,
      pcieGeneration: 4,
    },
  },
  {
    id: "storage-crucial-mx500-1tb",
    category: "storage",
    manufacturer: "Crucial",
    name: "MX500 1TB",
    model: "CT1000MX500SSD1",
    description:
      "2.5-inch SATA 6 Gb/s SSD with Micron 3D NAND, up to 560 MB/s sequential read.",
    url: "https://www.crucial.com/ssd/mx500/ct1000mx500ssd1",
    availability: "in-production",
    source: manufacturerSource(
      "Crucial product specification",
      "https://www.crucial.com/ssd/mx500/ct1000mx500ssd1",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      storageType: "ssd",
      capacityGB: 1000,
      interface: "sata",
      formFactor: "2.5-inch",
      m2LengthMm: null,
      pcieGeneration: null,
    },
  },
  {
    id: "storage-seagate-barracuda-2tb",
    category: "storage",
    manufacturer: "Seagate",
    name: "BarraCuda 2TB",
    model: "ST2000DM008",
    description:
      "3.5-inch SATA 6 Gb/s desktop hard drive, 7200 RPM with 256 MB cache.",
    url: "https://www.seagate.com/products/desktop-drives/barracuda-hard-drive/",
    availability: "in-production",
    source: manufacturerSource(
      "Seagate product specification",
      "https://www.seagate.com/products/desktop-drives/barracuda-hard-drive/",
    ),
    lastVerified: CATALOGUE_VERIFIED_DATE,
    specs: {
      storageType: "hdd",
      capacityGB: 2000,
      interface: "sata",
      formFactor: "3.5-inch",
      m2LengthMm: null,
      pcieGeneration: null,
    },
  },
];

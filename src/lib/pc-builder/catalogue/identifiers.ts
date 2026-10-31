/*
 * Reviewed product identity evidence for the M10.9 registry.
 *
 * Every record below was checked against a manufacturer page or manufacturer
 * document on 2026-10-31. This is source verification, not human approval:
 * every record is deliberately marked `humanReview: "not-reviewed"` because no
 * named human has independently approved it.
 *
 * Catalogue specifications are not modified here; the component id,
 * manufacturer and model are assertions that the validator checks against the
 * existing catalogue.
 *
 * No price, stock, retailer SKU or provider identifier belongs in this file.
 */

import type {
  CatalogueIdentifierRecord,
  CatalogueIdentifierRegistry,
  IdentitySource,
} from "../pricing/identity-registry";

const ACCESSED_AT = "2026-10-31T16:53:34.000Z";
const SOURCE_VERIFIED_AT = "2026-10-31T16:54:00.000Z";
const SOURCE_VERIFIED_BY = "opencode-m10.9";

function page(name: string, url: string): IdentitySource {
  return { type: "manufacturer-page", name, url, accessedAt: ACCESSED_AT };
}

function document(name: string, url: string): IdentitySource {
  return {
    type: "manufacturer-document",
    name,
    url,
    accessedAt: ACCESSED_AT,
  };
}

function record(input: {
  componentId: string;
  manufacturer: string;
  model: string;
  manufacturerPartNumber?: string | null;
  gtin?: string | null;
  source: IdentitySource;
  notes: string;
}): CatalogueIdentifierRecord {
  return {
    componentId: input.componentId,
    manufacturer: input.manufacturer,
    model: input.model,
    manufacturerPartNumber: input.manufacturerPartNumber ?? null,
    gtin: input.gtin ?? null,
    region: null,
    source: input.source,
    sourceVerification: {
      status: "source-verified",
      method: "automated-manufacturer-evidence-check",
      verifiedBy: SOURCE_VERIFIED_BY,
      verifiedAt: SOURCE_VERIFIED_AT,
      notes: input.notes,
    },
    humanReview: {
      status: "not-reviewed",
      reviewer: null,
      reviewedAt: null,
      notes: null,
    },
  };
}

const corsair = (url: string): IdentitySource =>
  page("Corsair product page", url);
const gskill = (url: string): IdentitySource =>
  page("G.SKILL product specification", url);
const arctic = (url: string): IdentitySource =>
  page("ARCTIC product page", url);
const noctua = (name: string, url: string): IdentitySource =>
  document(name, url);

export const identifierRegistry: CatalogueIdentifierRegistry = {
  schemaVersion: 1,
  records: [
    record({
      componentId: "ram-corsair-vengeance-32gb-ddr5-6000",
      manufacturer: "Corsair",
      model: "CMK32GX5M2B6000C30",
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
      source: corsair(
        "https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c30/vengeance-32gb-2x16gb-ddr5-dram-6000mt-s-c30-memory-kit-black-cmk32gx5m2b6000c30",
      ),
      notes:
        "Corsair product page displays SKU CMK32GX5M2B6000C30 for this exact 32 GB kit.",
    }),
    record({
      componentId: "ram-corsair-vengeance-lpx-16gb-ddr4-3200",
      manufacturer: "Corsair",
      model: "CMK16GX4M2B3200C16",
      manufacturerPartNumber: "CMK16GX4M2B3200C16",
      source: corsair(
        "https://www.corsair.com/us/en/p/memory/cmk16gx4m2b3200c16/vengeancea-lpx-16gb-2-x-8gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk16gx4m2b3200c16",
      ),
      notes:
        "Corsair product page identifies the Vengeance LPX 16 GB kit by SKU CMK16GX4M2B3200C16.",
    }),
    record({
      componentId: "ram-corsair-vengeance-lpx-32gb-ddr4-3200",
      manufacturer: "Corsair",
      model: "CMK32GX4M4B3200C16",
      manufacturerPartNumber: "CMK32GX4M4B3200C16",
      source: corsair(
        "https://www.corsair.com/us/en/p/memory/cmk32gx4m4b3200c16/vengeancea-lpx-32gb-4-x-8gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk32gx4m4b3200c16",
      ),
      notes:
        "Corsair product page identifies the Vengeance LPX 32 GB four-module kit by SKU CMK32GX4M4B3200C16.",
    }),
    record({
      componentId: "ram-corsair-vengeance-64gb-ddr5-5600",
      manufacturer: "Corsair",
      model: "CMK64GX5M2B5600C40",
      manufacturerPartNumber: "CMK64GX5M2B5600C40",
      source: corsair(
        "https://www.corsair.com/us/en/p/memory/cmk64gx5m2b5600c40/vengeancea-64gb-2x32gb-ddr5-dram-5600mhz-c40-memory-kit-a-black-cmk64gx5m2b5600c40",
      ),
      notes:
        "Corsair product page identifies the Vengeance 64 GB kit by SKU CMK64GX5M2B5600C40.",
    }),
    record({
      componentId: "ram-gskill-ripjaws-v-16gb-ddr4-3200",
      manufacturer: "G.SKILL",
      model: "F4-3200C16D-16GVKB",
      manufacturerPartNumber: "F4-3200C16D-16GVKB",
      source: gskill(
        "https://www.gskill.com/product/165/184/1536110676/F4-3200C16D-16GVKB",
      ),
      notes:
        "G.SKILL product page title is F4-3200C16D-16GVKB and its specification table identifies the exact 16 GB kit.",
    }),
    record({
      componentId: "ram-gskill-ripjaws-v-32gb-ddr4-3600",
      manufacturer: "G.SKILL",
      model: "F4-3600C18D-32GVK",
      manufacturerPartNumber: "F4-3600C18D-32GVK",
      source: gskill(
        "https://www.gskill.com/specification/165/184/1562833535/F4-3600C18D-32GVK-Specification",
      ),
      notes:
        "G.SKILL specification page title is F4-3600C18D-32GVK and its model table identifies the exact 32 GB kit.",
    }),
    record({
      componentId: "ram-gskill-flare-x5-32gb-ddr5-6000",
      manufacturer: "G.SKILL",
      model: "F5-6000J3038F16GX2-FX5",
      manufacturerPartNumber: "F5-6000J3038F16GX2-FX5",
      source: gskill(
        "https://www.gskill.com/specification/165/396/1673491242/F5-6000J3038F16GX2-FX5-Specification",
      ),
      notes:
        "G.SKILL specification page title is F5-6000J3038F16GX2-FX5 and its model table identifies the exact 32 GB DDR5 kit.",
    }),
    record({
      componentId: "storage-samsung-990-pro-1tb",
      manufacturer: "Samsung",
      model: "MZ-V9P1T0BW",
      manufacturerPartNumber: "MZ-V9P1T0BW",
      source: document(
        "Samsung 990 PRO series brochure",
        "https://download.semiconductor.samsung.com/resources/brochure/990_PRO_Series_Brouchure_Web_Version_4.0_250523.pdf",
      ),
      notes:
        "Samsung 990 PRO brochure lists Model Code MZ-V9P1T0BW for the 1 TB model.",
    }),
    record({
      componentId: "storage-wd-black-sn850x-1tb",
      manufacturer: "Western Digital",
      model: "WDS100T2X0E",
      manufacturerPartNumber: "WDS100T2X0E",
      source: page(
        "SanDisk WD_BLACK SN850X product page",
        "https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn850x-nvme-ssd?sku=WDS100T2X0E",
      ),
      notes:
        "SanDisk/WD product page lists Model Number WDS100T2X0E for the 1 TB model without heatsink.",
    }),
    record({
      componentId: "storage-seagate-barracuda-2tb",
      manufacturer: "Seagate",
      model: "ST2000DM008",
      manufacturerPartNumber: "ST2000DM008",
      source: document(
        "Seagate BarraCuda 3.5-inch data sheet",
        "https://www.seagate.com/www-content/datasheets/pdfs/3-5-barracudaDS1900-7-1706US-en_US.pdf",
      ),
      notes:
        "Seagate BarraCuda data sheet lists ST2000DM008 as the 2 TB standard model.",
    }),
    record({
      componentId: "storage-seagate-ironwolf-4tb",
      manufacturer: "Seagate",
      model: "ST4000VN006",
      manufacturerPartNumber: "ST4000VN006",
      source: document(
        "Seagate IronWolf product manual",
        "https://www.seagate.com/www-content/product-content/ironwolf/en-us/docs/100807039n.pdf",
      ),
      notes:
        "Seagate IronWolf product manual lists ST4000VN006 as a standard 4 TB model.",
    }),
    record({
      componentId: "cooler-arctic-freezer-36",
      manufacturer: "ARCTIC",
      model: "ACFRE00123A",
      manufacturerPartNumber: "ACFRE00123A",
      gtin: "4895213704144",
      source: arctic("https://www.arctic.de/en/Freezer-36/ACFRE00123A"),
      notes:
        "ARCTIC product page identifies article number ACFRE00123A and lists EAN 4895213704144.",
    }),
    record({
      componentId: "cooler-arctic-liquid-freezer-iii-280",
      manufacturer: "ARCTIC",
      model: "ACFRE00135A",
      manufacturerPartNumber: "ACFRE00135A",
      gtin: "4895213704472",
      source: arctic(
        "https://www.arctic.de/en/Liquid-Freezer-III-280/ACFRE00135A",
      ),
      notes:
        "ARCTIC product page identifies article number ACFRE00135A and lists EAN 4895213704472.",
    }),
    record({
      componentId: "cooler-corsair-icue-h100i-rgb-elite",
      manufacturer: "Corsair",
      model: "iCUE H100i RGB ELITE",
      manufacturerPartNumber: "CW-9060058-WW",
      source: corsair(
        "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060058-ww/icue-h100i-rgb-elite-liquid-cpu-cooler-cw-9060058-ww",
      ),
      notes:
        "Corsair product page identifies the iCUE H100i RGB ELITE by SKU CW-9060058-WW.",
    }),
    record({
      componentId: "cooler-corsair-icue-h150i-elite-capellix-xt",
      manufacturer: "Corsair",
      model: "CW-9060070-WW",
      manufacturerPartNumber: "CW-9060070-WW",
      source: corsair(
        "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060070-ww/icue-h150i-elite-capellix-xt-liquid-cpu-cooler",
      ),
      notes:
        "Corsair product page identifies the iCUE H150i ELITE CAPELLIX XT by SKU CW-9060070-WW.",
    }),
    record({
      componentId: "cooler-corsair-icue-h60x-rgb-elite",
      manufacturer: "Corsair",
      model: "CW-9060064-WW2",
      manufacturerPartNumber: "CW-9060064-WW2",
      source: corsair(
        "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060064-ww2/icue-h60x-rgb-elite-liquid-cpu-cooler-cw-9060064-ww2",
      ),
      notes:
        "Corsair product page identifies the iCUE H60x RGB ELITE by SKU CW-9060064-WW2.",
    }),
    record({
      componentId: "cooler-be-quiet-dark-rock-pro-4",
      manufacturer: "be quiet!",
      model: "BK022",
      manufacturerPartNumber: "BK022",
      source: page(
        "be quiet! Dark Rock Pro 4 product page",
        "https://www.bequiet.com/bk022",
      ),
      notes:
        "be quiet! BK022 product page identifies article number BK022. The catalogue source URL points to the separate Dark Rock 4 BK021 page; this registry uses the correct BK022 page.",
    }),
    record({
      componentId: "cooler-noctua-nh-u12s-redux",
      manufacturer: "Noctua",
      model: "NH-U12S redux",
      gtin: "9010018000207",
      source: noctua(
        "Noctua NH-U12S redux datasheet",
        "https://noctua.at/pub/media/blfa_files/infosheet/noctua_nh_u12s_redux_datasheet_en_web.pdf",
      ),
      notes:
        "Noctua datasheet names NH-U12S redux and lists EAN 9010018000207.",
    }),
    record({
      componentId: "case-fan-arctic-p12-pwm",
      manufacturer: "ARCTIC",
      model: "P12 PWM",
      manufacturerPartNumber: "ACFAN00119A",
      gtin: "4895213701389",
      source: arctic("https://www.arctic.de/en/P12-PWM/ACFAN00119A"),
      notes:
        "ARCTIC product page identifies article number ACFAN00119A and lists EAN 4895213701389.",
    }),
    record({
      componentId: "case-fan-arctic-p14-pwm",
      manufacturer: "ARCTIC",
      model: "ACFAN00124A",
      manufacturerPartNumber: "ACFAN00124A",
      gtin: "4895213701556",
      source: arctic("https://www.arctic.de/en/P14-PWM/ACFAN00124A"),
      notes:
        "ARCTIC product page identifies article number ACFAN00124A and lists EAN 4895213701556.",
    }),
    record({
      componentId: "case-fan-corsair-af120-elite",
      manufacturer: "Corsair",
      model: "AF120 ELITE",
      manufacturerPartNumber: "CO-9050141-WW",
      source: corsair(
        "https://www.corsair.com/us/en/p/case-fans/co-9050141-ww/af120-elite-120mm-pwm-fan-co-9050141-ww",
      ),
      notes:
        "Corsair product page identifies the AF120 ELITE by SKU CO-9050141-WW.",
    }),
    record({
      componentId: "case-fan-noctua-nf-a12x25-pwm",
      manufacturer: "Noctua",
      model: "NF-A12x25 PWM",
      gtin: "9010018100396",
      source: noctua(
        "Noctua NF-A12x25 PWM datasheet",
        "https://noctua.at/pub/media/blfa_files/infosheet/noctua_nf_a12x25_pwm_datasheet_en_web_3.pdf",
      ),
      notes:
        "Noctua datasheet names NF-A12x25 PWM and lists EAN 9010018100396.",
    }),
    record({
      componentId: "case-fan-noctua-nf-a14-pwm",
      manufacturer: "Noctua",
      model: "NF-A14 PWM",
      gtin: "4716123314981",
      source: noctua(
        "Noctua NF-A14 PWM datasheet",
        "https://noctua.at/pub/media/blfa_files/infosheet/noctua_nf_a14_pwm_datasheet_en_web_3.pdf",
      ),
      notes: "Noctua datasheet names NF-A14 PWM and lists EAN 4716123314981.",
    }),
    record({
      componentId: "case-fan-noctua-nf-a12x15-pwm",
      manufacturer: "Noctua",
      model: "NF-A12x15 PWM",
      gtin: "9010018100082",
      source: noctua(
        "Noctua NF-A12x15 PWM datasheet",
        "https://noctua.at/pub/media/blfa_files/infosheet/noctua_nf_a12x15_pwm_datasheet_en_web.pdf",
      ),
      notes:
        "Noctua datasheet names NF-A12x15 PWM and lists EAN 9010018100082.",
    }),
  ],
};

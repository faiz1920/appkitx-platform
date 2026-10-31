/*
 * Reviewed product identity evidence for the M10.9 and M10.10 registries.
 *
 * M10.9 records were checked against a manufacturer page or document on
 * 2026-10-31. M10.10 records were checked the same day against the exact
 * manufacturer source named on each record.
 *
 * This is source verification, not human approval: every record is
 * deliberately marked `humanReview: "not-reviewed"` because no named human has
 * independently approved it.
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
  SourceVerificationMethod,
} from "../pricing/identity-registry";

const ACCESSED_AT = "2026-10-31T16:53:34.000Z";
const SOURCE_VERIFIED_AT = "2026-10-31T16:54:00.000Z";
const SOURCE_VERIFIED_BY = "opencode-m10.9";

const M10_10_ACCESSED_AT = "2026-10-31T18:26:35.000Z";
const M10_10_VERIFIED_AT = "2026-10-31T18:26:36.000Z";
const M10_10_VERIFIED_BY = "opencode-m10.10";

function page(
  name: string,
  url: string,
  accessedAt = ACCESSED_AT,
): IdentitySource {
  return { type: "manufacturer-page", name, url, accessedAt };
}

function document(
  name: string,
  url: string,
  accessedAt = ACCESSED_AT,
): IdentitySource {
  return {
    type: "manufacturer-document",
    name,
    url,
    accessedAt,
  };
}

type RecordInput = {
  componentId: string;
  manufacturer: string;
  model: string;
  manufacturerPartNumber?: string | null;
  gtin?: string | null;
  region?: string | null;
  source: IdentitySource;
  notes: string;
  verifiedAt?: string;
  verifiedBy?: string;
  method?: SourceVerificationMethod;
};

function record(input: RecordInput): CatalogueIdentifierRecord {
  return {
    componentId: input.componentId,
    manufacturer: input.manufacturer,
    model: input.model,
    manufacturerPartNumber: input.manufacturerPartNumber ?? null,
    gtin: input.gtin ?? null,
    region: input.region ?? null,
    source: input.source,
    sourceVerification: {
      status: "source-verified",
      method: input.method ?? "automated-manufacturer-evidence-check",
      verifiedBy: input.verifiedBy ?? SOURCE_VERIFIED_BY,
      verifiedAt: input.verifiedAt ?? SOURCE_VERIFIED_AT,
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

function m10_10Record(input: RecordInput): CatalogueIdentifierRecord {
  return record({
    ...input,
    verifiedAt: M10_10_VERIFIED_AT,
    verifiedBy: M10_10_VERIFIED_BY,
  });
}

const corsair = (url: string): IdentitySource =>
  page("Corsair product page", url);
const gskill = (url: string): IdentitySource =>
  page("G.SKILL product specification", url);
const arctic = (url: string): IdentitySource =>
  page("ARCTIC product page", url);
const noctua = (name: string, url: string): IdentitySource =>
  document(name, url);

const corsairM10_10 = (url: string): IdentitySource =>
  page("Corsair product page", url, M10_10_ACCESSED_AT);
const amd = (name: string, url: string): IdentitySource =>
  page(name, url, M10_10_ACCESSED_AT);
const intel = (url: string): IdentitySource =>
  page("Intel ARK ordering and compliance", url, M10_10_ACCESSED_AT);
const coolerMaster = (url: string): IdentitySource =>
  page("Cooler Master product page", url, M10_10_ACCESSED_AT);
const lianLi = (url: string): IdentitySource =>
  page("Lian Li product specification", url, M10_10_ACCESSED_AT);
const nzxt = (name: string, url: string): IdentitySource =>
  document(name, url, M10_10_ACCESSED_AT);

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
    m10_10Record({
      componentId: "cpu-amd-ryzen-5-5600",
      manufacturer: "AMD",
      model: "100-100000927BOX",
      manufacturerPartNumber: "100-100000927BOX",
      source: amd(
        "AMD processor specifications",
        "https://www.amd.com/en/products/specifications/processors.html",
      ),
      notes:
        "AMD processor specifications table row for the Ryzen 5 5600 lists Product ID Boxed 100-100000927BOX.",
    }),
    m10_10Record({
      componentId: "cpu-amd-ryzen-7-5700x",
      manufacturer: "AMD",
      model: "100-100000926WOF",
      manufacturerPartNumber: "100-100000926WOF",
      source: amd(
        "AMD processor specifications",
        "https://www.amd.com/en/products/specifications/processors.html",
      ),
      notes:
        "AMD processor specifications table row for the Ryzen 7 5700X lists Product ID Boxed 100-100000926WOF.",
    }),
    m10_10Record({
      componentId: "cpu-amd-ryzen-9-5950x",
      manufacturer: "AMD",
      model: "100-100000059WOF",
      manufacturerPartNumber: "100-100000059WOF",
      source: amd(
        "AMD Ryzen 9 5950X product page",
        "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-9-5950x.html",
      ),
      notes:
        "AMD Ryzen 9 5950X product page lists Product ID Boxed 100-100000059WOF.",
    }),
    m10_10Record({
      componentId: "cpu-amd-ryzen-5-7600",
      manufacturer: "AMD",
      model: "100-100001015BOX",
      manufacturerPartNumber: "100-100001015BOX",
      source: amd(
        "AMD Ryzen 5 7600 product page",
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html",
      ),
      notes:
        "AMD Ryzen 5 7600 product page lists Product ID Boxed 100-100001015BOX.",
    }),
    m10_10Record({
      componentId: "cpu-amd-ryzen-7-7800x3d",
      manufacturer: "AMD",
      model: "100-100000910WOF",
      manufacturerPartNumber: "100-100000910WOF",
      source: amd(
        "AMD Ryzen 7 7800X3D product page",
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html",
      ),
      notes:
        "AMD Ryzen 7 7800X3D product page lists Product ID Boxed 100-100000910WOF.",
    }),
    m10_10Record({
      componentId: "cpu-amd-ryzen-9-7900x",
      manufacturer: "AMD",
      model: "100-100000589WOF",
      manufacturerPartNumber: "100-100000589WOF",
      source: amd(
        "AMD Ryzen 9 7900X product page",
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7900x.html",
      ),
      notes:
        "AMD Ryzen 9 7900X product page lists Product ID Boxed 100-100000589WOF.",
    }),
    m10_10Record({
      componentId: "cpu-amd-ryzen-9-7950x",
      manufacturer: "AMD",
      model: "100-100000514WOF",
      manufacturerPartNumber: "100-100000514WOF",
      source: amd(
        "AMD Ryzen 9 7950X product page",
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7950x.html",
      ),
      notes:
        "AMD Ryzen 9 7950X product page lists Product ID Boxed 100-100000514WOF.",
    }),
    m10_10Record({
      componentId: "cpu-intel-core-i5-12400f",
      manufacturer: "Intel",
      model: "BX8071512400F",
      manufacturerPartNumber: "BX8071512400F",
      source: intel(
        "https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/ordering.html",
      ),
      notes:
        "Intel ARK ordering page lists Boxed Ordering Code BX8071512400F for the Core i5-12400F.",
    }),
    m10_10Record({
      componentId: "cpu-intel-core-i5-13600k",
      manufacturer: "Intel",
      model: "BX8071513600K",
      manufacturerPartNumber: "BX8071513600K",
      source: intel(
        "https://www.intel.com/content/www/us/en/products/sku/230493/intel-core-i513600k-processor-24m-cache-up-to-5-10-ghz/ordering.html",
      ),
      notes:
        "Intel ARK ordering page lists Boxed Ordering Code BX8071513600K for the Core i5-13600K.",
    }),
    m10_10Record({
      componentId: "cpu-intel-core-i5-14600k",
      manufacturer: "Intel",
      model: "BX8071514600K",
      manufacturerPartNumber: "BX8071514600K",
      source: intel(
        "https://www.intel.com/content/www/us/en/products/sku/236799/intel-core-i5-processor-14600k-24m-cache-up-to-5-30-ghz/ordering.html",
      ),
      notes:
        "Intel ARK ordering page lists Boxed Ordering Code BX8071514600K for the Core i5-14600K.",
    }),
    m10_10Record({
      componentId: "cpu-intel-core-i7-13700k",
      manufacturer: "Intel",
      model: "BX8071513700K",
      manufacturerPartNumber: "BX8071513700K",
      source: intel(
        "https://www.intel.com/content/www/us/en/products/sku/230500/intel-core-i713700k-processor-30m-cache-up-to-5-40-ghz/ordering.html",
      ),
      notes:
        "Intel ARK ordering page lists Boxed Ordering Code BX8071513700K for the Core i7-13700K.",
    }),
    m10_10Record({
      componentId: "cpu-intel-core-i9-13900k",
      manufacturer: "Intel",
      model: "BX8071513900K",
      manufacturerPartNumber: "BX8071513900K",
      source: intel(
        "https://www.intel.com/content/www/us/en/products/sku/230496/intel-core-i913900k-processor-36m-cache-up-to-5-80-ghz/ordering.html",
      ),
      notes:
        "Intel ARK ordering page lists Boxed Ordering Code BX8071513900K for the Core i9-13900K.",
    }),
    m10_10Record({
      componentId: "cpu-intel-core-i9-14900k",
      manufacturer: "Intel",
      model: "BX8071514900K",
      manufacturerPartNumber: "BX8071514900K",
      source: intel(
        "https://www.intel.com/content/www/us/en/products/sku/236773/intel-core-i9-processor-14900k-36m-cache-up-to-6-00-ghz/ordering.html",
      ),
      notes:
        "Intel ARK ordering page lists Boxed Ordering Code BX8071514900K for the Core i9-14900K.",
    }),
    m10_10Record({
      componentId: "cpu-intel-core-ultra-7-265k",
      manufacturer: "Intel",
      model: "BX80768265K",
      manufacturerPartNumber: "BX80768265K",
      source: intel(
        "https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/ordering.html",
      ),
      notes:
        "Intel ARK ordering page lists Boxed Ordering Code BX80768265K for the Core Ultra 7 265K.",
    }),
    m10_10Record({
      componentId: "psu-corsair-cv650",
      manufacturer: "Corsair",
      model: "CP-9020211",
      manufacturerPartNumber: "CP-9020211-NA",
      region: "US",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/psu/cp-9020211-na/cv-series-cv650-650-watt-80-plus-bronze-certified-psu-cp-9020211-na",
      ),
      notes:
        "Corsair US product page displays SKU CP-9020211-NA. The catalogue model is the base CP-9020211; only the North American SKU is recorded.",
    }),
    m10_10Record({
      componentId: "psu-corsair-cx550",
      manufacturer: "Corsair",
      model: "CP-9020277",
      manufacturerPartNumber: "CP-9020277-NA",
      region: "US",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/psu/cp-9020277-na/cx-series-cx550-550-watt-80-plus-bronze-atx-power-supply-cp-9020277-na",
      ),
      notes:
        "Corsair US product page displays SKU CP-9020277-NA. The catalogue model is the base CP-9020277; only the North American SKU is recorded.",
    }),
    m10_10Record({
      componentId: "psu-corsair-sf600",
      manufacturer: "Corsair",
      model: "CP-9020182",
      manufacturerPartNumber: "CP-9020182-NA",
      region: "US",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/psu/cp-9020182-na/sf-series-sf600-600-watt-80-plus-platinum-certified-high-performance-sfx-psu-cp-9020182-na",
      ),
      notes:
        "Corsair US product page displays SKU CP-9020182-NA. The catalogue model is the base CP-9020182; only the North American SKU is recorded.",
    }),
    m10_10Record({
      componentId: "psu-corsair-rm750x-2021",
      manufacturer: "Corsair",
      model: "CP-9020199",
      manufacturerPartNumber: "CP-9020199-NA",
      region: "US",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/psu/cp-9020199-na/rmx-series-rm750x-750-watt-80-plus-gold-fully-modular-atx-psu-cp-9020199-na",
      ),
      notes:
        "Corsair US product page displays SKU CP-9020199-NA. The catalogue model is the base CP-9020199; only the North American SKU is recorded.",
    }),
    m10_10Record({
      componentId: "psu-corsair-rm850e-2023",
      manufacturer: "Corsair",
      model: "CP-9020263",
      manufacturerPartNumber: "CP-9020263-NA",
      region: "US",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/psu/cp-9020263-na/rme-series-rm850e-fully-modular-low-noise-atx-power-supply-cp-9020263-na",
      ),
      notes:
        "Corsair US product page displays SKU CP-9020263-NA. The catalogue model is the base CP-9020263; only the North American SKU is recorded.",
    }),
    m10_10Record({
      componentId: "psu-corsair-rm1000x-2021",
      manufacturer: "Corsair",
      model: "CP-9020201",
      manufacturerPartNumber: "CP-9020201-NA",
      region: "US",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/psu/cp-9020201-na/rmx-series-rm1000x-1000-watt-80-plus-gold-fully-modular-atx-psu-cp-9020201-na",
      ),
      notes:
        "Corsair US product page displays SKU CP-9020201-NA. The catalogue model is the base CP-9020201; only the North American SKU is recorded.",
    }),
    m10_10Record({
      componentId: "case-corsair-4000d-airflow",
      manufacturer: "Corsair",
      model: "CC-9011200-WW",
      manufacturerPartNumber: "CC-9011200-WW",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/pc-cases/cc-9011200-ww/4000d-airflow-tempered-glass-mid-tower-atx-case-black",
      ),
      notes:
        "Corsair product page displays SKU CC-9011200-WW for the black 4000D AIRFLOW.",
    }),
    m10_10Record({
      componentId: "case-corsair-5000d-airflow",
      manufacturer: "Corsair",
      model: "CC-9011210-WW",
      manufacturerPartNumber: "CC-9011210-WW",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/pc-cases/cc-9011210-ww/5000d-airflow-tempered-glass-mid-tower-atx-case-black",
      ),
      notes:
        "Corsair product page displays SKU CC-9011210-WW for the black 5000D AIRFLOW.",
    }),
    m10_10Record({
      componentId: "case-corsair-7000d-airflow",
      manufacturer: "Corsair",
      model: "CC-9011218-WW",
      manufacturerPartNumber: "CC-9011218-WW",
      source: corsairM10_10(
        "https://www.corsair.com/us/en/p/pc-cases/cc-9011218-ww/7000d-airflow-full-tower-atx-case-black",
      ),
      notes:
        "Corsair product page displays SKU CC-9011218-WW for the black 7000D AIRFLOW.",
    }),
    m10_10Record({
      componentId: "case-nzxt-h7-flow",
      manufacturer: "NZXT",
      model: "CM-H72FB-01",
      manufacturerPartNumber: "CM-H72FB-01",
      gtin: "5056547205502",
      source: nzxt(
        "NZXT H7 Flow (2024) specification",
        "https://support.nzxt.com/hc/en-us/articles/40379376386203-H7-Flow-2024-Specs",
      ),
      notes:
        "NZXT H7 Flow (2024) specification lists Model Number CM-H72FB-01 (Black), EAN 5056547205502 and UPC 810074845557.",
    }),
    m10_10Record({
      componentId: "case-cooler-master-masterbox-q300l",
      manufacturer: "Cooler Master",
      model: "MCB-Q300L-KANN-S00",
      manufacturerPartNumber: "MCB-Q300L-KANN-S00",
      source: coolerMaster(
        "https://www.coolermaster.com/en-us/products/masterbox-q300l.html",
      ),
      notes:
        "Cooler Master product page lists Model Number MCB-Q300L-KANN-S00.",
    }),
    m10_10Record({
      componentId: "case-lian-li-o11-dynamic-evo",
      manufacturer: "Lian Li",
      model: "O11DEX",
      manufacturerPartNumber: "O11DEX",
      source: lianLi("https://lian-li.com/product/o11-dynamic-evo/"),
      notes:
        "Lian Li O11 Dynamic EVO specification lists MODEL NO. O11DEX for the black variant; O11DEW and O11DEG are separate variants and are not represented.",
    }),
  ],
};

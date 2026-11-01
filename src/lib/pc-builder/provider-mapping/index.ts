/*
 * Public API for the provider-independent product mapping foundation (M10.12).
 *
 * Pure TypeScript: no network access, credentials, retailer clients, scraping,
 * price, stock or offer fields. Synthetic fixtures live outside this module.
 */

export * from "./types";
export * from "./provider-product";
export * from "./matching";
export * from "./mapping";
export * from "./audit";
export * from "./adapter";
export * from "./fingerprint";

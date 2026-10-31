/*
 * Public API for the provider-independent PC Builder pricing domain (M10.7).
 *
 * Catalogue compatibility/recommendation modules must not import commercial
 * prices directly. Future integration should use this contract explicitly and
 * keep price sorting separate from compatibility or recommendation scoring.
 */

export * from "./types";
export * from "./money";
export * from "./regions";
export * from "./sellers";
export * from "./product-matching";
export * from "./freshness";
export * from "./availability";
export * from "./offers";
export * from "./aggregation";
export * from "./budget";
export * from "./provider";
export * from "./labels";

/**
 * @file src/services/rfqService.ts
 * @description Barrel re-export for backward compatibility.
 *              All exports are re-exported from focused sub-modules so that
 *              existing imports (`import { X } from '../services/rfqService'`)
 *              continue to work without any changes.
 */

export * from "./rfq/seed";
export * from "./rfq/subscriptions";
export * from "./rfq/mutations";
export * from "./masterData";

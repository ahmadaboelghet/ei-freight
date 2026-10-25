/**
 * @file createShipment.validator.ts
 * @description Pure validation logic for the `createShipment` callable payload.
 *              No Firebase imports here — keeps this file unit-testable in isolation.
 */

import {
  ShipmentMode,
  ShipmentType,
  RoutingPreference,
  IncotermsCode,
  Address,
} from "../models/firestore.types";

// ─────────────────────────────────────────────────────────────
// CONSTANTS (kept here to avoid circular deps with types)
// ─────────────────────────────────────────────────────────────

const VALID_MODES: ShipmentMode[] = ["sea", "air", "road", "multimodal"];
const VALID_SEA_TYPES: ShipmentType[] = ["FCL", "LCL", "Reefer", "DangerousGoods", "Oversized", "FlatRack", "OpenTop"];
const VALID_ROAD_TYPES: ShipmentType[] = ["FTL", "LTL"];
const VALID_ROUTING: RoutingPreference[] = ["direct", "transit"];
const VALID_INCOTERMS: IncotermsCode[] = [
  "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP",
  "FAS", "FOB", "CFR", "CIF",
];
const VALID_CONTAINER_TYPES = ["20GP", "40GP", "40HC", "45HC", "20RF", "40RF"];
const MAX_WEIGHT_KG = 500_000;
const MAX_VOLUME_CBM = 10_000;

// ─────────────────────────────────────────────────────────────
// PAYLOAD INTERFACE
// ─────────────────────────────────────────────────────────────

export interface CreateShipmentPayload {
  // Origin & Destination
  origin: {
    label: string;
    city: string;
    governorate: string;
    country: string;
    street?: string;
    postalCode?: string;
    coordinates?: { latitude: number; longitude: number };
  };
  destination: {
    label: string;
    city: string;
    governorate: string;
    country: string;
    street?: string;
    postalCode?: string;
    coordinates?: { latitude: number; longitude: number };
  };

  // Transport mode
  mode: ShipmentMode;

  // Cargo — common
  cargo: {
    description: string;
    hsCode?: string;
    weightKg: number;
    volumeCbm?: number;
    packagingType?: string;
    quantity?: number;
    isHazardous?: boolean;
    requiresRefrigeration?: boolean;
    temperatureMin?: number;
    temperatureMax?: number;
    stackable?: boolean;
    incoterms?: IncotermsCode;
    routingPreference?: RoutingPreference;
  };

  // Cargo — sea specific (required when mode === "sea")
  seaDetails?: {
    shipmentType: "FCL" | "LCL";
    containerType?: string;
    containerCount?: number;
  };

  // Cargo — road specific (required when mode === "road")
  roadDetails?: {
    shipmentType: "FTL" | "LTL";
    truckType?: string;
  };

  // Optional client notes
  clientNotes?: string;
}

// ─────────────────────────────────────────────────────────────
// VALIDATION RESULT
// ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

function isNonEmptyString(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `"${fieldName}" must be a non-empty string.`;
  }
  return null;
}

function isPositiveNumber(value: unknown, fieldName: string): string | null {
  if (typeof value !== "number" || value <= 0 || !Number.isFinite(value)) {
    return `"${fieldName}" must be a positive finite number.`;
  }
  return null;
}

function validateAddress(
  addr: unknown,
  prefix: string
): string[] {
  const errs: string[] = [];
  if (!addr || typeof addr !== "object") {
    errs.push(`"${prefix}" must be a valid address object.`);
    return errs;
  }
  const a = addr as Record<string, unknown>;
  for (const required of ["label", "city", "governorate", "country"]) {
    const err = isNonEmptyString(a[required], `${prefix}.${required}`);
    if (err) errs.push(err);
  }
  if (typeof a["country"] === "string" && !/^[A-Z]{2}$/.test(a["country"])) {
    errs.push(`"${prefix}.country" must be a valid ISO 3166-1 alpha-2 code (e.g. "EG").`);
  }
  if (a["coordinates"] !== undefined) {
    const c = a["coordinates"] as Record<string, unknown>;
    if (
      typeof c?.latitude !== "number" ||
      c.latitude < -90 ||
      c.latitude > 90
    ) {
      errs.push(`"${prefix}.coordinates.latitude" must be between -90 and 90.`);
    }
    if (
      typeof c?.longitude !== "number" ||
      c.longitude < -180 ||
      c.longitude > 180
    ) {
      errs.push(`"${prefix}.coordinates.longitude" must be between -180 and 180.`);
    }
  }
  return errs;
}

// ─────────────────────────────────────────────────────────────
// MAIN VALIDATOR
// ─────────────────────────────────────────────────────────────

export function validateCreateShipmentPayload(
  data: unknown
): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Request body must be a non-null object."] };
  }

  const p = data as Partial<CreateShipmentPayload>;

  // ── 1. Addresses ──────────────────────────────────────────
  errors.push(...validateAddress(p.origin, "origin"));
  errors.push(...validateAddress(p.destination, "destination"));

  // Origin and destination must differ
  if (
    p.origin?.city === p.destination?.city &&
    p.origin?.country === p.destination?.country
  ) {
    errors.push("Origin and destination cannot be the same city/country.");
  }

  // ── 2. Mode ───────────────────────────────────────────────
  if (!p.mode || !VALID_MODES.includes(p.mode)) {
    errors.push(
      `"mode" must be one of: ${VALID_MODES.join(", ")}.`
    );
  }

  // ── 3. Cargo — common fields ─────────────────────────────
  if (!p.cargo || typeof p.cargo !== "object") {
    errors.push('"cargo" must be a valid object.');
  } else {
    const c = p.cargo;
    const descErr = isNonEmptyString(c.description, "cargo.description");
    if (descErr) errors.push(descErr);

    const weightErr = isPositiveNumber(c.weightKg, "cargo.weightKg");
    if (weightErr) errors.push(weightErr);
    else if (c.weightKg > MAX_WEIGHT_KG) {
      errors.push(`"cargo.weightKg" cannot exceed ${MAX_WEIGHT_KG.toLocaleString()} kg.`);
    }

    if (c.volumeCbm !== undefined) {
      const volErr = isPositiveNumber(c.volumeCbm, "cargo.volumeCbm");
      if (volErr) errors.push(volErr);
      else if (c.volumeCbm > MAX_VOLUME_CBM) {
        errors.push(`"cargo.volumeCbm" cannot exceed ${MAX_VOLUME_CBM.toLocaleString()} m³.`);
      }
    }

    if (c.incoterms && !VALID_INCOTERMS.includes(c.incoterms)) {
      errors.push(`"cargo.incoterms" must be one of: ${VALID_INCOTERMS.join(", ")}.`);
    }

    if (c.routingPreference && !VALID_ROUTING.includes(c.routingPreference)) {
      errors.push(`"cargo.routingPreference" must be one of: ${VALID_ROUTING.join(", ")}.`);
    }

    if (c.requiresRefrigeration) {
      if (c.temperatureMin === undefined || c.temperatureMax === undefined) {
        errors.push(
          '"cargo.temperatureMin" and "cargo.temperatureMax" are required when refrigeration is true.'
        );
      } else if (c.temperatureMin >= c.temperatureMax) {
        errors.push(
          '"cargo.temperatureMin" must be strictly less than "cargo.temperatureMax".'
        );
      }
    }

    if (c.quantity !== undefined) {
      if (!Number.isInteger(c.quantity) || c.quantity < 1) {
        errors.push('"cargo.quantity" must be a positive integer.');
      }
    }
  }

  // ── 4. Mode-specific validations ─────────────────────────
  if (p.mode === "sea") {
    if (!p.seaDetails) {
      errors.push('"seaDetails" is required when mode is "sea".');
    } else {
      if (!VALID_SEA_TYPES.includes(p.seaDetails.shipmentType as ShipmentType)) {
        errors.push(
          `"seaDetails.shipmentType" must be one of: ${VALID_SEA_TYPES.join(", ")}.`
        );
      }
      if (p.seaDetails.shipmentType === "FCL") {
        if (p.seaDetails.containerType && !VALID_CONTAINER_TYPES.includes(p.seaDetails.containerType)) {
          errors.push(
            `"seaDetails.containerType" must be one of: ${VALID_CONTAINER_TYPES.join(", ")}.`
          );
        }
        if (p.seaDetails.containerCount !== undefined) {
          if (!Number.isInteger(p.seaDetails.containerCount) || p.seaDetails.containerCount < 1) {
            errors.push('"seaDetails.containerCount" must be a positive integer.');
          }
        }
      }
    }
  }

  if (p.mode === "road") {
    if (!p.roadDetails) {
      errors.push('"roadDetails" is required when mode is "road".');
    } else if (!VALID_ROAD_TYPES.includes(p.roadDetails.shipmentType as ShipmentType)) {
      errors.push(
        `"roadDetails.shipmentType" must be one of: ${VALID_ROAD_TYPES.join(", ")}.`
      );
    }
  }

  // ── 5. Optional string fields ─────────────────────────────
  if (p.clientNotes !== undefined && typeof p.clientNotes !== "string") {
    errors.push('"clientNotes" must be a string.');
  }

  return { valid: errors.length === 0, errors };
}

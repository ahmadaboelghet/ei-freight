/**
 * @file shipment.service.ts
 * @description Pure business logic for shipment operations.
 *              This layer owns ALL Firestore writes/reads for shipments.
 *              Controllers/handlers must NEVER touch Firestore directly.
 */

import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import {
  ShipmentDocument,
  ShipmentStatus,
  LifecycleStage,
  CargoCommon,
  SeaCargoSpecific,
  AirCargoSpecific,
  RoadCargoSpecific,
  Address,
  AuditMeta,
  UsagePeriodDocument,
} from "../models/firestore.types";
import { CreateShipmentPayload } from "../validators/createShipment.validator";

// ─────────────────────────────────────────────────────────────
// COLLECTIONS
// ─────────────────────────────────────────────────────────────

const db = () => getFirestore();

const COL = {
  SHIPMENTS: "shipments",
  USERS: "users",
  AUDIT_LOG: "auditLog",
  USAGE_PERIODS: "usagePeriods",
  NOTIFICATIONS: "notifications",
} as const;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Generates a human-readable reference number, e.g. "EI-2024-00042". */
async function generateReferenceNo(): Promise<string> {
  const year = new Date().getFullYear();
  const counterRef = db()
    .collection("_counters")
    .doc(`shipment-${year}`);

  const nextSeq = await db().runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists ? (snap.data()!.seq as number) : 0;
    const next = current + 1;
    tx.set(counterRef, { seq: next }, { merge: true });
    return next;
  });

  return `EI-${year}-${String(nextSeq).padStart(5, "0")}`;
}

/** Derives the canonical lifecycle stage from a raw status string. */
function canonicalLifecycleStage(status: ShipmentStatus): LifecycleStage {
  const map: Partial<Record<ShipmentStatus, LifecycleStage>> = {
    draft: "request",
    submitted: "request",
    admin_review: "request",
    clarification_required: "request",
    matching: "rfq",
    matching_exception: "rfq",
    dispatched: "rfq",
    collecting_quotes: "rfq",
    quotes_received: "offer",
    commercial_review: "offer",
    offers_sent: "quotation",
    client_declined_all: "quotation",
    selected: "approved",
    awarded: "approved",
    in_progress: "in_progress",
    completed: "history",
    cancelled: "history",
    expired: "history",
  };
  return map[status] ?? "request";
}

/** Builds the AuditMeta block. */
function buildMeta(uid: string): AuditMeta {
  const now = Timestamp.now();
  return { createdAt: now, updatedAt: now, createdBy: uid, updatedBy: uid };
}

/** Maps a raw coordinate pair from the payload to our GeoPoint type (or undefined). */
function toGeoPoint(
  coords?: { latitude: number; longitude: number }
) {
  return coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined;
}

/** Normalises an address from the payload into our Address type. */
function toAddress(raw: CreateShipmentPayload["origin"]): Address {
  return {
    label: raw.label.trim(),
    city: raw.city.trim(),
    governorate: raw.governorate.trim(),
    country: raw.country.toUpperCase(),
    ...(raw.street ? { street: raw.street.trim() } : {}),
    ...(raw.postalCode ? { postalCode: raw.postalCode.trim() } : {}),
    ...(raw.coordinates ? { coordinates: toGeoPoint(raw.coordinates) } : {}),
  };
}

// ─────────────────────────────────────────────────────────────
// USAGE QUOTA SERVICE (internal helper)
// ─────────────────────────────────────────────────────────────

/** Returns the current month key "YYYY-MM". */
function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Atomically checks and increments the monthly shipment quota for a client.
 * Throws if the limit is reached or the client record doesn't exist.
 */
async function checkAndIncrementQuota(
  clientId: string,
  rfqId: string
): Promise<void> {
  const clientRef = db().collection(COL.USERS).doc(clientId);
  const key = monthKey();
  const periodId = `${clientId}:${key}`;
  const periodRef = db().collection(COL.USAGE_PERIODS).doc(periodId);

  await db().runTransaction(async (tx) => {
    const [clientSnap, periodSnap] = await Promise.all([
      tx.get(clientRef),
      tx.get(periodRef),
    ]);

    if (!clientSnap.exists) {
      throw new Error(`Client "${clientId}" not found.`);
    }

    const client = clientSnap.data()!;
    const limitEnabled = client.limitEnabled !== false;
    const limit: number = client.monthlyShipmentLimit ?? 0;

    if (!limitEnabled || limit === 0) return; // unlimited — skip check

    const period = periodSnap.exists
      ? (periodSnap.data() as UsagePeriodDocument)
      : null;
    const currentUsed = period?.currentUsed ?? 0;

    if (currentUsed >= limit) {
      throw new Error(
        `Monthly shipment quota reached (${currentUsed}/${limit}). ` +
          "Please contact EI Freight to increase your limit."
      );
    }

    // Idempotency key to prevent double-counting on retries
    const eventKey = `submitted:${rfqId}`;
    const alreadyRecorded = period?.events?.some((e) => e.key === eventKey) ?? false;
    if (alreadyRecorded) return;

    const usageEvent = {
      key: eventKey,
      type: "submitted",
      rfqId,
      quantity: 1,
      actorId: clientId,
      timestamp: Timestamp.now(),
      reason: "New shipment request created",
    };

    if (periodSnap.exists) {
      tx.update(periodRef, {
        events: FieldValue.arrayUnion(usageEvent),
        currentUsed: FieldValue.increment(1),
        totalSubmitted: FieldValue.increment(1),
      });
    } else {
      tx.set(periodRef, {
        id: periodId,
        clientId,
        monthKey: key,
        baseAllowance: limit,
        events: [usageEvent],
        totalSubmitted: 1,
        totalConverted: 0,
        totalOverrides: 0,
        currentUsed: 1,
      } satisfies UsagePeriodDocument);
    }

    // Mirror the used counter on the client document for fast UI reads
    tx.update(clientRef, {
      monthlyShipmentUsed: FieldValue.increment(1),
    });
  });
}

// ─────────────────────────────────────────────────────────────
// PUBLIC SERVICE METHODS
// ─────────────────────────────────────────────────────────────

export interface CreateShipmentInput {
  payload: CreateShipmentPayload;
  clientId: string;
  clientType: "personal" | "business";
  requestSource: ShipmentDocument["requestSource"];
}

export interface CreateShipmentResult {
  shipmentId: string;
  referenceNo: string;
}

/**
 * Creates a new Shipment document in Firestore.
 *
 * Steps:
 *  1. Generate a unique reference number via an atomic counter.
 *  2. Check & increment the client's monthly quota.
 *  3. Build the full ShipmentDocument.
 *  4. Write to Firestore and write the first audit log entry.
 *  5. Return the new document ID and human-readable reference.
 */
export async function createShipment(
  input: CreateShipmentInput
): Promise<CreateShipmentResult> {
  const { payload, clientId, clientType, requestSource } = input;

  // 1. Reference number
  const referenceNo = await generateReferenceNo();

  // 2. Firestore doc ref with auto-generated ID
  const shipmentRef = db().collection(COL.SHIPMENTS).doc();
  const shipmentId = shipmentRef.id;

  // 3. Quota check (throws on limit exceeded)
  await checkAndIncrementQuota(clientId, shipmentId);

  // 4. Assemble the document
  const now = Timestamp.now();
  const initialStatus: ShipmentStatus = "draft";
  const initialStage: LifecycleStage = canonicalLifecycleStage(initialStatus);

  // ── Cargo common ─────────────────────────────────────────
  const cargoCommon: CargoCommon = {
    description: payload.cargo.description.trim(),
    weightKg: payload.cargo.weightKg,
    ...(payload.cargo.hsCode ? { hsCode: payload.cargo.hsCode.trim() } : {}),
    ...(payload.cargo.volumeCbm !== undefined ? { volumeCbm: payload.cargo.volumeCbm } : {}),
    ...(payload.cargo.packagingType ? { packagingType: payload.cargo.packagingType } : {}),
    ...(payload.cargo.quantity !== undefined ? { quantity: payload.cargo.quantity } : {}),
    ...(payload.cargo.isHazardous !== undefined ? { isHazardous: payload.cargo.isHazardous } : {}),
    ...(payload.cargo.requiresRefrigeration !== undefined
      ? {
          requiresRefrigeration: payload.cargo.requiresRefrigeration,
          ...(payload.cargo.temperatureMin !== undefined && payload.cargo.temperatureMax !== undefined
            ? {
                temperatureRangeC: {
                  min: payload.cargo.temperatureMin,
                  max: payload.cargo.temperatureMax,
                },
              }
            : {}),
        }
      : {}),
    ...(payload.cargo.stackable !== undefined ? { stackable: payload.cargo.stackable } : {}),
    ...(payload.cargo.incoterms ? { incoterms: payload.cargo.incoterms } : {}),
    ...(payload.cargo.routingPreference ? { routingPreference: payload.cargo.routingPreference } : {}),
  };

  // ── Mode-specific cargo ───────────────────────────────────
  let shipmentSpecific:
    | SeaCargoSpecific
    | AirCargoSpecific
    | RoadCargoSpecific
    | undefined;

  if (payload.mode === "sea" && payload.seaDetails) {
    shipmentSpecific = {
      shipmentType: payload.seaDetails.shipmentType,
      ...(payload.seaDetails.containerType
        ? { containerType: payload.seaDetails.containerType as SeaCargoSpecific["containerType"] }
        : {}),
      ...(payload.seaDetails.containerCount !== undefined
        ? { containerCount: payload.seaDetails.containerCount }
        : {}),
    } as SeaCargoSpecific;
  } else if (payload.mode === "road" && payload.roadDetails) {
    shipmentSpecific = {
      shipmentType: payload.roadDetails.shipmentType,
      ...(payload.roadDetails.truckType ? { truckType: payload.roadDetails.truckType } : {}),
    } as RoadCargoSpecific;
  }

  // ── Full document ─────────────────────────────────────────
  const shipmentDoc: ShipmentDocument = {
    id: shipmentId,
    referenceNo,
    clientId,
    clientType,
    requestSource,
    origin: toAddress(payload.origin),
    destination: toAddress(payload.destination),
    mode: payload.mode,
    shipmentCommon: cargoCommon,
    ...(shipmentSpecific ? { shipmentSpecific } : {}),
    status: initialStatus,
    lifecycleStage: initialStage,
    transitionHistory: [
      {
        eventType: "created",
        previousStatus: "draft",
        newStatus: "draft",
        previousLifecycleStage: "request",
        newLifecycleStage: "request",
        actorId: clientId,
        actorRole: "client",
        timestamp: now,
        metadata: { requestSource },
      },
    ],
    autoMatchedProviderIds: [],
    manuallyInvitedProviderIds: [],
    quotes: [],
    offerBatches: [],
    ...(payload.clientNotes ? { adminNotes: payload.clientNotes } : {}),
    meta: buildMeta(clientId),
  };

  // 5. Atomic write: shipment + audit log
  const auditRef = db().collection(COL.AUDIT_LOG).doc();
  const batch = db().batch();

  batch.set(shipmentRef, shipmentDoc);

  batch.set(auditRef, {
    id: auditRef.id,
    action: "createShipment",
    resourceType: "shipment",
    resourceId: shipmentId,
    actorId: clientId,
    actorRole: "client",
    after: {
      status: initialStatus,
      lifecycleStage: initialStage,
      referenceNo,
    },
    metadata: { requestSource, mode: payload.mode },
    timestamp: now,
  });

  await batch.commit();

  return { shipmentId, referenceNo };
}

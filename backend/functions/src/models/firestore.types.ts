/**
 * @file firestore.types.ts
 * @description Canonical TypeScript interfaces that mirror the Firestore schema.
 *              Every collection document is typed here. Use these types across
 *              Controllers, Services, and Validators to guarantee consistency.
 */

import { Timestamp } from "firebase-admin/firestore";

// ─────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────

/** Geographic coordinate pair stored on every address. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** A full address with optional resolved coordinates. */
export interface Address {
  label: string;          // e.g. "Port Said Dry Port"
  street?: string;
  city: string;
  governorate: string;    // Egyptian governorate or equivalent admin-level-1
  country: string;        // ISO 3166-1 alpha-2, e.g. "EG"
  postalCode?: string;
  coordinates?: GeoPoint;
}

/** Monetary amount with currency ISO code. */
export interface Money {
  amount: number;         // always stored in smallest denomination (cents/piastres)
  currency: string;       // ISO 4217, e.g. "EGP", "USD"
}

/** Reusable audit block appended to every top-level document. */
export interface AuditMeta {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;      // uid of the actor who created the document
  updatedBy: string;      // uid of the last actor who mutated the document
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /users/{userId}
// ─────────────────────────────────────────────────────────────

export type UserRole = "client" | "provider" | "staff" | "admin";
export type UserStatus =
  | "incomplete"
  | "pending_approval"
  | "approved"
  | "suspended"
  | "blocked";

export type ClientType = "personal" | "business";

export interface UserDocument {
  uid: string;             // === Firebase Auth UID, also the Firestore document ID
  email: string;
  phone?: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  lang: "en" | "ar";      // preferred UI language

  // ── Client-specific ──────────────────────────────────────
  clientType?: ClientType;
  companyName?: string;
  taxId?: string;
  commercialRegistrationNo?: string;
  monthlyShipmentLimit?: number;   // max RFQs/month (0 = unlimited)
  monthlyShipmentUsed?: number;

  // ── Provider-specific ────────────────────────────────────
  providerType?: "sea" | "air" | "road" | "multimodal";
  supportedServices?: string[];    // e.g. ["FCL","LCL","FTL"]
  operatingCountries?: string[];   // ISO 3166-1 alpha-2 codes
  agreementSigned?: boolean;
  agreementSignedAt?: Timestamp;

  // ── Staff/Admin ──────────────────────────────────────────
  internalRole?: "operations" | "super_admin";

  // ── Documents (Firestore Storage references) ─────────────
  documents?: {
    commercialRegistration?: string;  // Storage path
    taxCard?: string;
    licenses?: string;
    signedAgreement?: string;
  };

  // ── Notification tokens ──────────────────────────────────
  fcmTokens?: string[];

  meta: AuditMeta;
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /shipments/{shipmentId}
// ─────────────────────────────────────────────────────────────

export type ShipmentMode = "sea" | "air" | "road" | "multimodal";
export type ShipmentType = "FCL" | "LCL" | "FTL" | "LTL" | "Reefer" | "DangerousGoods" | "Oversized" | "FlatRack" | "OpenTop";
export type RoutingPreference = "direct" | "transit";
export type IncotermsCode = "EXW" | "FCA" | "CPT" | "CIP" | "DAP" | "DPU" | "DDP" | "FAS" | "FOB" | "CFR" | "CIF";

// ── Raw Status values (granular FSM states) ─────────────────
export type ShipmentStatus =
  | "draft"
  | "submitted"
  | "admin_review"
  | "clarification_required"
  | "matching"
  | "matching_exception"
  | "dispatched"
  | "collecting_quotes"
  | "quotes_received"
  | "commercial_review"
  | "offers_sent"
  | "client_declined_all"
  | "selected"
  | "awarded"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

// ── High-level lifecycle buckets (for UI pipeline tabs) ─────
export type LifecycleStage =
  | "request"
  | "rfq"
  | "offer"
  | "quotation"
  | "approved"
  | "in_progress"
  | "history";

// ── Cargo details ────────────────────────────────────────────
export interface CargoCommon {
  description: string;
  hsCode?: string;
  weightKg: number;
  volumeCbm?: number;
  packagingType?: string;       // e.g. "pallets", "boxes", "drums"
  quantity?: number;
  isHazardous?: boolean;
  requiresRefrigeration?: boolean;
  temperatureRangeC?: { min: number; max: number };
  stackable?: boolean;
  incoterms?: IncotermsCode;
  routingPreference?: RoutingPreference;
}

export interface SeaCargoSpecific {
  shipmentType: "FCL" | "LCL";
  containerType?: "20GP" | "40GP" | "40HC" | "45HC" | "20RF" | "40RF";
  containerCount?: number;
}

export interface AirCargoSpecific {
  chargeableWeightKg?: number;
}

export interface RoadCargoSpecific {
  shipmentType: "FTL" | "LTL";
  truckType?: string;
}

// ── Offer / Quote sub-document ───────────────────────────────
export interface QuoteCharge {
  label: string;
  labelAr?: string;
  amount: Money;
  isIncluded: boolean;
}

export interface Quote {
  id: string;                    // nanoid within the array
  providerId: string;
  providerName: string;
  mode: ShipmentMode;
  routingType: RoutingPreference;
  originPort?: string;
  destinationPort?: string;
  transitPorts?: string[];
  transitDays: number;
  validityDate: string;          // ISO 8601 date "YYYY-MM-DD"
  freightCharge: Money;
  originCharges: QuoteCharge[];
  destinationCharges: QuoteCharge[];
  totalAmount: Money;
  notes?: string;
  notesAr?: string;
  status: "active" | "expired" | "rejected" | "selected";
  submittedAt: Timestamp;
}

// ── Offer Batch (what admin sends to client) ─────────────────
export interface OfferBatch {
  id: string;
  sentAt: Timestamp;
  sentBy: string;                // admin uid
  quoteIds: string[];
  clientNotes?: string;
  clientNotesAr?: string;
  status: "draft" | "sent";
}

// ── Transition history entry ─────────────────────────────────
export interface TransitionRecord {
  eventType: string;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  previousLifecycleStage: LifecycleStage;
  newLifecycleStage: LifecycleStage;
  actorId: string;
  actorRole: UserRole;
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
}

// ── Main document ────────────────────────────────────────────
export interface ShipmentDocument {
  id: string;                    // Firestore document ID (auto-generated)
  referenceNo: string;           // human-readable, e.g. "EI-2024-00042"
  clientId: string;              // /users/{clientId}
  clientType: ClientType;

  // Request source
  requestSource:
    | "client"
    | "admin_registered_client"
    | "admin_external_client"
    | "operation_registered_client";

  // Route
  origin: Address;
  destination: Address;

  // Mode & Cargo
  mode: ShipmentMode;
  shipmentCommon: CargoCommon;
  shipmentSpecific?: SeaCargoSpecific | AirCargoSpecific | RoadCargoSpecific;

  // FSM
  status: ShipmentStatus;
  lifecycleStage: LifecycleStage;
  transitionHistory: TransitionRecord[];

  // Provider matching
  autoMatchedProviderIds: string[];
  manuallyInvitedProviderIds: string[];
  dispatchedAt?: Timestamp;

  // Quotes & Offers
  quotes: Quote[];
  offerBatches: OfferBatch[];

  // Selection & award
  selectedQuoteId?: string;      // id inside quotes[]
  selected?: string;             // alias kept for FSM compat
  awardedAt?: Timestamp;

  // Execution
  executionStartedAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancellationReason?: string;

  // Financials (populated when quotation is sent)
  agreedAmount?: Money;

  // Optional admin notes
  adminNotes?: string;
  clarificationRequest?: string;
  clarificationResponse?: string;

  meta: AuditMeta;
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /shipments/{shipmentId}/trackingEvents/{eventId}
// (Sub-collection for granular location history)
// ─────────────────────────────────────────────────────────────

export type TrackingEventType =
  | "pickup_scheduled"
  | "picked_up"
  | "at_origin_port"
  | "departed_origin"
  | "in_transit"
  | "arrived_destination_port"
  | "customs_clearance"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export interface TrackingEventDocument {
  id: string;
  shipmentId: string;
  eventType: TrackingEventType;
  description: string;
  descriptionAr?: string;
  location?: Address;
  coordinates?: GeoPoint;
  recordedAt: Timestamp;
  recordedBy: string;            // uid of reporter (driver app / staff)
  attachments?: string[];        // Storage paths (photos, POD scan)
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /providers/{providerId}
// (Extended profile — mirrors /users but separated for queries)
// ─────────────────────────────────────────────────────────────

export interface ProviderCapabilityDocument {
  uid: string;                   // === /users/{uid}
  companyName: string;
  modes: ShipmentMode[];
  services: ShipmentType[];
  operatingCountries: string[];
  supportedIncoterms: IncotermsCode[];
  fleetSize?: number;
  certifications?: string[];
  averageRating?: number;        // 1-5, computed aggregate
  totalCompletedShipments?: number;
  isActive: boolean;
  meta: AuditMeta;
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /notifications/{notificationId}
// ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "rfq_submitted"
  | "rfq_dispatched"
  | "new_rfq"
  | "offer_received"
  | "quotation_sent"
  | "quote_selected"
  | "execution_status"
  | "account_approved"
  | "account_suspended"
  | "clarification_requested"
  | "general";

export interface NotificationDocument {
  id: string;
  recipientId: string;           // uid
  recipientRole: UserRole;
  type: NotificationType;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  shipmentId?: string;           // related shipment (if any)
  isRead: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
  eventKey: string;              // idempotency key, e.g. "rfq-submitted:SHP-001"
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /auditLog/{logId}
// ─────────────────────────────────────────────────────────────

export interface AuditLogDocument {
  id: string;
  action: string;                // e.g. "transitionRfq:dispatch"
  resourceType: string;          // "shipment" | "user" | "provider"
  resourceId: string;
  actorId: string;
  actorRole: UserRole;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
  ipAddress?: string;
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /locationMaster/{countryId}
// (Static reference data — countries, ports, cities)
// ─────────────────────────────────────────────────────────────

export interface PortDocument {
  code: string;                  // UN/LOCODE e.g. "EGPSD"
  name: string;
  nameAr?: string;
  type: "sea" | "air" | "dry";
  coordinates?: GeoPoint;
}

export interface CountryDocument {
  id: string;                    // ISO 3166-1 alpha-2
  name: string;
  nameAr?: string;
  isActive: boolean;
  ports: PortDocument[];
}

// ─────────────────────────────────────────────────────────────
// COLLECTION: /usagePeriods/{periodId}  (clientId:YYYY-MM)
// Tracks monthly shipment quota consumption per client
// ─────────────────────────────────────────────────────────────

export type UsageEventType = "submitted" | "converted" | "override";

export interface UsageEvent {
  key: string;                   // idempotency key
  type: UsageEventType;
  rfqId: string;
  quantity: number;
  actorId: string;
  timestamp: Timestamp;
  reason?: string;
}

export interface UsagePeriodDocument {
  id: string;                    // "{clientId}:{YYYY-MM}"
  clientId: string;
  monthKey: string;              // "YYYY-MM"
  baseAllowance: number;
  events: UsageEvent[];
  // Derived (updated on write by trigger / service):
  totalSubmitted: number;
  totalConverted: number;
  totalOverrides: number;
  currentUsed: number;           // = totalSubmitted - totalConverted - totalOverrides
}

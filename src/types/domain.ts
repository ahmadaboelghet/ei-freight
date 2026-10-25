/**
 * @file src/types/domain.ts
 * @description Shared domain types used across the React app.
 *              Mirrors the canonical Firestore interfaces from Step 1 —
 *              but typed for client-side use (Timestamps become ISO strings).
 */

// ─────────────────────────────────────────────────────────────
// USER / AUTH
// ─────────────────────────────────────────────────────────────

export type UserRole = "client" | "provider" | "staff" | "admin";
export type UserStatus =
  | "incomplete"
  | "pending_approval"
  | "approved"
  | "suspended"
  | "blocked";
export type ClientType = "personal" | "business";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  internalRole?: "operations" | "super_admin";
  clientType?: ClientType;
  companyName?: string;
  phone?: string;
  commercialRegistrationNo?: string;
  taxId?: string;
  providerType?: "sea" | "air" | "road" | "multimodal";
  supportedServices?: string[];
  operatingCountries?: string[];
  monthlyShipmentLimit?: number;
  monthlyShipmentUsed?: number;
  lang: "en" | "ar";
}

// ─────────────────────────────────────────────────────────────
// SHIPMENT & RFQ DOMAIN
// ─────────────────────────────────────────────────────────────

export type ShipmentMode = "sea" | "air" | "road" | "multimodal";
export type RoutingPreference = "direct" | "transit";
export type IncotermsCode =
  | "EXW" | "FCA" | "CPT" | "CIP" | "DAP"
  | "DPU" | "DDP" | "FAS" | "FOB" | "CFR" | "CIF";

export type ShipmentStatus =
  | "draft" | "submitted" | "admin_review" | "clarification_required"
  | "matching" | "matching_exception" | "dispatched" | "collecting_quotes"
  | "quotes_received" | "commercial_review" | "offers_sent"
  | "client_declined_all" | "selected" | "awarded"
  | "in_progress" | "completed" | "cancelled" | "expired";

export type LifecycleStage =
  | "request" | "rfq" | "offer" | "quotation"
  | "approved" | "in_progress" | "history";

export interface RfqQuote {
  id: string;
  providerId: string;
  providerCompany: string;
  providerName?: string;
  freightRate: number;
  originCharges: number;
  destCharges: number;
  totalPrice: number;
  sellingPrice?: number;
  currency: string;
  transitDays: number;
  routingType: "direct" | "transit";
  validUntil: string;
  carrierNotes?: string;
  rating?: number;
  sentToClient?: boolean;
  status: "active" | "selected" | "declined";
  submittedAt: string;
}

export interface RfqRecord {
  id: string;
  requestId?: string;
  client: string; // client ID / UID
  clientName: string;
  clientCompany: string;
  mode: ShipmentMode;
  actualTransportMode?: string;
  shipmentType?: string;
  containerType?: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  route: string;
  cargo: string;
  weight: string;
  weightKg: number;
  volumeCbm?: number;
  stage: LifecycleStage;
  status: ShipmentStatus;
  statusLabelEn?: string;
  statusLabelAr?: string;
  created: string;
  createdAt: string;
  dispatchedProviders: string[];
  quotes: RfqQuote[];
  clientNotes?: string;
  adminNotes?: string;
  offersSentToClient?: boolean;
  selectedQuoteId?: string;
  selectedQuote?: RfqQuote;
  completedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// CREATE SHIPMENT PAYLOAD
// ─────────────────────────────────────────────────────────────

export interface AddressInput {
  label: string;
  city: string;
  governorate: string;
  country: string; // ISO 3166-1 alpha-2
  street?: string;
  postalCode?: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface CargoInput {
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
}

export interface SeaDetailsInput {
  shipmentType: "FCL" | "LCL";
  containerType?: "20GP" | "40GP" | "40HC" | "45HC" | "20RF" | "40RF";
  containerCount?: number;
}

export interface RoadDetailsInput {
  shipmentType: "FTL" | "LTL";
  truckType?: string;
}

export interface CreateShipmentPayload {
  origin: AddressInput;
  destination: AddressInput;
  mode: ShipmentMode;
  cargo: CargoInput;
  seaDetails?: SeaDetailsInput;
  roadDetails?: RoadDetailsInput;
  clientNotes?: string;
}

// ─────────────────────────────────────────────────────────────
// CALLABLE FUNCTION RESPONSES
// ─────────────────────────────────────────────────────────────

export interface CreateShipmentResponse {
  success: boolean;
  shipmentId: string;
  referenceNo: string;
  message: string;
}

export interface FunctionError {
  code: string;
  message: string;
  details?: unknown;
}

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

export interface DimensionSet {
  id: string;
  length: string;
  width: string;
  height: string;
  unit: "mm" | "cm" | "m";
}

export interface FclContainerRow {
  containerLineId: string;
  type: string;
  quantity: number | "";
  otherType?: string;
  dimensions?: DimensionSet[];
}

export interface CanonicalShipmentCommon {
  operationType: "import" | "export" | "";
  operatingCountryId: string;
  deliveryType: "arrival" | "address" | "";
  destinationCountryId: string;
  acceptableDestinationLocationIds: string[];
  destinationLocationId?: string;
  destinationAddress?: string;
  destinationLocationUrl?: string;
  incoterm: string;
  incotermPointType?: string;
  incotermCountryId?: string;
  incotermLocationId?: string;
  incotermAddress?: string;
  incotermLocationUrl?: string;
  acceptableDepartureLocationIds?: string[];
  exportDepartureType?: "port" | "airport" | "terminal" | "address" | "";
  exportDepartureAddress?: string;
  exportDepartureLocationUrl?: string;
  cargo: string;
  hsCode?: string;
  ready: string;
  routingPreference?: "direct" | "transit" | "both";
  notes?: string;
}

export interface CanonicalShipmentSpecific {
  shipmentType?: "fcl" | "lcl" | "ftl" | "ltl" | "";
  containers?: FclContainerRow[];
  overweightStatus?: "no_overweight" | "overweight" | "";
  cargoWeight?: string;
  grossWeight?: string;
  cargoVolume?: string;
  dimensions?: DimensionSet[];
  packageType?: "pallets" | "cartons" | "crates" | string;
  stackable?: boolean;
  dangerousGoods?: "yes" | "no";
  refrigeratedCargo?: "yes" | "no";
  requiredTemperature?: string;
  priority?: "high" | "medium" | "low";
  fclServicePreference?: "liner" | "nvocc" | "both";
  truckType?: string;
  preferredServiceLevel?: string;
  pickupDate?: string;
  deliveryDate?: string;
  oversized?: boolean;
  multiStop?: boolean;
  specialHandling?: string;
  liveAnimals?: boolean;
  freshFood?: boolean;
}

export interface CanonicalShipmentLeg {
  mode: "sea" | "air" | "road";
  shipmentType?: string;
  originCountryId: string;
  originLocationId: string;
  destinationCountryId: string;
  destinationLocationId: string;
  cargoWeight?: string;
  cargoVolume?: string;
  dimensions?: DimensionSet[];
  containers?: FclContainerRow[];
  overweightStatus?: "no_overweight" | "overweight" | "";
  packageType?: string;
  stackable?: boolean;
  dangerousGoods?: "yes" | "no";
  refrigeratedCargo?: "yes" | "no";
  requiredTemperature?: string;
  truckType?: string;
  priority?: "high" | "medium" | "low";
  legNotes?: string;
}

export interface CanonicalPaymentTerms {
  type: "cash" | "credit" | "";
  creditDays: number | null;
  billOfLadingType?: "original_bl" | "sea_waybill" | "telex_release" | "";
}

export interface CanonicalAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadedAt: string;
  storageReference?: string;
  runtimeId?: string;
  visibility?: "internal" | "invited_providers";
  status?: string;
  available?: boolean;
}

export interface CanonicalMsds {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  available: boolean;
  status?: string;
  storageReference?: string;
  visibility?: "invited_providers";
}

export interface CanonicalShipmentData {
  common: CanonicalShipmentCommon;
  specific: CanonicalShipmentSpecific;
  legs: CanonicalShipmentLeg[];
  paymentTerms: CanonicalPaymentTerms;
  attachments: CanonicalAttachment[];
  msds: CanonicalMsds[];
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
  originLocationId?: string;
  destination: string;
  destinationCode: string;
  destinationLocationId?: string;
  route: string;
  cargo: string;
  weight: string;
  weightKg: number;
  volumeCbm?: number;
  ready?: string;
  incoterm?: string;
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
  copiedFrom?: string | null;
  shipment?: CanonicalShipmentData;
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

/**
 * @file src/pages/dashboard/provider/types.ts
 * @description Types and domain models for the Service Provider (Carrier) workspace.
 */

import { ShipmentMode } from "../../../types/domain";

export interface ProviderQuoteDetail {
  id?: string;
  freightRate: number;
  originCharges: number;
  destCharges: number;
  totalPrice: number;
  transitDays: number;
  routingType: "direct" | "transit";
  validUntil: string;
  carrierNotes?: string;
  submittedAt?: string;
  status: "active" | "selected" | "declined";
}

export interface ProviderMatchedRfq {
  id: string;
  mode: ShipmentMode;
  modeLabel: string;
  modeIcon: string;
  route: string;
  origin: string;
  originCode?: string;
  destination: string;
  destinationCode?: string;
  cargo: string;
  weight: string;
  weightKg: number;
  containerType?: string;
  deadlineDays: number;
  hasSubmitted: boolean;
  mySubmittedPrice?: number;
  quote?: ProviderQuoteDetail;
}

export interface ProviderAnalyticsData {
  timePeriod: string;
  quotesSubmitted: number;
  quotesSelected: number;
  inProgress: number;
  completedShipments: number;
  grossVolumeText: string;
  winRateText: string;
  containersCount: number;
  responseRateText: string;
  chartData: Array<{
    period: string;
    submitted: number;
    selected: number;
  }>;
}

export interface ProviderCapabilities {
  companyName: string;
  isVerified: boolean;
  partnerType: string;
  scope: {
    import: boolean;
    export: boolean;
    liner: boolean;
    nvocc: boolean;
  };
  classification: "freight_forwarder" | "shipping_line" | "customs_broker" | "trucking" | "3pl";
  modes: {
    sea: boolean;
    air: boolean;
    road: boolean;
    multimodal: boolean;
  };
  servedCountries: string[];
  servedLocations: string[];
}

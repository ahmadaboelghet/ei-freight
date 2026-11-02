/**
 * @file src/components/forms/rfq/rfqLogic.ts
 * @description Pure domain business logic, validators, calculations, and catalog helpers
 *              extracted from EI_Freight.html and SUP PRO Specification v2.0.
 */

import {
  CanonicalShipmentCommon,
  CanonicalShipmentSpecific,
  CanonicalPaymentTerms,
  DimensionSet,
  FclContainerRow,
} from "../../../types/domain";
import { MasterLocation, MasterCountry } from "../../../services/masterData";

export const INCOTERMS_BY_MODE: Record<string, string[]> = {
  sea: ["EXW", "FCA", "FAS", "FOB"],
  air: ["EXW", "FCA", "FAS", "FOB"],
  road: ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DPU", "DAP", "DDP"],
  multimodal: ["EXW", "FCA", "CPT", "CIP", "DPU", "DAP", "DDP"],
};

export const INCOTERM_HELP: Record<string, { en: string; ar: string }> = {
  EXW: {
    en: "Goods are collected from the agreed supplier location.",
    ar: "يتم استلام البضاعة من موقع المورد المتفق عليه.",
  },
  FCA: {
    en: "The supplier hands the cargo to the carrier at the agreed point.",
    ar: "يسلّم المورد البضاعة للناقل في النقطة المتفق عليها.",
  },
  FAS: {
    en: "The supplier delivers the cargo alongside the vessel at the agreed loading port.",
    ar: "يسلّم المورد البضاعة بجانب السفينة في ميناء الشحن المتفق عليه.",
  },
  FOB: {
    en: "The supplier delivers the cargo on board at the loading port.",
    ar: "يسلّم المورد البضاعة على متن السفينة في ميناء الشحن.",
  },
  CFR: {
    en: "The contract includes cargo cost and freight to the destination port.",
    ar: "السعر يشمل تكلفة البضاعة والشحن حتى ميناء الوصول وفق شرط التعاقد.",
  },
  CIF: {
    en: "Freight and insurance are included to the destination port.",
    ar: "يشمل الشحن والتأمين حتى ميناء الوصول وفق شرط التعاقد.",
  },
  CPT: {
    en: "The supplier pays transport to the agreed point.",
    ar: "يتحمل المورد تكلفة النقل حتى النقطة المتفق عليها وفق شرط التعاقد.",
  },
  CIP: {
    en: "Transport and insurance are included to the agreed point.",
    ar: "يشمل النقل والتأمين حتى النقطة المتفق عليها وفق شرط التعاقد.",
  },
  DPU: {
    en: "The cargo is delivered unloaded at the agreed place.",
    ar: "يتم تسليم البضاعة مفرغة في المكان المتفق عليه.",
  },
  DAP: {
    en: "The cargo is delivered at the agreed place under DAP responsibilities.",
    ar: "يتم تسليم البضاعة في المكان المتفق عليه وفق مسؤوليات DAP.",
  },
  DDP: {
    en: "Delivery is to the agreed place under DDP; the service scope is reflected in the price.",
    ar: "يتم التسليم في المكان المتفق عليه وفق مسؤوليات DDP، ويُعكس نطاق الخدمة في السعر.",
  },
};

export const FCL_CONTAINER_CATALOG = [
  "20' GP",
  "40' GP",
  "40' HC",
  "Reefer",
  "Flat Rack",
  "Open Top",
  "RORO",
  "Other",
];

export const SPECIAL_EQUIPMENT = ["Reefer", "Flat Rack", "Open Top", "RORO"];

export const AIR_VOLUMETRIC_DIVISOR = 6000;

/**
 * Checks whether the physical destination is classified as a logistics Hub (Port / Airport)
 */
export function exportDestinationIsHub(
  c: CanonicalShipmentCommon,
  mode: string,
  locations: MasterLocation[]
): boolean {
  if (!c || c.deliveryType !== "arrival" || !c.destinationLocationId) return false;
  const loc = locations.find((x) => x.id === c.destinationLocationId);
  if (!loc) return false;
  if (mode === "sea") return loc.type === "port";
  if (mode === "air") return loc.type === "airport";
  return ["port", "airport"].includes(loc.type);
}

/**
 * Evaluates allowable Incoterms for Export shipments based on origin vs destination country
 * and Hub vs Non-Hub classification.
 */
export function exportIncoterms(
  mode: string,
  c: CanonicalShipmentCommon,
  locations: MasterLocation[]
): string[] {
  if (
    !c ||
    !c.operatingCountryId ||
    !c.destinationCountryId ||
    !c.deliveryType ||
    (c.deliveryType === "arrival" && !c.destinationLocationId)
  ) {
    return [];
  }
  const sameCountry = c.destinationCountryId === c.operatingCountryId;
  const isHub = exportDestinationIsHub(c, mode, locations);

  if (sameCountry) {
    return isHub ? ["FAS", "FOB"] : ["FCA"];
  }
  return isHub ? ["CFR", "CIF"] : ["CPT", "CIP", "DPU", "DAP", "DDP"];
}

/**
 * Evaluates available Incoterms for a given mode and operation type.
 * Note: Import Road strictly excludes DPU, DAP, DDP per Section 4.
 */
export function availableIncoterms(
  mode: string,
  c: CanonicalShipmentCommon,
  locations: MasterLocation[]
): string[] {
  if (c && c.operationType === "export") {
    return exportIncoterms(mode, c, locations);
  }
  const terms = INCOTERMS_BY_MODE[mode] || INCOTERMS_BY_MODE.road;
  if (c && c.operationType === "import" && mode === "road") {
    return terms.filter((term) => !["DPU", "DAP", "DDP"].includes(term));
  }
  return terms;
}

/**
 * Maps an Incoterm to its responsibility/pickup point type for Import
 */
export function incotermPointType(term: string): string {
  if (["EXW", "FCA"].includes(term)) return "supplier_pickup";
  if (["FAS", "FOB"].includes(term)) return "loading_port";
  if (["CFR", "CIF"].includes(term)) return "destination_port";
  if (["CPT", "CIP", "DPU"].includes(term)) return "named_place";
  if (["DAP", "DDP"].includes(term)) return "delivery_point";
  return "";
}

/**
 * Dimension helpers
 */
export function stableDimensionId(seed = "dim"): string {
  return `${seed}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function dimensionSetComplete(d?: DimensionSet): boolean {
  if (!d) return false;
  return (
    [d.length, d.width, d.height].every((v) => Number.isFinite(+v) && +v > 0) &&
    ["mm", "cm", "m"].includes(d.unit)
  );
}

export function dimensionSetActive(d?: DimensionSet): boolean {
  if (!d) return false;
  return ["length", "width", "height"].some((key) => String((d as any)[key] || "").trim() !== "");
}

/**
 * Computes Air Volumetric and Chargeable weights
 */
export function calculateAirWeights(
  grossWeightRaw: string | number,
  dimensions: DimensionSet[] = []
): { volumetricWeight: number; chargeableWeight: number | null } {
  const completeSets = dimensions.filter(dimensionSetComplete);
  const factorMap: Record<string, number> = { mm: 0.1, cm: 1, m: 100 };

  const volumetricWeight = completeSets.reduce((total, d) => {
    const factor = factorMap[d.unit] || 1;
    const l = +d.length * factor;
    const w = +d.width * factor;
    const h = +d.height * factor;
    return total + (l * w * h) / AIR_VOLUMETRIC_DIVISOR;
  }, 0);

  const roundedVolumetric = Math.round(volumetricWeight * 10) / 10;
  const numGross = parseFloat(String(grossWeightRaw || "").replace(/[^0-9.]/g, ""));
  const validGross = Number.isFinite(numGross) && numGross > 0 ? numGross : null;

  return {
    volumetricWeight: roundedVolumetric,
    chargeableWeight:
      validGross !== null
        ? Math.round(Math.max(validGross, roundedVolumetric) * 10) / 10
        : roundedVolumetric > 0
        ? roundedVolumetric
        : null,
  };
}

/**
 * Validation rules
 */
export function validateRfqBranches(c: CanonicalShipmentCommon, mode: string): string | null {
  if (!c.deliveryType) return "Physical destination type is required";
  if (!c.incoterm) return "Incoterm is required";

  if (c.deliveryType === "arrival") {
    if (!c.acceptableDestinationLocationIds || c.acceptableDestinationLocationIds.length === 0) {
      return "Select at least one accepted destination location";
    }
  } else if (c.deliveryType === "address") {
    if (!c.destinationAddress || !c.destinationAddress.trim()) {
      return "Written destination address is required";
    }
  }

  // Import Incoterm point
  if (c.operationType === "import") {
    const pointType = incotermPointType(c.incoterm);
    if (!c.incotermCountryId) return "Country for the Incoterm point is required";
    if (pointType === "loading_port") {
      if (!c.acceptableDepartureLocationIds || c.acceptableDepartureLocationIds.length === 0) {
        return "Select at least one acceptable departure port";
      }
    } else if (pointType === "destination_port") {
      if (!c.incotermLocationId) return "Select current arrival port";
    } else {
      if (!c.incotermAddress && !c.incotermLocationUrl) {
        return "Enter agreed pickup address or map link";
      }
    }
  } else if (c.operationType === "export") {
    if (!c.exportDepartureType) return "Select operational departure type";
    if (c.exportDepartureType !== "address") {
      if (!c.acceptableDepartureLocationIds || c.acceptableDepartureLocationIds.length === 0) {
        return "Select at least one acceptable operational departure location";
      }
    } else {
      if (!c.exportDepartureAddress && !c.exportDepartureLocationUrl) {
        return "Enter departure address or location link";
      }
    }
  }

  return null;
}

export function validateCargoDetails(
  specific: CanonicalShipmentSpecific,
  mode: string,
  isSeaFcl: boolean
): string | null {
  // Cargo Conditions
  if (specific.refrigeratedCargo === "yes" && !specific.requiredTemperature?.trim()) {
    return "Required temperature is mandatory for refrigerated cargo";
  }

  // Sea FCL
  if (mode === "sea" && isSeaFcl) {
    if (!specific.containers || specific.containers.length === 0) {
      return "At least one container row is required";
    }
    for (const row of specific.containers) {
      if (!row.type) return "Container type is required";
      if (!row.quantity || Number(row.quantity) < 1) return "Container quantity must be at least 1";
      if (row.type === "Other" && !row.otherType?.trim()) {
        return "Please specify the other container type";
      }
      if (row.type === "RORO") {
        const hasCompleteDim = (row.dimensions || []).some(dimensionSetComplete);
        if (!hasCompleteDim) return "RORO container requires at least one complete dimension set";
      }
    }

    if (!specific.overweightStatus) {
      return "Choose overweight status (No Overweight or Overweight)";
    }

    const has20Gp = specific.containers.some((r) => r.type === "20' GP");
    const isOverweight = specific.overweightStatus === "overweight";
    if (has20Gp || isOverweight) {
      const w = parseFloat(specific.cargoWeight || "");
      if (!Number.isFinite(w) || w <= 0) {
        return "Cargo weight is required for 20' GP or Overweight containers";
      }
    }

    if (!specific.fclServicePreference) {
      return "Select FCL service preference (Liner, NVOCC, or Both)";
    }
  }

  // Sea LCL
  if (mode === "sea" && !isSeaFcl) {
    const w = parseFloat(specific.cargoWeight || "");
    if (!Number.isFinite(w) || w <= 0) return "Cargo weight is required for LCL";
    const v = parseFloat(specific.cargoVolume || "");
    if (!Number.isFinite(v) || v <= 0) return "Cargo volume (CBM) is required for LCL";
    if (!(specific.dimensions || []).some(dimensionSetComplete)) {
      return "LCL requires at least one complete dimension set";
    }
    if (!specific.packageType) return "Packaging type is required for LCL";
    if (specific.stackable === undefined) return "Please indicate if cargo is stackable";
  }

  // Air
  if (mode === "air") {
    const g = parseFloat(specific.grossWeight || "");
    if (!Number.isFinite(g) || g <= 0) return "Gross weight is required for Air freight";
    if (!(specific.dimensions || []).some(dimensionSetComplete)) {
      return "Air freight requires at least one complete dimension set";
    }
    if (!specific.packageType) return "Packaging type is required for Air freight";
    if (specific.stackable === undefined) return "Please indicate if cargo is stackable";
    if (!specific.priority) return "Air priority level is required (High, Medium, Low)";
  }

  // Road FTL
  if (mode === "road" && specific.shipmentType === "ftl") {
    if (!specific.truckType?.trim()) return "Truck type is required for FTL";
    if (!specific.cargoVolume) return "Cargo volume is required for FTL";
    if (!specific.packageType) return "Packaging type is required";
    if (specific.stackable === undefined) return "Please indicate if cargo is stackable";
    if (!specific.pickupDate) return "Pickup date is required for FTL";
  }

  // Road LTL
  if (mode === "road" && specific.shipmentType === "ltl") {
    const w = parseFloat(specific.cargoWeight || "");
    if (!Number.isFinite(w) || w <= 0) return "Total cargo weight is required for LTL";
    const v = parseFloat(specific.cargoVolume || "");
    if (!Number.isFinite(v) || v <= 0) return "Total cargo volume is required for LTL";
    if (!(specific.dimensions || []).some(dimensionSetComplete)) {
      return "Road LTL requires at least one complete dimension set";
    }
    if (!specific.packageType) return "Packaging type is required";
    if (specific.stackable === undefined) return "Please indicate if cargo is stackable";
    if (!specific.pickupDate) return "Pickup date is required for LTL";
    if (!specific.preferredServiceLevel?.trim()) return "Preferred service level is required for LTL";
  }

  // Any started dimension set must be complete
  if (specific.dimensions && specific.dimensions.length > 0) {
    for (const d of specific.dimensions) {
      if (dimensionSetActive(d) && !dimensionSetComplete(d)) {
        return "Complete all dimensions (Length, Width, Height, Unit) for each started set";
      }
    }
  }

  return null;
}

export function validateFinancialTerms(
  paymentTerms: CanonicalPaymentTerms,
  mode: string
): string | null {
  if (mode === "sea" && !paymentTerms.billOfLadingType) {
    return "Bill of Lading type is required for Sea freight";
  }
  if (!paymentTerms.type) {
    return "Payment type (Cash or Credit) is required";
  }
  if (paymentTerms.type === "credit") {
    if (!paymentTerms.creditDays || paymentTerms.creditDays < 1) {
      return "Credit period days must be a positive integer";
    }
  }
  return null;
}

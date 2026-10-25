/**
 * @file src/services/rfq/mutations.ts
 * @description All Firestore write operations (mutations) for the EI Freight Platform:
 *              RFQ lifecycle, quotes, KYC, client limits, and master data management.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  RfqRecord,
  RfqQuote,
  LifecycleStage,
  ShipmentStatus,
  UserStatus,
} from "../../types/domain";
import { MasterCountry, MasterLocation } from "../masterData";

// ─────────────────────────────────────────────────────────────
// MUTATIONS (LIVE FIRESTORE WRITE OPERATIONS)
// ─────────────────────────────────────────────────────────────

/**
 * Step: Admin / Operations matches and dispatches RFQ to selected carriers.
 */
export async function dispatchRfq(rfqId: string, providerIds: string[]): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    await updateDoc(ref, {
      stage: "rfq" as LifecycleStage,
      status: "dispatched" as ShipmentStatus,
      dispatchedProviders: providerIds,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[dispatchRfq error]", err);
    throw err;
  }
}

/**
 * Step: Carrier submits a quote on a dispatched RFQ.
 */
export async function submitCarrierQuote(rfqId: string, quote: RfqQuote): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    // ✅ FIX: Use getDoc to fetch single document instead of getDocs (N+1 read eliminated)
    const rfqSnap = await getDoc(ref);
    const currentRfq = rfqSnap.exists() ? (rfqSnap.data() as RfqRecord) : undefined;
    const existingQuotes = currentRfq?.quotes || [];
    const updatedQuotes = [...existingQuotes.filter((q: RfqQuote) => q.id !== quote.id), quote];

    await updateDoc(ref, {
      quotes: updatedQuotes,
      stage: "offer" as LifecycleStage,
      status: "quotes_received" as ShipmentStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[submitCarrierQuote error]", err);
    throw err;
  }
}

/**
 * Step: Admin reviews received carrier quotes, sets commercial markup / note,
 * and sends an approved batch of 1–3 offers to the client.
 */
export async function sendOffersToClient(
  rfqId: string,
  selectedQuoteIds: string[],
  adminNotes: string
): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    // ✅ FIX: Use getDoc to fetch single document instead of getDocs (N+1 read eliminated)
    const rfqSnap = await getDoc(ref);
    const currentRfq = rfqSnap.exists() ? (rfqSnap.data() as RfqRecord) : undefined;
    const existingQuotes = currentRfq?.quotes || [];

    const updatedQuotes = existingQuotes.map((q: RfqQuote) => ({
      ...q,
      sentToClient: selectedQuoteIds.includes(q.id),
    }));

    await updateDoc(ref, {
      quotes: updatedQuotes,
      stage: "quotation" as LifecycleStage,
      status: "offers_sent" as ShipmentStatus,
      adminNotes,
      offersSentToClient: true,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[sendOffersToClient error]", err);
    throw err;
  }
}

/**
 * Step: Client selects and awards one of the received quotations.
 */
export async function awardQuote(rfqId: string, quoteId: string): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    // ✅ FIX: Use getDoc to fetch single document instead of getDocs (N+1 read eliminated)
    const rfqSnap = await getDoc(ref);
    const currentRfq = rfqSnap.exists() ? (rfqSnap.data() as RfqRecord) : undefined;
    const quote = currentRfq?.quotes.find((q: RfqQuote) => q.id === quoteId);

    await updateDoc(ref, {
      selectedQuoteId: quoteId,
      selectedQuote: quote || null,
      stage: "approved" as LifecycleStage,
      status: "selected" as ShipmentStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[awardQuote error]", err);
    throw err;
  }
}

/**
 * Step: Admin starts shipment execution and carrier coordination.
 */
export async function startExecution(rfqId: string): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    await updateDoc(ref, {
      stage: "in_progress" as LifecycleStage,
      status: "in_progress" as ShipmentStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[startExecution error]", err);
    throw err;
  }
}

/**
 * Step: Admin completes the shipment and archives it into History.
 */
export async function completeShipment(rfqId: string): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    await updateDoc(ref, {
      stage: "history" as LifecycleStage,
      status: "completed" as ShipmentStatus,
      completedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[completeShipment error]", err);
    throw err;
  }
}

/**
 * Step: Operations / Admin creates an assisted RFQ on behalf of a client.
 */
export async function createAssistedRfq(rfq: Partial<RfqRecord>): Promise<string> {
  try {
    const id = rfq.id || `REQ-A-${Date.now()}`;
    const newRecord: RfqRecord = {
      id,
      client: rfq.client || "client-atlas",
      clientName: rfq.clientName || "Nour Hassan",
      clientCompany: rfq.clientCompany || "Atlas Homeware",
      mode: rfq.mode || "sea",
      shipmentType: rfq.shipmentType || "FCL",
      containerType: rfq.containerType || "40HC",
      route: rfq.route || "ميناء بورسعيد، مصر ➔ ميناء جبل علي، الإمارات",
      origin: rfq.origin || "ميناء بورسعيد، مصر",
      originCode: rfq.originCode || "EG",
      destination: rfq.destination || "ميناء جبل علي، الإمارات",
      destinationCode: rfq.destinationCode || "AE",
      cargo: rfq.cargo || "Commercial assisted cargo",
      weight: rfq.weight || "10,000 kg",
      weightKg: rfq.weightKg || 10000,
      stage: "request",
      status: "admin_review",
      created: "اليوم",
      createdAt: new Date().toISOString(),
      dispatchedProviders: [],
      quotes: [],
      clientNotes: rfq.clientNotes || "",
    };

    await setDoc(doc(db, "rfqs", id), {
      ...newRecord,
      updatedAt: serverTimestamp(),
    });

    return id;
  } catch (err) {
    console.error("[createAssistedRfq error]", err);
    throw err;
  }
}

/**
 * Step: Admin updates KYC verification status for Client or Provider.
 */
export async function updateAccountKycStatus(
  collectionName: "clients" | "providers",
  accountId: string,
  newStatus: UserStatus
): Promise<void> {
  try {
    const ref = doc(db, collectionName, accountId);
    await updateDoc(ref, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[updateAccountKycStatus error]", err);
    throw err;
  }
}

/**
 * Step: Admin toggles 2-request monthly limit on a client account.
 */
export async function toggleClientLimit(clientId: string, limitEnabled: boolean): Promise<void> {
  try {
    const ref = doc(db, "clients", clientId);
    await updateDoc(ref, {
      limitEnabled,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[toggleClientLimit error]", err);
    throw err;
  }
}

/**
 * Step: Admin adds an Internal Commercial Offer (no provider identity).
 */
export async function addInternalOffer(
  rfqId: string,
  offerData: {
    freightPrice: number;
    currency: string;
    carrierName: string;
    etd: string;
    transit: string;
    freeTime?: string;
    validity?: string;
    notes?: string;
    dischargeCost?: number;
    dischargeCurrency?: string;
  }
): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    // ✅ FIX: Use getDoc to fetch single document instead of getDocs (N+1 read eliminated)
    const rfqSnap = await getDoc(ref);
    const currentRfq = rfqSnap.exists() ? (rfqSnap.data() as RfqRecord) : undefined;
    const existingQuotes = currentRfq?.quotes || [];

    const newInternalQuote: RfqQuote = {
      id: `INT-${rfqId}-${Date.now()}`,
      providerId: "internal",
      providerCompany: "Internal Offer (عرض داخلي)",
      freightRate: offerData.freightPrice,
      originCharges: 0,
      destCharges: offerData.dischargeCost || 0,
      totalPrice: offerData.freightPrice + (offerData.dischargeCost || 0),
      sellingPrice: offerData.freightPrice,
      currency: offerData.currency || "USD",
      transitDays: parseInt(offerData.transit) || 14,
      routingType: "direct",
      validUntil: offerData.validity || "2026-11-30",
      rating: 5.0,
      sentToClient: false,
      status: "active",
      submittedAt: new Date().toISOString(),
    };

    const updatedQuotes = [...existingQuotes, newInternalQuote];

    await updateDoc(ref, {
      quotes: updatedQuotes,
      stage: "offer" as LifecycleStage,
      status: "quotes_received" as ShipmentStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[addInternalOffer error]", err);
    throw err;
  }
}

/**
 * Step: Admin launches or updates Provider Final Call round.
 */
export async function startFinalCall(
  rfqId: string,
  countdownMinutes: number,
  visibleFields: string[],
  note?: string
): Promise<void> {
  try {
    const ref = doc(db, "rfqs", rfqId);
    const endsAt = new Date(Date.now() + countdownMinutes * 60000).toISOString();
    await updateDoc(ref, {
      finalCall: {
        active: true,
        status: "active",
        countdownMinutes,
        endsAt,
        finalCallEndsAt: endsAt,
        visibleFields,
        note: note || "",
        startedAt: new Date().toISOString(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[startFinalCall error]", err);
    throw err;
  }
}

/**
 * Add a new Master Country
 */
export async function addMasterCountry(country: MasterCountry): Promise<void> {
  const ref = doc(db, "countries", country.id.toUpperCase());
  await setDoc(ref, {
    ...country,
    id: country.id.toUpperCase(),
    active: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Add a new Master Location
 */
export async function addMasterLocation(loc: MasterLocation): Promise<void> {
  const ref = doc(db, "locations", loc.id);
  await setDoc(ref, {
    ...loc,
    active: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update an existing Master Location
 */
export async function updateMasterLocation(loc: MasterLocation): Promise<void> {
  const ref = doc(db, "locations", loc.id);
  await updateDoc(ref, {
    nameEn: loc.nameEn,
    nameAr: loc.nameAr,
    countryId: loc.countryId,
    type: loc.type,
    code: loc.code || "",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle Master Location active/inactive state
 */
export async function toggleMasterLocation(id: string, currentActive: boolean): Promise<void> {
  const ref = doc(db, "locations", id);
  await updateDoc(ref, {
    active: !currentActive,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reset monthly usage counter for all clients to 0
 */
export async function resetAllClientLimits(): Promise<void> {
  try {
    const clientsSnap = await getDocs(collection(db, "clients"));
    for (const d of clientsSnap.docs) {
      await updateDoc(doc(db, "clients", d.id), {
        used: 0,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("[resetAllClientLimits error]", err);
    throw err;
  }
}

/**
 * Reset monthly usage counter for a single client to 0
 */
export async function resetClientLimit(clientId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "clients", clientId), {
      used: 0,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[resetClientLimit error]", err);
    throw err;
  }
}

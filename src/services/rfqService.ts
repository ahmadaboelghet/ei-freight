/**
 * @file src/services/rfqService.ts
 * @description Real-time Firebase Firestore service for RFQ lifecycle, quotes,
 *              and account KYC verification for the EI Freight Platform.
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { RfqRecord, RfqQuote, LifecycleStage, ShipmentStatus, UserStatus } from "../types/domain";

// ─────────────────────────────────────────────────────────────
// PRE-SEEDED PROTOTYPE DATA
// Matches https://ei-freight-prototype.pages.dev/ exactly
// ─────────────────────────────────────────────────────────────

export const INITIAL_SEEDED_RFQS: RfqRecord[] = [
  {
    id: "REQ-P-1792591729749-E0ZB",
    client: "client-atlas",
    clientName: "Nour Hassan",
    clientCompany: "Atlas Homeware",
    mode: "sea",
    route: "فرانكفورت، ألمانيا ➔ فرانكفورت، ألمانيا",
    origin: "فرانكفورت، ألمانيا",
    originCode: "DE",
    destination: "فرانكفورت، ألمانيا",
    destinationCode: "DE",
    cargo: "vdlldfvcxfdfcf, dffdldlkdl",
    weight: "1,500 kg",
    weightKg: 1500,
    stage: "request",
    status: "matching",
    created: "اليوم",
    createdAt: new Date().toISOString(),
    dispatchedProviders: [],
    quotes: [],
  },
  {
    id: "RFQ-1048",
    client: "client-atlas",
    clientName: "Nour Hassan",
    clientCompany: "Atlas Homeware",
    mode: "sea",
    shipmentType: "FCL",
    containerType: "40HC",
    route: "ميناء شنغهاي، الصين ➔ ميناء الإسكندرية، مصر",
    origin: "ميناء شنغهاي، الصين",
    originCode: "CN",
    destination: "ميناء الإسكندرية، مصر",
    destinationCode: "EG",
    cargo: "Furniture components",
    weight: "12,500 kg",
    weightKg: 12500,
    stage: "offer",
    status: "quotes_received",
    created: "24 سبتمبر",
    createdAt: "2026-09-24T10:00:00Z",
    dispatchedProviders: ["provider-bluewave", "provider-silkroute", "provider-transmena"],
    quotes: [
      {
        id: "q-1048-1",
        providerId: "provider-bluewave",
        providerCompany: "BlueWave Logistics",
        freightRate: 1850,
        originCharges: 180,
        destCharges: 140,
        totalPrice: 2170,
        sellingPrice: 2350,
        currency: "USD",
        transitDays: 14,
        routingType: "direct",
        validUntil: "2026-11-15",
        rating: 4.9,
        sentToClient: true,
        status: "active",
        submittedAt: "2026-09-25T11:20:00Z",
      },
      {
        id: "q-1048-2",
        providerId: "provider-silkroute",
        providerCompany: "SilkRoute Forwarding",
        freightRate: 1650,
        originCharges: 170,
        destCharges: 160,
        totalPrice: 1980,
        sellingPrice: 2150,
        currency: "USD",
        transitDays: 18,
        routingType: "transit",
        validUntil: "2026-11-10",
        rating: 4.7,
        sentToClient: true,
        status: "active",
        submittedAt: "2026-09-25T14:10:00Z",
      },
      {
        id: "q-1048-3",
        providerId: "provider-transmena",
        providerCompany: "TransMENA Global",
        freightRate: 2100,
        originCharges: 190,
        destCharges: 150,
        totalPrice: 2440,
        sellingPrice: 2600,
        currency: "USD",
        transitDays: 12,
        routingType: "direct",
        validUntil: "2026-11-20",
        rating: 4.8,
        sentToClient: true,
        status: "active",
        submittedAt: "2026-09-26T09:45:00Z",
      },
    ],
  },
  {
    id: "RFQ-1049",
    client: "client-nile",
    clientName: "Omar Khalil",
    clientCompany: "Nile Fresh Foods",
    mode: "air",
    route: "مطار فرانكفورت، ألمانيا ➔ مطار القاهرة الدولي، مصر",
    origin: "مطار فرانكفورت، ألمانيا",
    originCode: "DE",
    destination: "مطار القاهرة الدولي، مصر",
    destinationCode: "EG",
    cargo: "Temperature-controlled food samples",
    weight: "450 kg",
    weightKg: 450,
    stage: "offer",
    status: "quotes_received",
    created: "25 سبتمبر",
    createdAt: "2026-09-25T12:00:00Z",
    dispatchedProviders: ["provider-falcon"],
    quotes: [
      {
        id: "q-1049-1",
        providerId: "provider-falcon",
        providerCompany: "Falcon Air Cargo",
        freightRate: 2800,
        originCharges: 220,
        destCharges: 180,
        totalPrice: 3200,
        sellingPrice: 3450,
        currency: "USD",
        transitDays: 3,
        routingType: "direct",
        validUntil: "2026-11-05",
        rating: 4.9,
        sentToClient: false,
        status: "active",
        submittedAt: "2026-09-26T15:30:00Z",
      },
    ],
  },
  {
    id: "RFQ-1050",
    client: "client-nile",
    clientName: "Omar Khalil",
    clientCompany: "Nile Fresh Foods",
    mode: "road",
    shipmentType: "FTL",
    route: "دبي، الإمارات العربية المتحدة ➔ الرياض، السعودية",
    origin: "دبي، الإمارات العربية المتحدة",
    originCode: "AE",
    destination: "الرياض، السعودية",
    destinationCode: "SA",
    cargo: "Retail fixtures",
    weight: "8,000 kg",
    weightKg: 8000,
    stage: "rfq",
    status: "admin_review",
    created: "25 Sep",
    createdAt: "2026-09-25T14:30:00Z",
    dispatchedProviders: ["provider-transmena"],
    quotes: [],
  },
  {
    id: "RFQ-1051",
    client: "client-delta",
    clientName: "Mariam Adel",
    clientCompany: "Delta MedTech",
    mode: "road",
    actualTransportMode: "multimodal",
    shipmentType: "Multimodal",
    route: "Shenzhen, CN ➔ Giza, EG",
    origin: "Shenzhen, CN",
    originCode: "CN",
    destination: "Giza, EG",
    destinationCode: "EG",
    cargo: "Medical device parts",
    weight: "1,250 kg",
    weightKg: 1250,
    stage: "request",
    status: "draft",
    created: "26 Sep",
    createdAt: "2026-09-26T10:00:00Z",
    dispatchedProviders: [],
    quotes: [],
    clientNotes: "Handle as high-value medical equipment components.",
  },
];

export interface ClientProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  clientType: "personal" | "business";
  industry: string;
  status: UserStatus;
  used: number;
  limit: number;
  limitEnabled: boolean;
}

export interface ProviderProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  classification: "carrier" | "freight_forwarder" | "agent";
  modes: ("sea" | "air" | "road" | "multimodal")[];
  countries: string[];
  docs: string;
  status: UserStatus;
  rating: number;
}

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: "client-atlas",
    name: "Nour Hassan",
    company: "Atlas Homeware",
    email: "nour@atlashomeware.com",
    phone: "+20 100 123 4567",
    clientType: "personal",
    industry: "commercial",
    status: "approved",
    used: 2,
    limit: 10,
    limitEnabled: true,
  },
  {
    id: "client-nile",
    name: "Omar Khalil",
    company: "Nile Fresh Foods",
    email: "omar@nilefreshfoods.com",
    phone: "+20 111 987 6543",
    clientType: "business",
    industry: "agricultural",
    status: "approved",
    used: 2,
    limit: 10,
    limitEnabled: false,
  },
  {
    id: "client-delta",
    name: "Mariam Adel",
    company: "Delta MedTech",
    email: "mariam@deltamedtech.com",
    phone: "+20 122 555 4321",
    clientType: "business",
    industry: "medical",
    status: "pending_approval",
    used: 0,
    limit: 10,
    limitEnabled: true,
  },
];

export const INITIAL_PROVIDERS: ProviderProfile[] = [
  {
    id: "provider-bluewave",
    name: "Ahmed Farouk",
    company: "BlueWave Logistics",
    email: "ahmed@bluewavelogistics.com",
    phone: "+20 102 333 4444",
    classification: "carrier",
    modes: ["sea"],
    countries: ["EG", "AE", "SA", "NL", "CN"],
    docs: "Fleet License #EG-MAR-4019 · Tax Card Attached",
    status: "approved",
    rating: 4.9,
  },
  {
    id: "provider-silkroute",
    name: "Tarek Mansour",
    company: "SilkRoute Forwarding",
    email: "tarek@silkrouteforwarding.com",
    phone: "+20 100 888 9999",
    classification: "freight_forwarder",
    modes: ["sea", "air"],
    countries: ["EG", "CN", "AE", "DE"],
    docs: "IATA Member #49102 · Commercial Reg. #391029",
    status: "approved",
    rating: 4.7,
  },
  {
    id: "provider-falcon",
    name: "Hesham Zaki",
    company: "Falcon Air Cargo",
    email: "hesham@falconaircargo.com",
    phone: "+20 114 777 6666",
    classification: "carrier",
    modes: ["air"],
    countries: ["EG", "AE", "DE"],
    docs: "Air Cargo Operating Certificate #AOC-882",
    status: "approved",
    rating: 4.8,
  },
  {
    id: "provider-transmena",
    name: "Sara Nabil",
    company: "TransMENA Road Freight",
    email: "sara@transmenaroad.com",
    phone: "+20 120 444 5555",
    classification: "carrier",
    modes: ["road"],
    countries: ["EG", "SA", "AE"],
    docs: "Fleet Operating License #EG-TR-8812",
    status: "approved",
    rating: 4.8,
  },
  {
    id: "provider-redsea",
    name: "Karim Fouad",
    company: "RedSea Express Forwarding",
    email: "karim@redseaexpress.com",
    phone: "+20 109 111 2222",
    classification: "agent",
    modes: ["sea"],
    countries: ["EG", "SA"],
    docs: "Port Agency License #EG-PSA-1029",
    status: "pending_approval",
    rating: 4.5,
  },
];

// ─────────────────────────────────────────────────────────────
// REAL FIRESTORE SEEDING & SYNC LOGIC
// ─────────────────────────────────────────────────────────────

let isSeeding = false;

/**
 * Seeds initial RFQs, Clients, and Providers into Firestore if not present.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const rfqsSnap = await getDocs(collection(db, "rfqs"));
    if (rfqsSnap.empty) {
      console.info("[EI Freight Firestore] Seeding initial prototype RFQs...");
      for (const rfq of INITIAL_SEEDED_RFQS) {
        await setDoc(doc(db, "rfqs", rfq.id), {
          ...rfq,
          updatedAt: serverTimestamp(),
        });
      }
    }

    const clientsSnap = await getDocs(collection(db, "clients"));
    if (clientsSnap.empty) {
      console.info("[EI Freight Firestore] Seeding initial prototype Clients...");
      for (const client of INITIAL_CLIENTS) {
        await setDoc(doc(db, "clients", client.id), {
          ...client,
          updatedAt: serverTimestamp(),
        });
      }
    }

    const providersSnap = await getDocs(collection(db, "providers"));
    if (providersSnap.empty) {
      console.info("[EI Freight Firestore] Seeding initial prototype Providers...");
      for (const provider of INITIAL_PROVIDERS) {
        await setDoc(doc(db, "providers", provider.id), {
          ...provider,
          updatedAt: serverTimestamp(),
        });
      }
    }

    const countriesSnap = await getDocs(collection(db, "countries"));
    if (countriesSnap.empty) {
      console.info("[EI Freight Firestore] Seeding initial prototype Countries...");
      for (const country of DEFAULT_COUNTRIES) {
        await setDoc(doc(db, "countries", country.id), {
          ...country,
          updatedAt: serverTimestamp(),
        });
      }
    }

    const locationsSnap = await getDocs(collection(db, "locations"));
    if (locationsSnap.empty) {
      console.info("[EI Freight Firestore] Seeding initial prototype Locations...");
      for (const loc of DEFAULT_LOCATIONS) {
        await setDoc(doc(db, "locations", loc.id), {
          ...loc,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.warn("[EI Freight Firestore] Seeding note (local fallback available):", err);
  } finally {
    isSeeding = false;
  }
}

/**
 * Real-time listener for RFQ documents.
 */
export function subscribeToRfqs(
  onUpdate: (rfqs: RfqRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Trigger seeding check in background
  seedFirestoreIfEmpty();

  return onSnapshot(
    collection(db, "rfqs"),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_SEEDED_RFQS);
        return;
      }
      const data: RfqRecord[] = [];
      snapshot.forEach((d) => {
        data.push(d.data() as RfqRecord);
      });
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(data);
    },
    (err) => {
      console.warn("[EI Freight Firestore] subscribeToRfqs offline/fallback:", err);
      if (onError) onError(err);
      onUpdate(INITIAL_SEEDED_RFQS);
    }
  );
}

/**
 * Real-time listener for Clients collection.
 */
export function subscribeToClients(
  onUpdate: (clients: ClientProfile[]) => void
): () => void {
  return onSnapshot(
    collection(db, "clients"),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_CLIENTS);
        return;
      }
      const data: ClientProfile[] = [];
      snapshot.forEach((d) => data.push(d.data() as ClientProfile));
      onUpdate(data);
    },
    () => {
      onUpdate(INITIAL_CLIENTS);
    }
  );
}

/**
 * Real-time listener for Providers collection.
 */
export function subscribeToProviders(
  onUpdate: (providers: ProviderProfile[]) => void
): () => void {
  return onSnapshot(
    collection(db, "providers"),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_PROVIDERS);
        return;
      }
      const data: ProviderProfile[] = [];
      snapshot.forEach((d) => data.push(d.data() as ProviderProfile));
      onUpdate(data);
    },
    () => {
      onUpdate(INITIAL_PROVIDERS);
    }
  );
}

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
    // Get existing quotes, add new one, and transition to "offer" stage
    const rfqSnap = await getDocs(collection(db, "rfqs"));
    const currentRfq = rfqSnap.docs.find((d) => d.id === rfqId)?.data() as RfqRecord | undefined;
    const existingQuotes = currentRfq?.quotes || [];
    const updatedQuotes = [...existingQuotes.filter((q) => q.id !== quote.id), quote];

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
    const rfqSnap = await getDocs(collection(db, "rfqs"));
    const currentRfq = rfqSnap.docs.find((d) => d.id === rfqId)?.data() as RfqRecord | undefined;
    const existingQuotes = currentRfq?.quotes || [];

    const updatedQuotes = existingQuotes.map((q) => ({
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
    const rfqSnap = await getDocs(collection(db, "rfqs"));
    const currentRfq = rfqSnap.docs.find((d) => d.id === rfqId)?.data() as RfqRecord | undefined;
    const quote = currentRfq?.quotes.find((q) => q.id === quoteId);

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
 * Step: Admin resets RFQ back to its clean seeded state.
 */
export async function resetRfq(rfqId: string): Promise<void> {
  try {
    const seed = INITIAL_SEEDED_RFQS.find((r) => r.id === rfqId);
    if (!seed) {
      console.warn("No seed record found for reset:", rfqId);
      return;
    }
    const ref = doc(db, "rfqs", rfqId);
    await setDoc(ref, {
      ...seed,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[resetRfq error]", err);
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
    const rfqSnap = await getDocs(collection(db, "rfqs"));
    const currentRfq = rfqSnap.docs.find((d) => d.id === rfqId)?.data() as RfqRecord | undefined;
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



// ─────────────────────────────────────────────────────────────
// MASTER DATA: COUNTRIES & LOCATIONS
// ─────────────────────────────────────────────────────────────

export interface MasterCountry {
  id: string;
  nameEn: string;
  nameAr: string;
  active: boolean;
}

export interface MasterLocation {
  id: string;
  countryId: string;
  nameEn: string;
  nameAr: string;
  type: "city" | "port" | "airport";
  code?: string;
  active: boolean;
}

export const DEFAULT_COUNTRIES: MasterCountry[] = [
  {
    "id": "EG",
    "nameEn": "Egypt",
    "nameAr": "مصر",
    "active": true
  },
  {
    "id": "CN",
    "nameEn": "China",
    "nameAr": "الصين",
    "active": true
  },
  {
    "id": "AE",
    "nameEn": "United Arab Emirates",
    "nameAr": "الإمارات العربية المتحدة",
    "active": true
  },
  {
    "id": "SA",
    "nameEn": "Saudi Arabia",
    "nameAr": "السعودية",
    "active": true
  },
  {
    "id": "DE",
    "nameEn": "Germany",
    "nameAr": "ألمانيا",
    "active": true
  },
  {
    "id": "TR",
    "nameEn": "Türkiye",
    "nameAr": "تركيا",
    "active": true
  },
  {
    "id": "IN",
    "nameEn": "India",
    "nameAr": "الهند",
    "active": true
  },
  {
    "id": "JO",
    "nameEn": "Jordan",
    "nameAr": "الأردن",
    "active": true
  },
  {
    "id": "US",
    "nameEn": "United States",
    "nameAr": "الولايات المتحدة",
    "active": true
  }
];

export const DEFAULT_LOCATIONS: MasterLocation[] = [
  {
    "id": "EG-CAI",
    "countryId": "EG",
    "nameEn": "Cairo",
    "nameAr": "القاهرة",
    "type": "city",
    "code": "CAI",
    "active": true
  },
  {
    "id": "EG-CAI-AIR",
    "countryId": "EG",
    "nameEn": "Cairo International Airport",
    "nameAr": "مطار القاهرة الدولي",
    "type": "airport",
    "code": "CAI",
    "active": true
  },
  {
    "id": "EG-ALX",
    "countryId": "EG",
    "nameEn": "Alexandria",
    "nameAr": "الإسكندرية",
    "type": "city",
    "code": "ALX",
    "active": true
  },
  {
    "id": "EG-ALX-PORT",
    "countryId": "EG",
    "nameEn": "Alexandria Port",
    "nameAr": "ميناء الإسكندرية",
    "type": "port",
    "code": "EGALY",
    "active": true
  },
  {
    "id": "EG-DKH-PORT",
    "countryId": "EG",
    "nameEn": "Dekheila Port",
    "nameAr": "ميناء الدخيلة",
    "type": "port",
    "code": "EGEDK",
    "active": true
  },
  {
    "id": "EG-PSD",
    "countryId": "EG",
    "nameEn": "Port Said",
    "nameAr": "بورسعيد",
    "type": "city",
    "code": "PSD",
    "active": true
  },
  {
    "id": "EG-PSD-PORT",
    "countryId": "EG",
    "nameEn": "Port Said Port",
    "nameAr": "ميناء بورسعيد",
    "type": "port",
    "code": "EGPSD",
    "active": true
  },
  {
    "id": "EG-SOK-PORT",
    "countryId": "EG",
    "nameEn": "Sokhna Port",
    "nameAr": "ميناء السخنة",
    "type": "port",
    "code": "EGSOK",
    "active": true
  },
  {
    "id": "EG-GIZ",
    "countryId": "EG",
    "nameEn": "Giza",
    "nameAr": "الجيزة",
    "type": "city",
    "code": "GIZ",
    "active": true
  },
  {
    "id": "CN-SHA",
    "countryId": "CN",
    "nameEn": "Shanghai",
    "nameAr": "شنغهاي",
    "type": "city",
    "code": "SHA",
    "active": true
  },
  {
    "id": "CN-SHA-PORT",
    "countryId": "CN",
    "nameEn": "Shanghai Port",
    "nameAr": "ميناء شنغهاي",
    "type": "port",
    "code": "CNSHA",
    "active": true
  },
  {
    "id": "CN-PVG-AIR",
    "countryId": "CN",
    "nameEn": "Shanghai Pudong Airport",
    "nameAr": "مطار شنغهاي بودونغ",
    "type": "airport",
    "code": "PVG",
    "active": true
  },
  {
    "id": "CN-NGB",
    "countryId": "CN",
    "nameEn": "Ningbo",
    "nameAr": "نينغبو",
    "type": "city",
    "code": "NGB",
    "active": true
  },
  {
    "id": "CN-NGB-PORT",
    "countryId": "CN",
    "nameEn": "Ningbo Port",
    "nameAr": "ميناء نينغبو",
    "type": "port",
    "code": "CNNGB",
    "active": true
  },
  {
    "id": "CN-SZX",
    "countryId": "CN",
    "nameEn": "Shenzhen",
    "nameAr": "شنتشن",
    "type": "city",
    "code": "SZX",
    "active": true
  },
  {
    "id": "CN-SZX-PORT",
    "countryId": "CN",
    "nameEn": "Shenzhen Port",
    "nameAr": "ميناء شنتشن",
    "type": "port",
    "code": "CNSZX",
    "active": true
  },
  {
    "id": "CN-SZX-AIR",
    "countryId": "CN",
    "nameEn": "Shenzhen Bao'an Airport",
    "nameAr": "مطار شنتشن باوآن",
    "type": "airport",
    "code": "SZX",
    "active": true
  },
  {
    "id": "CN-CAN",
    "countryId": "CN",
    "nameEn": "Guangzhou",
    "nameAr": "غوانزو",
    "type": "city",
    "code": "CAN",
    "active": true
  },
  {
    "id": "CN-CAN-AIR",
    "countryId": "CN",
    "nameEn": "Guangzhou Baiyun Airport",
    "nameAr": "مطار غوانزو باييون",
    "type": "airport",
    "code": "CAN",
    "active": true
  },
  {
    "id": "AE-DXB",
    "countryId": "AE",
    "nameEn": "Dubai",
    "nameAr": "دبي",
    "type": "city",
    "code": "DXB",
    "active": true
  },
  {
    "id": "AE-JEA-PORT",
    "countryId": "AE",
    "nameEn": "Jebel Ali Port",
    "nameAr": "ميناء جبل علي",
    "type": "port",
    "code": "AEJEA",
    "active": true
  },
  {
    "id": "AE-DXB-AIR",
    "countryId": "AE",
    "nameEn": "Dubai International Airport",
    "nameAr": "مطار دبي الدولي",
    "type": "airport",
    "code": "DXB",
    "active": true
  },
  {
    "id": "AE-AUH",
    "countryId": "AE",
    "nameEn": "Abu Dhabi",
    "nameAr": "أبوظبي",
    "type": "city",
    "code": "AUH",
    "active": true
  },
  {
    "id": "AE-KHL-PORT",
    "countryId": "AE",
    "nameEn": "Khalifa Port",
    "nameAr": "ميناء خليفة",
    "type": "port",
    "code": "AEKHL",
    "active": true
  },
  {
    "id": "SA-RUH",
    "countryId": "SA",
    "nameEn": "Riyadh",
    "nameAr": "الرياض",
    "type": "city",
    "code": "RUH",
    "active": true
  },
  {
    "id": "SA-JED",
    "countryId": "SA",
    "nameEn": "Jeddah",
    "nameAr": "جدة",
    "type": "city",
    "code": "JED",
    "active": true
  },
  {
    "id": "SA-JED-PORT",
    "countryId": "SA",
    "nameEn": "Jeddah Islamic Port",
    "nameAr": "ميناء جدة الإسلامي",
    "type": "port",
    "code": "SAJED",
    "active": true
  },
  {
    "id": "SA-DMM",
    "countryId": "SA",
    "nameEn": "Dammam",
    "nameAr": "الدمام",
    "type": "city",
    "code": "DMM",
    "active": true
  },
  {
    "id": "SA-DMM-PORT",
    "countryId": "SA",
    "nameEn": "King Abdulaziz Port",
    "nameAr": "ميناء الملك عبدالعزيز",
    "type": "port",
    "code": "SADMM",
    "active": true
  },
  {
    "id": "DE-FRA",
    "countryId": "DE",
    "nameEn": "Frankfurt",
    "nameAr": "فرانكفورت",
    "type": "city",
    "code": "FRA",
    "active": true
  },
  {
    "id": "DE-FRA-AIR",
    "countryId": "DE",
    "nameEn": "Frankfurt Airport",
    "nameAr": "مطار فرانكفورت",
    "type": "airport",
    "code": "FRA",
    "active": true
  },
  {
    "id": "DE-HAM-PORT",
    "countryId": "DE",
    "nameEn": "Port of Hamburg",
    "nameAr": "ميناء هامبورغ",
    "type": "port",
    "code": "DEHAM",
    "active": true
  },
  {
    "id": "TR-IST",
    "countryId": "TR",
    "nameEn": "Istanbul",
    "nameAr": "إسطنبول",
    "type": "city",
    "code": "IST",
    "active": true
  },
  {
    "id": "TR-IST-AIR",
    "countryId": "TR",
    "nameEn": "Istanbul Airport",
    "nameAr": "مطار إسطنبول",
    "type": "airport",
    "code": "IST",
    "active": true
  },
  {
    "id": "IN-MAA-PORT",
    "countryId": "IN",
    "nameEn": "Chennai Port",
    "nameAr": "ميناء تشيناي",
    "type": "port",
    "code": "INMAA",
    "active": true
  },
  {
    "id": "JO-AMM",
    "countryId": "JO",
    "nameEn": "Amman",
    "nameAr": "عمّان",
    "type": "city",
    "code": "AMM",
    "active": true
  },
  {
    "id": "US-NYC",
    "countryId": "US",
    "nameEn": "New York",
    "nameAr": "نيويورك",
    "type": "city",
    "code": "NYC",
    "active": true
  },
  {
    "id": "US-NYC-PORT",
    "countryId": "US",
    "nameEn": "Port of New York and New Jersey",
    "nameAr": "ميناء نيويورك ونيوجيرسي",
    "type": "port",
    "code": "USNYC",
    "active": true
  },
  {
    "id": "US-JFK-AIR",
    "countryId": "US",
    "nameEn": "John F. Kennedy International Airport",
    "nameAr": "مطار جون إف كينيدي الدولي",
    "type": "airport",
    "code": "JFK",
    "active": true
  }
];

/**
 * Subscribe to Master Countries with local fallback
 */
export function subscribeToCountries(callback: (countries: MasterCountry[]) => void): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, "countries"),
      (snapshot: any) => {
        if (snapshot.empty) {
          callback(DEFAULT_COUNTRIES);
        } else {
          const list = snapshot.docs.map((d: any) => d.data() as MasterCountry);
          callback(list.length ? list : DEFAULT_COUNTRIES);
        }
      },
      (err: any) => {
        console.warn("[subscribeToCountries] Firestore error, using defaults:", err);
        callback(DEFAULT_COUNTRIES);
      }
    );
    return unsub;
  } catch (err) {
    console.warn("[subscribeToCountries] Init error, using defaults:", err);
    callback(DEFAULT_COUNTRIES);
    return () => {};
  }
}

/**
 * Subscribe to Master Locations with local fallback
 */
export function subscribeToLocations(callback: (locations: MasterLocation[]) => void): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, "locations"),
      (snapshot: any) => {
        if (snapshot.empty) {
          callback(DEFAULT_LOCATIONS);
        } else {
          const list = snapshot.docs.map((d: any) => d.data() as MasterLocation);
          callback(list.length ? list : DEFAULT_LOCATIONS);
        }
      },
      (err: any) => {
        console.warn("[subscribeToLocations] Firestore error, using defaults:", err);
        callback(DEFAULT_LOCATIONS);
      }
    );
    return unsub;
  } catch (err) {
    console.warn("[subscribeToLocations] Init error, using defaults:", err);
    callback(DEFAULT_LOCATIONS);
    return () => {};
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
 * Reset entire demo state back to seeded baseline in Firestore
 */
export async function resetEntireDemo(): Promise<void> {
  try {
    for (const rfq of INITIAL_SEEDED_RFQS) {
      await setDoc(doc(db, "rfqs", rfq.id), {
        ...rfq,
        updatedAt: serverTimestamp(),
      });
    }
    for (const client of INITIAL_CLIENTS) {
      await setDoc(doc(db, "clients", client.id), {
        ...client,
        used: client.id === "client-delta" ? 0 : 2,
        limit: 2,
        updatedAt: serverTimestamp(),
      });
    }
    for (const provider of INITIAL_PROVIDERS) {
      await setDoc(doc(db, "providers", provider.id), {
        ...provider,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("[resetEntireDemo error]", err);
    throw err;
  }
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

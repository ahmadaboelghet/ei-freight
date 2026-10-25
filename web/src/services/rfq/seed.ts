/**
 * @file src/services/rfq/seed.ts
 * @description Seed data arrays and Firestore seeding / reset helpers
 *              for the EI Freight Platform prototype.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { RfqRecord } from "../../types/domain";
import {
  INITIAL_CLIENTS,
  INITIAL_PROVIDERS,
  DEFAULT_COUNTRIES,
  DEFAULT_LOCATIONS,
} from "../masterData";

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

// ─────────────────────────────────────────────────────────────
// REAL FIRESTORE SEEDING & SYNC LOGIC
// ─────────────────────────────────────────────────────────────

/**
 * In-flight guard: prevents concurrent seeding calls within the same module lifecycle.
 * NOTE: This resets on page reload, which is why we also use sessionStorage below.
 */
let isSeeding = false;

/** Session-level key: set after first successful seed to skip on subsequent page loads. */
const SEED_SESSION_KEY = "ei_freight_seeded_v1";

/**
 * Seeds initial RFQs, Clients, and Providers into Firestore if not present.
 * ✅ FIX: Uses sessionStorage to avoid 5x getDocs calls on every page refresh.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  // ✅ Skip if already seeded in this browser session (survives SPA navigation, not full reload)
  if (sessionStorage.getItem(SEED_SESSION_KEY)) return;
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

    // ✅ FIX: Mark session as seeded so we skip 5x getDocs calls on next page reload
    sessionStorage.setItem(SEED_SESSION_KEY, "true");
  } catch (err) {
    console.warn("[EI Freight Firestore] Seeding note (local fallback available):", err);
  } finally {
    isSeeding = false;
  }
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

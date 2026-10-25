/**
 * @file src/services/rfq/subscriptions.ts
 * @description Real-time Firestore onSnapshot listeners for RFQs, Clients,
 *              Providers, Countries, and Locations in the EI Freight Platform.
 */

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import { RfqRecord } from "../../types/domain";
import { seedFirestoreIfEmpty, INITIAL_SEEDED_RFQS } from "./seed";
import {
  ClientProfile,
  ProviderProfile,
  MasterCountry,
  MasterLocation,
  INITIAL_CLIENTS,
  INITIAL_PROVIDERS,
  DEFAULT_COUNTRIES,
  DEFAULT_LOCATIONS,
} from "../masterData";

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

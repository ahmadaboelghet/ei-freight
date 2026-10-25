/**
 * @file index.ts
 * @description Firebase Functions entry point.
 *              All exported functions are discovered and deployed from here.
 *              Import only from controllers — never import services directly.
 */

import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK once at cold start
initializeApp();

// ─────────────────────────────────────────────────────────────
// SHIPMENT FUNCTIONS
// ─────────────────────────────────────────────────────────────
export { createShipmentCallable as createShipment } from "./controllers/shipment.controller";

// ─────────────────────────────────────────────────────────────
// PLACEHOLDER EXPORTS (to be implemented in Step 2+)
// ─────────────────────────────────────────────────────────────
// export { submitShipment }        from "./controllers/shipment.controller";
// export { getShipment }           from "./controllers/shipment.controller";
// export { listShipments }         from "./controllers/shipment.controller";
// export { transitionShipment }    from "./controllers/shipment.controller";
// export { dispatchToProviders }   from "./controllers/shipment.controller";
// export { submitOffer }           from "./controllers/offer.controller";
// export { sendOfferBatch }        from "./controllers/offer.controller";
// export { selectQuote }           from "./controllers/offer.controller";
// export { createUser }            from "./controllers/user.controller";
// export { approveAccount }        from "./controllers/user.controller";
// export { listNotifications }     from "./controllers/notification.controller";
// export { markNotificationRead }  from "./controllers/notification.controller";

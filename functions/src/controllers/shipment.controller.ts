/**
 * @file shipment.controller.ts
 * @description Firebase onCall handler (Controller) for all shipment-related callables.
 *              This layer is ONLY responsible for:
 *                1. Verifying Firebase Auth context.
 *                2. Validating the incoming payload (delegated to validators).
 *                3. Mapping auth context → service input.
 *                4. Invoking the service layer.
 *                5. Returning a clean response or throwing HttpsError.
 *
 *              Business logic lives in shipment.service.ts — never here.
 */

import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import {
  validateCreateShipmentPayload,
  CreateShipmentPayload,
} from "../validators/createShipment.validator";
import {
  createShipment,
} from "../services/shipment.service";
import { UserDocument } from "../models/firestore.types";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const db = () => getFirestore();

/**
 * Loads the caller's UserDocument from Firestore.
 * Throws `unauthenticated` if the token is missing, and
 * `permission-denied` if the account is not in an active state.
 */
async function requireAuthenticatedUser(
  request: CallableRequest
): Promise<UserDocument> {
  if (!request.auth?.uid) {
    throw new HttpsError(
      "unauthenticated",
      "You must be signed in to perform this action."
    );
  }

  const uid = request.auth.uid;
  const snap = await db().collection("users").doc(uid).get();

  if (!snap.exists) {
    throw new HttpsError(
      "not-found",
      "User profile not found. Please complete your registration."
    );
  }

  const user = snap.data() as UserDocument;

  // Reject suspended or blocked accounts immediately
  if (user.status === "suspended" || user.status === "blocked") {
    throw new HttpsError(
      "permission-denied",
      `Your account is ${user.status}. Please contact EI Freight support.`
    );
  }

  return user;
}

/**
 * Verifies that the caller has one of the accepted roles.
 * Throws `permission-denied` if not.
 */
function requireRole(user: UserDocument, ...roles: UserDocument["role"][]): void {
  if (!roles.includes(user.role)) {
    throw new HttpsError(
      "permission-denied",
      `This action requires the role: ${roles.join(" or ")}.`
    );
  }
}

// ─────────────────────────────────────────────────────────────
// CALLABLE: createShipment
// ─────────────────────────────────────────────────────────────

/**
 * `createShipment` — Callable Firebase Function (v2)
 *
 * Callable from both React (Firebase JS SDK) and Flutter (cloud_firestore SDK).
 * No CORS configuration needed — Firebase handles it automatically for onCall.
 *
 * @example (TypeScript/React)
 * ```ts
 * const fn = httpsCallable(functions, 'createShipment');
 * const result = await fn({ mode: 'sea', ... });
 * ```
 *
 * @example (Flutter/Dart)
 * ```dart
 * final fn = FirebaseFunctions.instance.httpsCallable('createShipment');
 * final result = await fn.call({ 'mode': 'sea', ... });
 * ```
 */
export const createShipmentCallable = onCall(
  {
    // Enforce App Check in production; allow unenforced during dev
    enforceAppCheck: process.env.NODE_ENV === "production",
    // Rate limiting: max 10 concurrent invocations per instance
    maxInstances: 10,
    // Run in the same region as your Firestore instance
    region: "europe-west1",
  },
  async (request: CallableRequest<CreateShipmentPayload>) => {
    // ── 1. Auth guard ────────────────────────────────────────
    const caller = await requireAuthenticatedUser(request);

    // ── 2. Role guard (clients AND staff/admin can create shipments) ──
    requireRole(caller, "client", "staff", "admin");

    // Clients must have an approved account to submit
    if (caller.role === "client" && caller.status !== "approved") {
      throw new HttpsError(
        "permission-denied",
        "Your account is pending approval. You cannot submit shipment requests yet."
      );
    }

    // ── 3. Payload validation ────────────────────────────────
    const validation = validateCreateShipmentPayload(request.data);
    if (!validation.valid) {
      throw new HttpsError(
        "invalid-argument",
        `Validation failed: ${validation.errors.join(" | ")}`
      );
    }

    // ── 4. Determine request source ──────────────────────────
    //      This matters for the pipeline audit trail.
    let requestSource: "client" | "admin_registered_client" | "operation_registered_client";
    if (caller.role === "client") {
      requestSource = "client";
    } else if (caller.internalRole === "operations") {
      requestSource = "operation_registered_client";
    } else {
      requestSource = "admin_registered_client";
    }

    // ── 5. Delegate to Service ───────────────────────────────
    try {
      const result = await createShipment({
        payload: request.data,
        clientId: caller.uid,
        clientType: caller.clientType ?? "personal",
        requestSource,
      });

      // ── 6. Return clean response ─────────────────────────
      return {
        success: true,
        shipmentId: result.shipmentId,
        referenceNo: result.referenceNo,
        message: `Shipment ${result.referenceNo} created successfully.`,
      };
    } catch (err: unknown) {
      // Surface quota errors as user-facing invalid-argument
      if (err instanceof Error && err.message.includes("quota")) {
        throw new HttpsError("resource-exhausted", err.message);
      }
      // Re-throw known HttpsErrors unchanged
      if (err instanceof HttpsError) throw err;
      // Wrap unknown errors
      console.error("[createShipment] Unexpected error:", err);
      throw new HttpsError(
        "internal",
        "An unexpected error occurred while creating the shipment. Please try again."
      );
    }
  }
);

/**
 * @file src/hooks/useShipmentForm.ts
 * @description Custom hook that owns ALL state and submission logic for
 *              the CreateShipmentForm. Keeps the component purely presentational.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ShipmentService } from "../services/shipmentService";
import {
  CreateShipmentPayload,
  ShipmentMode,
  CreateShipmentResponse,
} from "../types/domain";

// ─────────────────────────────────────────────────────────────
// FORM STATE SHAPE
// ─────────────────────────────────────────────────────────────

export interface ShipmentFormState {
  // Origin
  originLabel: string;
  originCity: string;
  originGov: string;
  originCountry: string;
  originStreet: string;

  // Destination
  destLabel: string;
  destCity: string;
  destGov: string;
  destCountry: string;
  destStreet: string;

  // Mode
  mode: ShipmentMode;

  // Cargo
  cargoDescription: string;
  weightKg: string;             // kept as string for input binding; parsed on submit
  volumeCbm: string;
  packagingType: string;
  quantity: string;
  isHazardous: boolean;
  requiresRefrigeration: boolean;
  temperatureMin: string;
  temperatureMax: string;
  incoterms: string;
  routingPreference: string;

  // Sea specific
  seaShipmentType: "FCL" | "LCL";
  containerType: string;
  containerCount: string;

  // Road specific
  roadShipmentType: "FTL" | "LTL";
  truckType: string;

  // Notes
  clientNotes: string;
}

const INITIAL_STATE: ShipmentFormState = {
  originLabel: "", originCity: "", originGov: "", originCountry: "EG", originStreet: "",
  destLabel: "", destCity: "", destGov: "", destCountry: "", destStreet: "",
  mode: "sea",
  cargoDescription: "", weightKg: "", volumeCbm: "", packagingType: "",
  quantity: "", isHazardous: false, requiresRefrigeration: false,
  temperatureMin: "", temperatureMax: "", incoterms: "", routingPreference: "",
  seaShipmentType: "FCL", containerType: "", containerCount: "",
  roadShipmentType: "FTL", truckType: "",
  clientNotes: "",
};

// ─────────────────────────────────────────────────────────────
// FORM → PAYLOAD BUILDER
// ─────────────────────────────────────────────────────────────

function buildPayload(f: ShipmentFormState): CreateShipmentPayload {
  const payload: CreateShipmentPayload = {
    origin: {
      label: f.originLabel.trim(),
      city: f.originCity.trim(),
      governorate: f.originGov.trim(),
      country: f.originCountry.trim().toUpperCase(),
      ...(f.originStreet ? { street: f.originStreet.trim() } : {}),
    },
    destination: {
      label: f.destLabel.trim(),
      city: f.destCity.trim(),
      governorate: f.destGov.trim(),
      country: f.destCountry.trim().toUpperCase(),
      ...(f.destStreet ? { street: f.destStreet.trim() } : {}),
    },
    mode: f.mode,
    cargo: {
      description: f.cargoDescription.trim(),
      weightKg: parseFloat(f.weightKg),
      ...(f.volumeCbm ? { volumeCbm: parseFloat(f.volumeCbm) } : {}),
      ...(f.packagingType ? { packagingType: f.packagingType } : {}),
      ...(f.quantity ? { quantity: parseInt(f.quantity, 10) } : {}),
      ...(f.isHazardous ? { isHazardous: true } : {}),
      ...(f.requiresRefrigeration
        ? {
            requiresRefrigeration: true,
            ...(f.temperatureMin ? { temperatureMin: parseFloat(f.temperatureMin) } : {}),
            ...(f.temperatureMax ? { temperatureMax: parseFloat(f.temperatureMax) } : {}),
          }
        : {}),
      ...(f.incoterms ? { incoterms: f.incoterms as CreateShipmentPayload["cargo"]["incoterms"] } : {}),
      ...(f.routingPreference
        ? { routingPreference: f.routingPreference as "direct" | "transit" }
        : {}),
    },
    ...(f.clientNotes.trim() ? { clientNotes: f.clientNotes.trim() } : {}),
  };

  if (f.mode === "sea") {
    payload.seaDetails = {
      shipmentType: f.seaShipmentType,
      ...(f.containerType ? { containerType: f.containerType as SeaContainerType } : {}),
      ...(f.containerCount ? { containerCount: parseInt(f.containerCount, 10) } : {}),
    };
  }

  if (f.mode === "road") {
    payload.roadDetails = {
      shipmentType: f.roadShipmentType,
      ...(f.truckType ? { truckType: f.truckType } : {}),
    };
  }

  return payload;
}

type SeaContainerType = "20GP" | "40GP" | "40HC" | "45HC" | "20RF" | "40RF";

// ─────────────────────────────────────────────────────────────
// CLIENT-SIDE VALIDATION
// ─────────────────────────────────────────────────────────────

function validate(f: ShipmentFormState): string[] {
  const errs: string[] = [];
  if (!f.originLabel.trim()) errs.push("Origin label is required.");
  if (!f.originCity.trim()) errs.push("Origin city is required.");
  if (!f.originGov.trim()) errs.push("Origin governorate is required.");
  if (!f.originCountry.trim()) errs.push("Origin country is required.");
  if (!f.destLabel.trim()) errs.push("Destination label is required.");
  if (!f.destCity.trim()) errs.push("Destination city is required.");
  if (!f.destGov.trim()) errs.push("Destination governorate is required.");
  if (!f.destCountry.trim()) errs.push("Destination country is required.");
  if (!f.cargoDescription.trim()) errs.push("Cargo description is required.");
  const w = parseFloat(f.weightKg);
  if (!f.weightKg || isNaN(w) || w <= 0) errs.push("Weight must be a positive number.");
  if (f.mode === "sea" && !f.seaShipmentType) errs.push("Sea shipment type is required.");
  if (f.mode === "road" && !f.roadShipmentType) errs.push("Road shipment type is required.");
  if (
    f.requiresRefrigeration &&
    f.temperatureMin &&
    f.temperatureMax &&
    parseFloat(f.temperatureMin) >= parseFloat(f.temperatureMax)
  ) {
    errs.push("Temperature min must be less than max.");
  }
  return errs;
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export interface UseShipmentFormReturn {
  form: ShipmentFormState;
  setField: <K extends keyof ShipmentFormState>(key: K, value: ShipmentFormState[K]) => void;
  validationErrors: string[];
  submitError: string | null;
  isSubmitting: boolean;
  result: CreateShipmentResponse | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useShipmentForm(): UseShipmentFormReturn {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ShipmentFormState>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreateShipmentResponse | null>(null);

  const setField = useCallback(
    <K extends keyof ShipmentFormState>(key: K, value: ShipmentFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear errors on user interaction
      if (validationErrors.length > 0) setValidationErrors([]);
      if (submitError) setSubmitError(null);
    },
    [validationErrors.length, submitError]
  );

  const reset = useCallback(() => {
    setForm(INITIAL_STATE);
    setValidationErrors([]);
    setSubmitError(null);
    setResult(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Auth guard — should never reach here if ProtectedRoute works,
      // but double-checking is always good.
      if (!user) {
        setSubmitError("You must be signed in to create a shipment.");
        return;
      }
      if (user.status !== "approved") {
        setSubmitError(
          "Your account is pending approval. You cannot submit shipment requests yet."
        );
        return;
      }

      // Client-side validation
      const errs = validate(form);
      if (errs.length > 0) {
        setValidationErrors(errs);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      setValidationErrors([]);

      try {
        const payload = buildPayload(form);
        const response = await ShipmentService.create(payload);
        setResult(response);
        // Navigate to the new shipment's detail page
        navigate(`/shipments/${response.shipmentId}`, {
          state: { referenceNo: response.referenceNo, isNew: true },
        });
      } catch (err) {
        setSubmitError((err as Error).message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, form, navigate]
  );

  return {
    form,
    setField,
    validationErrors,
    submitError,
    isSubmitting,
    result,
    handleSubmit,
    reset,
  };
}

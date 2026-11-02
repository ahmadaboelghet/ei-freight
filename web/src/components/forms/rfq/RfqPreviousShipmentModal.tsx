/**
 * @file src/components/forms/rfq/RfqPreviousShipmentModal.tsx
 * @description Modal allowing the client to clone data from a previous RFQ/shipment into the new request.
 *              Strictly adheres to logic in EI_Freight.html:
 *              - Resets ready date
 *              - Sets container quantities to 1
 *              - Resets payment terms
 *              - Resets MSDS & marks for re-confirmation
 *              - Sets copiedFrom = selected RFQ ID
 */

import React, { useState, useMemo } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { RfqRecord, CanonicalShipmentData } from "../../../types/domain";
import {
  IconSearch,
  IconClose,
  IconShip,
  IconPlane,
  IconTruck,
  IconCheck,
} from "../../ui/Icons";
import { clsx } from "clsx";

interface RfqPreviousShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqs: RfqRecord[];
  onSelectShipment: (clonedData: Partial<CanonicalShipmentData>, sourceId: string) => void;
}

export function RfqPreviousShipmentModal({
  isOpen,
  onClose,
  rfqs,
  onSelectShipment,
}: RfqPreviousShipmentModalProps) {
  const { t, isArabic } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRfqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rfqs.filter((r) => {
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.cargo.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        (r.route && r.route.toLowerCase().includes(q))
      );
    });
  }, [rfqs, searchQuery]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedId) return;
    const target = rfqs.find((r) => r.id === selectedId);
    if (!target) return;

    // Build the cloned partial data structure
    const clonedData: Partial<CanonicalShipmentData> = {};

    if (target.shipment) {
      // Deep clone existing canonical shipment data
      clonedData.common = {
        ...target.shipment.common,
        ready: "", // Reset ready date
        notes: "",
      };

      clonedData.specific = {
        ...target.shipment.specific,
        // Reset container quantities to 1
        containers: target.shipment.specific?.containers?.map((c) => ({
          ...c,
          quantity: 1,
        })),
        pickupDate: "",
        deliveryDate: "",
      };

      clonedData.legs = target.shipment.legs ? [...target.shipment.legs] : [];

      // Payment terms reset
      clonedData.paymentTerms = {
        type: "",
        creditDays: null,
        billOfLadingType: target.shipment.paymentTerms?.billOfLadingType || "",
      };

      // Attachments are NOT cloned (fresh invoices required)
      clonedData.attachments = [];

      // MSDS cleared for reconfirmation
      clonedData.msds = [];
    } else {
      // Fallback: construct from top-level RfqRecord fields
      clonedData.common = {
        operationType: "import",
        operatingCountryId: "EG",
        deliveryType: "arrival",
        destinationCountryId: target.destinationCode || "EG",
        acceptableDestinationLocationIds: target.destinationLocationId ? [target.destinationLocationId] : [],
        incoterm: target.incoterm || "FOB",
        cargo: target.cargo || "",
        ready: "",
      };

      clonedData.specific = {
        shipmentType: (target.shipmentType as any) || "fcl",
        cargoWeight: target.weightKg ? String(target.weightKg) : "",
        dangerousGoods: "no",
        refrigeratedCargo: "no",
      };

      clonedData.paymentTerms = {
        type: "",
        creditDays: null,
      };

      clonedData.attachments = [];
      clonedData.msds = [];
    }

    onSelectShipment(clonedData, target.id);
    onClose();
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "sea":
        return <IconShip className="w-4 h-4 text-blue-600" />;
      case "air":
        return <IconPlane className="w-4 h-4 text-sky-600" />;
      case "road":
        return <IconTruck className="w-4 h-4 text-emerald-600" />;
      default:
        return <IconShip className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t("Use Data from Previous Shipment", "استخدام بيانات شحنة سابقة")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                "Select a previous shipment to auto-fill common route and cargo parameters. Ready date, documents, and quantities will be reset.",
                "اختر شحنة سابقة لملء بيانات المسار والبضاعة المشتركة. سيتم تصفير تاريخ الجاهزية والكميات والمستندات لملئها من جديد."
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <IconSearch className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              "Search by RFQ ID, cargo, or route...",
              "البحث برقم الطلب، البضاعة، أو المسار..."
            )}
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Shipment List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredRfqs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              {t("No shipments match your search.", "لا توجد شحنات مطابقة للبحث.")}
            </div>
          ) : (
            filteredRfqs.map((rfq) => {
              const isSelected = selectedId === rfq.id;
              return (
                <div
                  key={rfq.id}
                  onClick={() => setSelectedId(rfq.id)}
                  className={clsx(
                    "p-4 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-4",
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                      {getModeIcon(rfq.mode)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rfq.id}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                          {rfq.mode} {rfq.shipmentType ? `• ${rfq.shipmentType.toUpperCase()}` : ""}
                        </span>
                        {rfq.incoterm && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">
                            {rfq.incoterm}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 mt-1 font-medium">
                        {rfq.cargo}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {rfq.route || `${rfq.origin} ➔ ${rfq.destination}`}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <div
                      className={clsx(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition",
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300"
                      )}
                    >
                      {isSelected && <IconCheck className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            {t("Cancel", "إلغاء")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className={clsx(
              "px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2",
              selectedId
                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            {t("Clone to Draft", "نسخ البيانات للطلب")}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @file src/components/forms/rfq/RfqOperationSection.tsx
 * @description Step 1.1: Operation Type (Import / Export) + Previous Shipment Template loader.
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { IconCheck } from "../../ui/Icons";

interface RfqOperationSectionProps {
  operationType: "import" | "export" | "";
  onSelectOperation: (op: "import" | "export") => void;
  hasPreviousShipments: boolean;
  onOpenPreviousModal: () => void;
}

export function RfqOperationSection({
  operationType,
  onSelectOperation,
  hasPreviousShipments,
  onOpenPreviousModal,
}: RfqOperationSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
          1
        </span>
        <div>
          <h3 className="text-sm font-black text-slate-900">
            {t("Operation Type", "نوع العملية")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("Select Import or Export", "حدد ما إذا كانت الشحنة استيراد أم تصدير")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
        <button
          type="button"
          onClick={() => onSelectOperation("import")}
          className={`p-4 rounded-2xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
            operationType === "import"
              ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm"
              : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
              ↓
            </span>
            <span className="font-extrabold text-sm sm:text-base">
              {t("Import", "استيراد")}
            </span>
          </div>
          {operationType === "import" && (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <IconCheck size={14} />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectOperation("export")}
          className={`p-4 rounded-2xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
            operationType === "export"
              ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm"
              : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center">
              ↑
            </span>
            <span className="font-extrabold text-sm sm:text-base">
              {t("Export", "تصدير")}
            </span>
          </div>
          {operationType === "export" && (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <IconCheck size={14} />
            </div>
          )}
        </button>
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={!hasPreviousShipments}
          onClick={onOpenPreviousModal}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition flex items-center gap-2 ${
            hasPreviousShipments
              ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer"
              : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-60"
          }`}
        >
          <span>↻</span>
          <span>{t("Use previous shipment data", "استخدام بيانات شحنة سابقة")}</span>
        </button>
      </div>
    </section>
  );
}

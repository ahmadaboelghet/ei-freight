/**
 * @file src/components/forms/rfq/RfqContextSummary.tsx
 * @description Real-time live context telemetry strip at the top of the RFQ Workspace.
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { CanonicalShipmentCommon, CanonicalShipmentSpecific } from "../../../types/domain";
import { MasterCountry } from "../../../services/masterData";

interface RfqContextSummaryProps {
  common: CanonicalShipmentCommon;
  mode: string;
  specific: CanonicalShipmentSpecific;
  countries: MasterCountry[];
}

export function RfqContextSummary({
  common,
  mode,
  specific,
  countries,
}: RfqContextSummaryProps) {
  const { t } = useLanguage();

  if (!common.operationType && !mode) return null;

  const countryName = (id?: string) => {
    if (!id) return "";
    const c = countries.find((x) => x.id === id);
    return c ? (t(c.nameEn, c.nameAr)) : id;
  };

  const opLabel =
    common.operationType === "import"
      ? t("Import", "استيراد")
      : common.operationType === "export"
      ? t("Export", "تصدير")
      : "";

  const modeLabel =
    mode === "sea"
      ? `⚓ ${t("Sea", "بحري")}${specific.shipmentType ? ` (${specific.shipmentType.toUpperCase()})` : ""}`
      : mode === "air"
      ? `✈ ${t("Air", "جوي")}`
      : mode === "road"
      ? `🚛 ${t("Road", "بري")}${specific.shipmentType ? ` (${specific.shipmentType.toUpperCase()})` : ""}`
      : mode === "multimodal"
      ? `⇄ ${t("Multimodal", "متعدد الوسائط")}`
      : "";

  const originCountry =
    common.operationType === "export"
      ? countryName(common.operatingCountryId)
      : countryName(common.incotermCountryId);

  const destCountry = countryName(common.destinationCountryId);

  return (
    <div className="bg-slate-900 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold flex flex-wrap items-center gap-2 sm:gap-3 shadow-inner">
      {opLabel && (
        <span className="px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-400 border border-blue-500/30">
          {opLabel}
        </span>
      )}
      {modeLabel && (
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
          {modeLabel}
        </span>
      )}
      {common.incoterm && (
        <span className="px-2 py-0.5 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-mono">
          {common.incoterm}
        </span>
      )}
      {originCountry && destCountry && (
        <span className="text-slate-400 flex items-center gap-1.5 ms-auto font-medium">
          <span className="text-white font-bold">{originCountry}</span>
          <span className="text-blue-400">➔</span>
          <span className="text-white font-bold">{destCountry}</span>
        </span>
      )}
    </div>
  );
}

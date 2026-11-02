/**
 * @file src/components/forms/rfq/RfqIncotermSection.tsx
 * @description Steps 1.5 & 1.6: Dynamic Incoterm options with interactive ⓘ tooltips,
 *              and Incoterm Responsibility Point (Import) or Operational Departure Point (Export).
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { CanonicalShipmentCommon } from "../../../types/domain";
import { MasterCountry, MasterLocation } from "../../../services/masterData";
import {
  availableIncoterms,
  incotermPointType,
  INCOTERM_HELP,
} from "./rfqLogic";

interface RfqIncotermSectionProps {
  common: CanonicalShipmentCommon;
  mode: string;
  countries: MasterCountry[];
  locations: MasterLocation[];
  onChangeCommon: (updates: Partial<CanonicalShipmentCommon>) => void;
}

export function RfqIncotermSection({
  common,
  mode,
  countries,
  locations,
  onChangeCommon,
}: RfqIncotermSectionProps) {
  const { t, isArabic } = useLanguage();
  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  const isExport = common.operationType === "export";
  const terms = availableIncoterms(mode, common, locations);

  const headingText = isExport
    ? t("Contract Terms with Customer", "نوع التعاقد مع العميل")
    : t("Supplier Contract / Incoterm", "نوع التعاقد مع المورد");

  const departureControlledLabel =
    mode === "sea"
      ? t("Sea Port", "ميناء بحري")
      : mode === "air"
      ? t("Airport", "مطار")
      : t("Transport Point / Terminal", "نقطة نقل / محطة");

  const departureControlledValue = mode === "sea" ? "port" : mode === "air" ? "airport" : "terminal";

  // Filter departure locations in operating country
  const departureLocations = locations.filter((loc) => {
    if (loc.countryId !== common.operatingCountryId || loc.active === false) return false;
    if (mode === "sea") return loc.type === "port";
    if (mode === "air") return loc.type === "airport";
    return ["city", "port"].includes(loc.type);
  });

  // Filter current ports for CFR/CIF
  const currentPorts = locations.filter(
    (loc) =>
      loc.countryId === common.incotermCountryId &&
      loc.active !== false &&
      loc.type === "port"
  );

  function handleSelectIncoterm(term: string) {
    const pointType = isExport ? "export_delivery" : incotermPointType(term);
    onChangeCommon({
      incoterm: term,
      incotermPointType: pointType,
      ...(isExport
        ? { exportDepartureType: departureControlledValue as any }
        : { incotermCountryId: common.incotermCountryId || (pointType === "destination_port" ? common.destinationCountryId : "") }),
    });
  }

  function handleToggleDepartureLocation(locId: string) {
    const current = common.acceptableDepartureLocationIds || [];
    let updated: string[];
    if (current.includes(locId)) {
      updated = current.filter((id) => id !== locId);
    } else {
      updated = [...current, locId];
    }
    onChangeCommon({
      acceptableDepartureLocationIds: updated,
      incotermLocationId: updated[0] || "",
    });
  }

  return (
    <section className="space-y-6 pt-4 border-t border-slate-100">
      {/* ── 1.5 Incoterm Selector ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
            5
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-900">{headingText}</h3>
            <p className="text-xs text-slate-500">
              {t("Delivery term (Incoterm)", "شرط التسليم التجاري (Incoterm)")}
            </p>
          </div>
        </div>

        {terms.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2.5">
              {terms.map((term) => {
                const isSelected = common.incoterm === term;
                return (
                  <div key={term} className="inline-flex items-center rounded-xl border-2 transition overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleSelectIncoterm(term)}
                      className={`px-4 py-2 font-mono font-extrabold text-xs sm:text-sm cursor-pointer transition ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveHelp(activeHelp === term ? null : term)}
                      title={isArabic ? INCOTERM_HELP[term]?.ar : INCOTERM_HELP[term]?.en}
                      className={`px-2 py-2 text-xs transition cursor-pointer border-s ${
                        isSelected
                          ? "bg-blue-700 text-blue-100 border-blue-500"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200"
                      }`}
                    >
                      ⓘ
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Tooltip Description */}
            {activeHelp && INCOTERM_HELP[activeHelp] && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed animate-fade-in flex items-center justify-between">
                <span>
                  <strong>{activeHelp}:</strong>{" "}
                  {isArabic ? INCOTERM_HELP[activeHelp].ar : INCOTERM_HELP[activeHelp].en}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveHelp(null)}
                  className="text-blue-500 hover:text-blue-800 font-bold ms-3"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            {t(
              "Complete the physical destination details above to reveal the available contract terms.",
              "أكمل بيانات الوجهة ومكان التسليم أعلاه لعرض شروط التعاقد المتاحة."
            )}
          </div>
        )}
      </div>

      {/* ── 1.6 Incoterm Responsibility Point (Import) OR Operational Departure (Export) ── */}
      {common.incoterm && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono font-bold text-[11px] flex items-center justify-center">
              6
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {isExport
                  ? t("Departure / Pickup Point", "نقطة التحرك وبداية الشحن")
                  : t("Incoterm Responsibility Point", "نقطة مسؤولية واستلام الشحنة")}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isExport
                  ? t("Actual operational origin for quotation", "نقطة البداية الفعلية المطلوبة للتسعير")
                  : `${common.incoterm} — ${t("Define origin responsibility point", "تحديد نقطة استلام الشحنة وفق شرط التعاقد")}`}
              </p>
            </div>
          </div>

          {/* EXPORT BRANCH */}
          {isExport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => onChangeCommon({ exportDepartureType: departureControlledValue as any })}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    common.exportDepartureType === departureControlledValue
                      ? "border-blue-600 bg-white text-blue-900 shadow-2xs font-extrabold"
                      : "border-slate-200 bg-white/70 hover:bg-white text-slate-700"
                  }`}
                >
                  <span>{departureControlledLabel}</span>
                  {common.exportDepartureType === departureControlledValue && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => onChangeCommon({ exportDepartureType: "address" })}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    common.exportDepartureType === "address"
                      ? "border-blue-600 bg-white text-blue-900 shadow-2xs font-extrabold"
                      : "border-slate-200 bg-white/70 hover:bg-white text-slate-700"
                  }`}
                >
                  <span>{t("Point / Address", "نقطة / عنوان")}</span>
                  {common.exportDepartureType === "address" && <span>✓</span>}
                </button>
              </div>

              {/* Controlled Ports/Airports/Terminals Multi-Select */}
              {common.exportDepartureType === departureControlledValue && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {t(`Acceptable Departure ${departureControlledLabel}s *`, `موانئ / نقاط التحرك المقبولة *`)}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {departureLocations.map((loc) => {
                      const isSelected = (common.acceptableDepartureLocationIds || []).includes(loc.id);
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleToggleDepartureLocation(loc.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 font-bold"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          {isSelected && <span>✓</span>}
                          <span>{isArabic ? loc.nameAr : loc.nameEn}</span>
                          {loc.code && <span className="opacity-75 font-mono text-[10px]">({loc.code})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Address branch */}
              {common.exportDepartureType === "address" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Address / Named Point *", "العنوان / النقطة المسماة *")}
                    </label>
                    <input
                      type="text"
                      required
                      value={common.exportDepartureAddress || ""}
                      onChange={(e) => onChangeCommon({ exportDepartureAddress: e.target.value })}
                      placeholder={t("Warehouse, factory, district…", "المخزن، المصنع، المنطقة…")}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Location Link (Optional)", "رابط الموقع (اختياري)")}
                    </label>
                    <input
                      type="url"
                      value={common.exportDepartureLocationUrl || ""}
                      onChange={(e) => onChangeCommon({ exportDepartureLocationUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMPORT BRANCH */}
          {!isExport && (
            <div className="space-y-4">
              {/* Country selector for the Incoterm point */}
              <div className="max-w-md">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {common.incotermPointType === "supplier_pickup"
                    ? t("Supplier Country *", "بلد المورد *")
                    : t("Country for Incoterm Point *", "دولة نقطة التعاقد *")}
                </label>
                <select
                  value={common.incotermCountryId || ""}
                  onChange={(e) =>
                    onChangeCommon({
                      incotermCountryId: e.target.value,
                      acceptableDepartureLocationIds: [],
                      incotermLocationId: "",
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("Select Country", "اختر الدولة")}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isArabic ? c.nameAr : c.nameEn} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* FAS / FOB: loading_port -> Multi-select ports/airports in incotermCountryId */}
              {common.incotermPointType === "loading_port" && common.incotermCountryId && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("Acceptable Departure Points / Ports *", "موانئ / نقاط التحرك المقبولة *")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {locations
                      .filter((loc) => loc.countryId === common.incotermCountryId && loc.active !== false)
                      .map((loc) => {
                        const isSelected = (common.acceptableDepartureLocationIds || []).includes(loc.id);
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => handleToggleDepartureLocation(loc.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 font-bold"
                                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {isSelected && <span>✓</span>}
                            <span>{isArabic ? loc.nameAr : loc.nameEn}</span>
                            {loc.code && <span className="opacity-75 font-mono text-[10px]">({loc.code})</span>}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* CFR / CIF: destination_port -> Single Current Port */}
              {common.incotermPointType === "destination_port" && (
                <div className="max-w-md">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("Current / Arrival Port *", "الميناء الموجود به الشحنة *")}
                  </label>
                  <select
                    value={common.incotermLocationId || ""}
                    onChange={(e) => onChangeCommon({ incotermLocationId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("Select Port", "اختر الميناء")}</option>
                    {currentPorts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isArabic ? p.nameAr : p.nameEn} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* EXW, FCA, CPT, CIP, DPU, DAP, DDP: Address + Link */}
              {["supplier_pickup", "named_place", "delivery_point"].includes(common.incotermPointType || "") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {common.incotermPointType === "supplier_pickup"
                        ? t("Pickup Address *", "عنوان استلام الشحنة *")
                        : t("Named Place / Address *", "المكان أو العنوان المتفق عليه *")}
                    </label>
                    <input
                      type="text"
                      required
                      value={common.incotermAddress || ""}
                      onChange={(e) => onChangeCommon({ incotermAddress: e.target.value })}
                      placeholder={t("Factory, warehouse, district…", "المصنع، المستودع، المنطقة…")}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Location Map Link (Optional)", "رابط الموقع (اختياري)")}
                    </label>
                    <input
                      type="url"
                      value={common.incotermLocationUrl || ""}
                      onChange={(e) => onChangeCommon({ incotermLocationUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

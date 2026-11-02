/**
 * @file src/components/forms/rfq/RfqRouteDestinationSection.tsx
 * @description Steps 1.3 & 1.4: Company Location for this shipment and Physical Destination Type
 *              (Arrival Multi-Select vs. Final Written Address & Link).
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { CanonicalShipmentCommon } from "../../../types/domain";
import { MasterCountry, MasterLocation } from "../../../services/masterData";
import { IconSearch, IconCheck } from "../../ui/Icons";

interface RfqRouteDestinationSectionProps {
  common: CanonicalShipmentCommon;
  mode: string;
  countries: MasterCountry[];
  locations: MasterLocation[];
  onChangeCommon: (updates: Partial<CanonicalShipmentCommon>) => void;
}

export function RfqRouteDestinationSection({
  common,
  mode,
  countries,
  locations,
  onChangeCommon,
}: RfqRouteDestinationSectionProps) {
  const { t, isArabic } = useLanguage();
  const [destSearch, setDestSearch] = useState("");

  const isImport = common.operationType === "import";
  const activeCountryId = isImport ? common.operatingCountryId : common.destinationCountryId;

  // Filter allowed location types based on mode
  const allowedLocationTypes =
    mode === "air"
      ? ["airport"]
      : mode === "road"
      ? ["city", "port", "airport"]
      : ["port"];

  // Filtered available locations
  const availableLocations = locations.filter(
    (loc) =>
      loc.countryId === activeCountryId &&
      loc.active !== false &&
      allowedLocationTypes.includes(loc.type)
  );

  const searchedLocations = availableLocations.filter((loc) => {
    if (!destSearch.trim()) return true;
    const term = destSearch.toLowerCase();
    return (
      loc.nameEn.toLowerCase().includes(term) ||
      loc.nameAr.includes(term) ||
      (loc.code && loc.code.toLowerCase().includes(term))
    );
  });

  const arrivalTypeLabel =
    mode === "sea"
      ? t("Seaport", "ميناء بحري")
      : mode === "air"
      ? t("Airport", "مطار")
      : t("Arrival / Delivery Point", "نقطة وصول / تسليم");

  function handleToggleDestinationLocation(locId: string) {
    const current = common.acceptableDestinationLocationIds || [];
    let updated: string[];
    if (current.includes(locId)) {
      updated = current.filter((id) => id !== locId);
    } else {
      updated = [...current, locId];
    }
    onChangeCommon({
      acceptableDestinationLocationIds: updated,
      destinationLocationId: updated[0] || "",
    });
  }

  return (
    <section className="space-y-6 pt-4 border-t border-slate-100">
      {/* ── 1.3 Company Location ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
            3
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {t("Company Location for This Shipment", "بلد الشركة لهذا الطلب")}
            </h3>
            <p className="text-xs text-slate-500">
              {t(
                "Automatically selected from your company profile. You can change it for this request.",
                "تم تحديده تلقائيًا من ملف الشركة ويمكن تغييره لهذا الطلب فقط."
              )}
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <select
            value={common.operatingCountryId}
            onChange={(e) => {
              const newCountry = e.target.value;
              onChangeCommon({
                operatingCountryId: newCountry,
                ...(isImport ? { destinationCountryId: newCountry, acceptableDestinationLocationIds: [], destinationLocationId: "" } : {}),
              });
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {isArabic ? c.nameAr : c.nameEn} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 1.4 Physical Destination Type ── */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
            4
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {t("Physical Destination / Delivery Requirement", "الوجهة النهائية / مكان التسليم")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("Where do you want your cargo delivered?", "أين تريد تسليم البضاعة في النهاية؟")}
            </p>
          </div>
        </div>

        {/* Destination Type Select: arrival or address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          <button
            type="button"
            onClick={() => onChangeCommon({ deliveryType: "arrival" })}
            className={`p-3.5 rounded-xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
              common.deliveryType === "arrival"
                ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="font-extrabold text-xs sm:text-sm">{arrivalTypeLabel}</div>
              <div className="text-[11px] text-slate-500 font-normal">
                {t("Port, airport, or freight terminal", "ميناء، مطار، أو محطة تفريغ")}
              </div>
            </div>
            {common.deliveryType === "arrival" && (
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <IconCheck size={12} />
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeCommon({ deliveryType: "address" })}
            className={`p-3.5 rounded-xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
              common.deliveryType === "address"
                ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="font-extrabold text-xs sm:text-sm">{t("Final Address", "العنوان النهائي")}</div>
              <div className="text-[11px] text-slate-500 font-normal">
                {t("Warehouse, factory, or project site", "مستودع، مصنع، أو موقع محدد")}
              </div>
            </div>
            {common.deliveryType === "address" && (
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <IconCheck size={12} />
              </div>
            )}
          </button>
        </div>

        {/* Revealed Branch based on Destination Type */}
        {common.deliveryType && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
            {/* If Export, show Destination Country */}
            {!isImport && (
              <div className="max-w-md">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Destination Country *", "دولة الوصول *")}
                </label>
                <select
                  value={common.destinationCountryId}
                  onChange={(e) =>
                    onChangeCommon({
                      destinationCountryId: e.target.value,
                      acceptableDestinationLocationIds: [],
                      destinationLocationId: "",
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("Select Destination Country", "اختر دولة الوصول")}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isArabic ? c.nameAr : c.nameEn} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Arrival multi-select */}
            {common.deliveryType === "arrival" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    {t(
                      `Acceptable ${arrivalTypeLabel}s *`,
                      `${arrivalTypeLabel} المقبولة *`
                    )}
                    <span className="text-slate-400 font-normal ms-2">
                      ({t("You can select multiple acceptable points", "يمكنك اختيار أكثر من نقطة مقبولة")})
                    </span>
                  </label>
                  {(common.acceptableDestinationLocationIds || []).length > 0 && (
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      {common.acceptableDestinationLocationIds.length} {t("Selected", "محدد")}
                    </span>
                  )}
                </div>

                {/* Quick Search */}
                <div className="relative max-w-sm">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-400">
                    <IconSearch size={14} />
                  </div>
                  <input
                    type="text"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    placeholder={t("Search locations / ports…", "ابحث في الموانئ والمواقع…")}
                    className="w-full ps-9 pe-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Multi-select chips */}
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pt-1">
                  {searchedLocations.length > 0 ? (
                    searchedLocations.map((loc) => {
                      const isSelected = (common.acceptableDestinationLocationIds || []).includes(loc.id);
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleToggleDestinationLocation(loc.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-bold"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          {isSelected && <span>✓</span>}
                          <span>{isArabic ? loc.nameAr : loc.nameEn}</span>
                          {loc.code && <span className="opacity-75 font-mono text-[10px]">({loc.code})</span>}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 py-2">
                      {t("No locations available for selected country and mode.", "لا توجد مواقع متوفرة للدولة ووسيلة الشحن المحددة.")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Address input */}
            {common.deliveryType === "address" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("Written Address *", "العنوان المكتوب *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={common.destinationAddress || ""}
                    onChange={(e) => onChangeCommon({ destinationAddress: e.target.value })}
                    placeholder={t("Street, district, warehouse, building…", "الشارع، المنطقة، المستودع، المبنى…")}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("Location Map Link (Optional)", "رابط الموقع على الخريطة (اختياري)")}
                  </label>
                  <input
                    type="url"
                    value={common.destinationLocationUrl || ""}
                    onChange={(e) => onChangeCommon({ destinationLocationUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

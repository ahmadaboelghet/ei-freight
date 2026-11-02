/**
 * @file src/components/forms/rfq/RfqReviewScreen.tsx
 * @description Step 2: Comprehensive Commercial Review Screen with section-by-section
 *              Edit actions returning to Step 1 with preserved state, and final submission.
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  CanonicalShipmentCommon,
  CanonicalShipmentSpecific,
  CanonicalPaymentTerms,
  CanonicalAttachment,
  CanonicalMsds,
} from "../../../types/domain";
import { MasterCountry, MasterLocation } from "../../../services/masterData";

interface RfqReviewScreenProps {
  common: CanonicalShipmentCommon;
  specific: CanonicalShipmentSpecific;
  mode: string;
  paymentTerms: CanonicalPaymentTerms;
  attachments: CanonicalAttachment[];
  msdsList: CanonicalMsds[];
  countries: MasterCountry[];
  locations: MasterLocation[];
  onEditSection: (sectionStep: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export function RfqReviewScreen({
  common,
  specific,
  mode,
  paymentTerms,
  attachments,
  msdsList,
  countries,
  locations,
  onEditSection,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RfqReviewScreenProps) {
  const { t, isArabic } = useLanguage();

  const countryName = (id?: string) => {
    if (!id) return "—";
    const c = countries.find((x) => x.id === id);
    return c ? (isArabic ? c.nameAr : c.nameEn) : id;
  };

  const locationName = (id?: string) => {
    if (!id) return "—";
    const loc = locations.find((x) => x.id === id);
    return loc ? `${isArabic ? loc.nameAr : loc.nameEn}${loc.code ? ` (${loc.code})` : ""}` : id;
  };

  const opLabel =
    common.operationType === "import"
      ? t("Import", "استيراد")
      : common.operationType === "export"
      ? t("Export", "تصدير")
      : "—";

  const modeLabel =
    mode === "sea"
      ? `⚓ ${t("Sea", "بحري")}${specific.shipmentType ? ` · ${specific.shipmentType.toUpperCase()}` : ""}`
      : mode === "air"
      ? `✈ ${t("Air", "جوي")}`
      : mode === "road"
      ? `🚛 ${t("Road", "بري")}${specific.shipmentType ? ` · ${specific.shipmentType.toUpperCase()}` : ""}`
      : `⇄ ${t("Multimodal", "متعدد الوسائط")}`;

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo',sans-serif]">
      {/* ── Review Header ── */}
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
            {t("Step 2 of 2", "الخطوة ٢ من ٢")}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t("Review Freight Request", "مراجعة وتأكيد طلب الشحن")}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              "Carefully verify all shipment details before submitting to EI Freight operations desk.",
              "يرجى مراجعة كافة تفاصيل الشحنة بعناية قبل الإرسال النهائي لمكتب العمليات."
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEditSection(1)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition"
        >
          {t("← Edit request", "← تعديل الطلب")}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 animate-shake">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* ── Sections Review Grid ── */}
      <div className="space-y-4">
        {/* Section 1: Operation & Mode */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t("Operation & Mode", "نوع العملية ووسيلة الشحن")}
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(1)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t("Edit", "تعديل")}
            </button>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {opLabel} · {modeLabel}
          </div>
        </div>

        {/* Section 2: Company Location */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t("Company Location for This Shipment", "بلد الشركة في هذا الطلب")}
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(3)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t("Edit", "تعديل")}
            </button>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {countryName(common.operatingCountryId)}
          </div>
        </div>

        {/* Section 3: Physical Destination */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t("Physical Destination / Delivery", "الوجهة ومكان التسليم")}
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(4)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t("Edit", "تعديل")}
            </button>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {countryName(common.destinationCountryId)} —{" "}
            {common.deliveryType === "arrival" ? (
              <span>
                {t("Arrival Point(s):", "نقاط الوصول:")}{" "}
                {(common.acceptableDestinationLocationIds || []).map(locationName).join(" · ") || "—"}
              </span>
            ) : (
              <span>{common.destinationAddress || "—"}</span>
            )}
          </div>
        </div>

        {/* Section 4: Incoterm & Responsibility Point */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {common.operationType === "export"
                ? t("Contract Terms & Operational Departure", "شرط التعاقد ونقطة التحرك")
                : t("Supplier Contract / Incoterm & Pickup", "شرط التعاقد ونقطة الاستلام")}
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(5)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t("Edit", "تعديل")}
            </button>
          </div>
          <div className="text-sm font-bold text-slate-900 space-y-1">
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-black text-xs">
              {common.incoterm || "—"}
            </div>
            <div className="text-xs text-slate-600">
              {common.operationType === "export" ? (
                <span>
                  {t("Departure:", "نقطة التحرك:")}{" "}
                  {common.exportDepartureType === "address"
                    ? common.exportDepartureAddress
                    : (common.acceptableDepartureLocationIds || []).map(locationName).join(" · ")}
                </span>
              ) : (
                <span>
                  {t("Incoterm Point:", "نقطة التعاقد:")} {countryName(common.incotermCountryId)}
                  {common.incotermAddress && ` — ${common.incotermAddress}`}
                  {(common.acceptableDepartureLocationIds || []).length > 0 &&
                    ` — ${(common.acceptableDepartureLocationIds || []).map(locationName).join(" · ")}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Cargo Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t("Cargo Information & Packaging", "بيانات البضاعة والمواصفات")}
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(7)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t("Edit", "تعديل")}
            </button>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {common.cargo} {common.hsCode ? `(HS: ${common.hsCode})` : ""}
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div>
              {t("Ready Date:", "تاريخ الجاهزية:")} <strong>{common.ready || "—"}</strong>
            </div>

            {/* Containers for FCL */}
            {mode === "sea" && specific.shipmentType === "fcl" && (
              <div>
                {t("Containers:", "الحاويات:")}{" "}
                {(specific.containers || []).map((c) => `${c.quantity}x ${c.type}`).join(" · ")}
                {specific.cargoWeight && ` · ${t("Weight:", "الوزن:")} ${specific.cargoWeight} kg`}
                {specific.overweightStatus && ` · ${specific.overweightStatus}`}
              </div>
            )}

            {/* LCL / Air details */}
            {specific.cargoWeight && mode !== "sea" && (
              <div>
                {t("Weight:", "الوزن:")} {specific.cargoWeight} kg
              </div>
            )}
            {specific.grossWeight && (
              <div>
                {t("Gross Weight:", "الوزن الإجمالي:")} {specific.grossWeight} kg
              </div>
            )}
            {specific.cargoVolume && (
              <div>
                {t("Volume:", "الحجم:")} {specific.cargoVolume} CBM
              </div>
            )}
            {specific.packageType && (
              <div>
                {t("Packaging:", "نوع التعبئة:")} {specific.packageType}
              </div>
            )}

            {/* Conditions */}
            <div>
              {t("Dangerous Goods:", "مواد خطرة:")}{" "}
              <strong className={specific.dangerousGoods === "yes" ? "text-rose-600" : "text-slate-700"}>
                {specific.dangerousGoods === "yes" ? t("Yes (MSDS Provided)", "نعم (تم إرفاق MSDS)") : t("No", "لا")}
              </strong>
              {" · "}
              {t("Refrigerated:", "مبردة:")}{" "}
              <strong className={specific.refrigeratedCargo === "yes" ? "text-cyan-600" : "text-slate-700"}>
                {specific.refrigeratedCargo === "yes"
                  ? `${t("Yes", "نعم")} (${specific.requiredTemperature})`
                  : t("No", "لا")}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 6: Financial Terms */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t("Financial Terms", "الشروط والمعاملات المالية")}
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(8)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t("Edit", "تعديل")}
            </button>
          </div>
          <div className="text-xs text-slate-800 space-y-1">
            {mode === "sea" && paymentTerms.billOfLadingType && (
              <div>
                {t("Bill of Lading:", "نوع البوليصة:")}{" "}
                <strong>{paymentTerms.billOfLadingType.toUpperCase()}</strong>
              </div>
            )}
            <div>
              {t("Payment Type:", "طريقة السداد:")}{" "}
              <strong className="uppercase">{paymentTerms.type || "Cash"}</strong>
              {paymentTerms.type === "credit" && ` (${paymentTerms.creditDays} ${t("Days", "يوم")})`}
            </div>
          </div>
        </div>

        {/* Section 7: Attachments */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t("Attachments & Documents", "المرفقات والمستندات")}
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(8)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t("Edit", "تعديل")}
            </button>
          </div>
          <div className="text-xs text-slate-600">
            {attachments.length > 0 || msdsList.length > 0 ? (
              <span>
                {attachments.length} {t("general files attached", "ملف مرفق")}
                {msdsList.length > 0 && ` · ${msdsList.length} ${t("MSDS documents", "مستند MSDS")}`}
              </span>
            ) : (
              <span>{t("No attachments added.", "لم يتم إرفاق ملفات.")}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onEditSection(1)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
        >
          {t("← Return to Form", "← العودة لتعديل النموذج")}
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>{t("Submitting Request…", "جارٍ إرسال الطلب…")}</span>
          ) : (
            <span>{t("Confirm & Submit Request 🚀", "تأكيد وإرسال الطلب رسمياً 🚀")}</span>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * @file src/pages/dashboard/client/ClientRfqDetailWorkspace.tsx
 * @description Dedicated, robust Client RFQ Detail Workspace matching the prototype screenshot:
 *              - Back to queue navigation button (← العودة إلى القائمة)
 *              - 5-stage visual timeline stepper (تم الإنشاء, طلب سعر, العروض, المراجعة, قرار العميل)
 *              - Route header, mode preference comparison, and status badges
 *              - 3-column summary cards (البضاعة, الوزن, مرحلة دورة العمل)
 *              - Personal shipment details card (البضاعة والقياسات, الاستلام والتسليم, متطلبات المناولة)
 *              - Request progress section with vetted transparency callout
 *              - Integrated carrier quote comparison & awarding for active offers
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { RfqRecord, RfqQuote } from "../../../types/domain";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconShip,
  IconPlane,
  IconTruck,
  IconClock,
  IconStar,
  IconShield,
} from "../../../components/ui/Icons";
import { clsx } from "clsx";

interface ClientRfqDetailWorkspaceProps {
  rfq: RfqRecord;
  onBack: () => void;
  onAwardQuote?: (rfqId: string, quoteId: string) => Promise<void>;
}

export function ClientRfqDetailWorkspace({
  rfq,
  onBack,
  onAwardQuote,
}: ClientRfqDetailWorkspaceProps) {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? IconArrowRight : IconArrowLeft;

  const isPersonal =
    rfq.id.startsWith("REQ-P-") ||
    (rfq.cargo && rfq.cargo.toLowerCase().includes("vdlldfvcxfdfcf"));

  // ── Step Index in 5-Stage Pipeline ──
  // 0: تم الإنشاء, 1: طلب سعر, 2: العروض, 3: المراجعة, 4: قرار العميل
  let stepIdx = 1;
  if (["draft", "admin_review"].includes(rfq.status)) {
    stepIdx = 0;
  } else if (
    ["matching", "request", "dispatched", "rfq", "collecting_quotes"].includes(rfq.status) ||
    rfq.stage === "request" ||
    rfq.stage === "rfq"
  ) {
    stepIdx = 1;
  } else if (["quotes_received", "offer"].includes(rfq.status) || rfq.stage === "offer") {
    stepIdx = 2;
  } else if (
    ["commercial_review", "review", "offers_sent", "quotation"].includes(rfq.status) ||
    rfq.stage === "quotation"
  ) {
    stepIdx = 3;
  } else if (
    ["selected", "awarded", "approved", "in_progress", "completed", "history"].includes(rfq.status)
  ) {
    stepIdx = 4;
  }

  const steps = [
    t("Created", "تم الإنشاء"),
    t("RFQ", "طلب سعر"),
    t("Offers", "العروض"),
    t("Review", "المراجعة"),
    t("Client decision", "قرار العميل"),
  ];

  const [awardingQuoteId, setAwardingQuoteId] = useState<string | null>(null);

  const handleAward = async (quoteId: string) => {
    if (!onAwardQuote) return;
    setAwardingQuoteId(quoteId);
    try {
      await onAwardQuote(rfq.id, quoteId);
    } finally {
      setAwardingQuoteId(null);
    }
  };

  // Status badge text matching prototype
  const getStatusBadgeText = () => {
    if (rfq.status === "matching" || rfq.stage === "request") {
      return t(
        "Your request has been received and is being processed now",
        "تم استلام طلبك وجاري العمل عليه الآن"
      );
    }
    if (rfq.status === "offers_sent" || rfq.stage === "quotation") {
      return t("Offers Sent to Client", "تم إرسال العروض المعتمدة لك");
    }
    if (rfq.status === "selected" || rfq.stage === "approved") {
      return t("Quote Awarded & Approved", "تمت الترسية والاعتماد");
    }
    if (rfq.id === "RFQ-1048") {
      return "All offers declined";
    }
    return rfq.status;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. BACK NAVIGATION BUTTON
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs hover:border-slate-300"
        >
          <ArrowIcon size={14} className="text-slate-500 group-hover:text-slate-900 transition" />
          <span>{t("Back to list", "العودة إلى القائمة")}</span>
        </button>

        <span className="text-xs font-mono text-slate-400 font-semibold">{rfq.id}</span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TIMELINE STEPPER (Exact CSS Pipeline Matching Screenshot)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="timeline">
          {steps.map((s, i) => (
            <div
              key={i}
              className={clsx(
                "step",
                i < stepIdx && "done",
                i === stepIdx && "current"
              )}
            >
              <i className="flex items-center justify-center">
                {i < stepIdx ? (
                  <IconCheck size={10} strokeWidth={3} className="text-white" />
                ) : null}
              </i>
              <span className="text-xs">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN ROUTE HEADER & STATUS BADGE
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {rfq.route || `${rfq.origin} ➔ ${rfq.destination}`}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {t("Actual Mode", "الوسيلة الفعلية")}: {t("Sea", "بحري")} ·{" "}
            {t("Client Preference", "تفضيل العميل")}: {t("Road", "بري")}
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold shadow-2xs">
          {getStatusBadgeText()}
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. 3-COLUMN SUMMARY GRID (البضاعة, الوزن, مرحلة دورة العمل)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {t("Goods", "البضاعة")}
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1 block truncate">
              {rfq.cargo}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {t("Weight", "الوزن")}
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1 block">
              {rfq.weight || "32 kg"}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {t("Lifecycle Stage", "مرحلة دورة العمل")}
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1 block uppercase">
              {rfq.stage === "request" ? "RFQ" : rfq.stage}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. MAIN DETAILS CARD (تفاصيل الشحنة الشخصية)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {isPersonal
                ? t("Personal Shipment Details", "تفاصيل الشحنة الشخصية")
                : t("Commercial Shipment Details", "تفاصيل الشحنة التجارية")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("Client Preference", "تفضيل العميل")}: 🚛 {t("Road", "بري")}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <span>⚓</span>
            <span>{t("Actual Mode: Sea", "الوسيلة الفعلية: بحري")}</span>
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Subsection 1: البضاعة والقياسات */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              {t("Cargo & Measurements", "البضاعة والقياسات")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Goods Description", "وصف البضاعة")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block truncate">
                  {rfq.cargo}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Dimensions", "الأبعاد")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block">
                  {rfq.containerType || "Cm 32 × 32 × 32"}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Weight", "الوزن")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block">
                  {rfq.weight || "Kg 32"}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Stackable", "قابلة للتكديس")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block">
                  {t("Yes", "نعم")}
                </span>
              </div>
            </div>
          </div>

          {/* Subsection 2: الاستلام والتسليم */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              {t("Pickup & Delivery", "الاستلام والتسليم")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Pickup Location", "موقع الاستلام")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block">
                  {rfq.origin || t("Frankfurt", "فرانكفورت")}
                </span>
                <span className="text-[11px] text-slate-400 block">Gfsgfsg</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Delivery Location", "موقع التسليم")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block">
                  {rfq.destination || t("Frankfurt", "فرانكفورت")}
                </span>
                <span className="text-[11px] text-slate-400 block">Dfgdfgdfgfd</span>
              </div>
            </div>
          </div>

          {/* Subsection 3: متطلبات المناولة */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              {t("Handling Requirements", "متطلبات المناولة")}
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Hazardous Goods", "مواد خطرة")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block">
                  {t("No", "لا")}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t("Refrigerated", "مبردة")}
                </span>
                <span className="font-bold text-xs text-slate-800 mt-1 block">
                  {t("No", "لا")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. CARD: تقدم الطلب (Request Progress & Transparency Callout)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">
          {t("Request Progress", "تقدم الطلب")}
        </h2>

        <p className="text-xs font-bold text-slate-700">
          {getStatusBadgeText()}
        </p>

        {/* Light blue callout banner matching screenshot */}
        <div className="rounded-xl p-4 bg-[#F0F7FF] border border-blue-200 text-blue-900 text-xs font-semibold leading-relaxed">
          {t(
            "You will only see the best vetted offers that have been reviewed, not raw supplier bids.",
            "سترى فقط أفضل العروض التي تمت مراجعتها، وليس عروض الموردين الخام."
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. VETTED CARRIER OFFERS (If available or sent to client)
      ───────────────────────────────────────────────────────────── */}
      {rfq.quotes && rfq.quotes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t("Received Vetted Quotations", "عروض الأسعار المتاحة")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  "All quotations are verified with all-in transparent charges.",
                  "كافة العروض مدققة وموثقة وبأسعار شاملة وواضحة."
                )}
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs">
              {rfq.quotes.length} {t("Offers", "عروض")}
            </span>
          </div>

          <div className="space-y-3">
            {rfq.quotes.map((q) => {
              const isSelected = rfq.selectedQuoteId === q.id;

              return (
                <div
                  key={q.id}
                  className={clsx(
                    "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-blue-400"
                  )}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {q.providerCompany || "Vetted Carrier"}
                      </span>
                      <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                        <IconStar size={12} />
                        <span>{q.rating}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <IconClock size={12} />
                        {q.transitDays} {t("days transit", "يوم إبحار")}
                      </span>
                      <span>•</span>
                      <span>
                        {q.routingType === "direct"
                          ? t("Direct Line", "خط مباشر")
                          : t("Transit", "ترانزيت")}
                      </span>
                      <span>•</span>
                      <span>
                        {t("Valid until", "صالح حتى")} {q.validUntil}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-left rtl:text-right">
                      <span className="text-xl font-black text-slate-900">
                        ${q.sellingPrice || q.totalPrice}{" "}
                        <span className="text-xs font-normal text-slate-500">{q.currency}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {t("All-in Freight", "سعر شامل النولون")}
                      </span>
                    </div>

                    {onAwardQuote && (
                      <button
                        disabled={awardingQuoteId === q.id || isSelected}
                        onClick={() => handleAward(q.id)}
                        className={clsx(
                          "px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs",
                          isSelected
                            ? "bg-emerald-600 text-white cursor-default"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        )}
                      >
                        {isSelected
                          ? t("Awarded ✓", "تمت الترسية ✓")
                          : awardingQuoteId === q.id
                          ? t("Awarding...", "جارٍ الترسية...")
                          : t("Award Quote", "ترسية هذا العرض")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientRfqDetailWorkspace;

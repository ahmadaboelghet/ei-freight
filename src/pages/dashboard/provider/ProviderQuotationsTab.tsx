/**
 * @file src/pages/dashboard/provider/ProviderQuotationsTab.tsx
 * @description My Quotations Tab (عروض الأسعار) for the Service Provider workspace.
 *              Displays all submitted commercial bids, pricing breakdowns, transit estimates,
 *              and commercial statuses with EI Freight.
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ProviderMatchedRfq } from "./types";
import { IconFileText } from "../../../components/ui/Icons";

interface ProviderQuotationsTabProps {
  rfqs: ProviderMatchedRfq[];
  onOpenQuote: (rfq: ProviderMatchedRfq) => void;
}

export function ProviderQuotationsTab({
  rfqs,
  onOpenQuote,
}: ProviderQuotationsTabProps) {
  const { t, isArabic } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const quotedRfqs = rfqs.filter((r) => r.hasSubmitted);

  const filteredQuotes = quotedRfqs.filter((r) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "selected") return r.quote?.status === "selected";
    if (filterStatus === "active") return r.quote?.status === "active";
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo',sans-serif]">
      {/* ── Top Header ── */}
      <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("My Quotations", "عروض الأسعار")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              "Commercial freight quotes submitted by your company to EI Freight",
              "جميع العروض التجارية المقدمة من شركتك لطلبات الشحن"
            )}
          </p>
        </div>

        {/* Status Filter */}
        <div className="shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="all">{t("All Quotations", "جميع العروض")}</option>
            <option value="active">{t("Under Review", "قيد المراجعة")}</option>
            <option value="selected">{t("Awarded / Selected", "تم الاختيار")}</option>
          </select>
        </div>
      </div>

      {/* ── Quotations List ── */}
      <div className="space-y-4">
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Route & Cargo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {rfq.id}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {rfq.modeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span>●</span>
                    <span>
                      {rfq.quote?.status === "selected"
                        ? t("Awarded", "تم الاختيار")
                        : t("Under Review", "قيد المراجعة لدى المنصة")}
                    </span>
                  </span>
                </div>

                <div className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>{rfq.origin}</span>
                  <span className="text-slate-400 font-normal">{isArabic ? "←" : "➔"}</span>
                  <span>{rfq.destination}</span>
                </div>

                <p className="text-xs text-slate-500">
                  {rfq.cargo} · {rfq.weight}
                  {rfq.quote?.transitDays && (
                    <span className="ms-2 text-slate-600 font-medium">
                      · {t("Estimated transit:", "المدة التقديرية:")} {rfq.quote.transitDays} {t("days", "أيام")}
                    </span>
                  )}
                </p>
              </div>

              {/* Pricing breakdown & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                <div className="text-right rtl:text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t("Total Quoted Price", "إجمالي السعر المقدم")}
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ${rfq.mySubmittedPrice?.toLocaleString() || rfq.quote?.totalPrice?.toLocaleString() || "1,980"}
                    <span className="text-xs font-normal text-slate-500 ms-1">USD</span>
                  </span>
                  {rfq.quote?.validUntil && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {t("Valid until:", "صالح حتى:")} {rfq.quote.validUntil}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenQuote(rfq)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <IconFileText size={15} />
                  <span>{t("Quote Details", "تفاصيل العرض")}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500">
            <p className="text-sm font-semibold">
              {t("No quotations submitted yet.", "لا توجد عروض أسعار مقدمة حتى الآن.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

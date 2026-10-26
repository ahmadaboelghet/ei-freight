/**
 * @file src/pages/dashboard/provider/ProviderOpportunitiesTab.tsx
 * @description Opportunity Desk matching Image 1:
 *              - Welcome header with direct link to Performance Analytics
 *              - 4 Key Metrics (Available RFQs, Submitted, Selected, In-Progress)
 *              - Recent Opportunities & Activity (empty state or active list)
 *              - Callout card: Maintain active quotation pipeline
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ProviderMatchedRfq } from "./types";
import { clsx } from "clsx";

interface ProviderOpportunitiesTabProps {
  displayName?: string | null;
  companyName?: string | null;
  rfqs: ProviderMatchedRfq[];
  onNavigateTab: (tabId: string) => void;
  onOpenQuote: (rfq: ProviderMatchedRfq) => void;
}

export function ProviderOpportunitiesTab({
  displayName,
  companyName,
  rfqs,
  onNavigateTab,
  onOpenQuote,
}: ProviderOpportunitiesTabProps) {
  const { t, isArabic } = useLanguage();

  const firstName = displayName ? displayName.split(" ")[0] : "Tarek";

  const submittedQuotes = rfqs.filter((r) => r.hasSubmitted);
  const availableRfqs = rfqs.filter((r) => !r.hasSubmitted);
  const selectedQuotes = rfqs.filter((r) => r.quote?.status === "selected");
  const inProgressCount = 0;

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo',sans-serif]">
      {/* ── Top Welcome & Performance Switcher Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t(`Welcome, ${firstName}.`, `مرحبًا، ${firstName}.`)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              "Track current pricing opportunities and selected operations",
              "تابع الفرص الحالية والعمليات المختارة"
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab("analytics")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition group cursor-pointer"
        >
          <span>{isArabic ? "←" : ""}</span>
          <span>{t("View performance", "عرض الأداء")}</span>
          <span>{!isArabic ? "→" : ""}</span>
        </button>
      </div>

      {/* ── 4 KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available RFQs */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition hover:shadow-md hover:border-slate-300">
          <div className="text-xs font-bold text-slate-500 mb-1">
            {t("Available RFQs", "طلبات الأسعار المتاحة")}
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            {availableRfqs.length}
          </div>
        </div>

        {/* Card 2: Submitted Quotes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition hover:shadow-md hover:border-slate-300">
          <div className="text-xs font-bold text-slate-500 mb-1">
            {t("Submitted Quotes", "العروض المقدمة")}
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            {submittedQuotes.length}
          </div>
        </div>

        {/* Card 3: Selected Quotes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition hover:shadow-md hover:border-slate-300">
          <div className="text-xs font-bold text-slate-500 mb-1">
            {t("Selected Quotes", "العروض المختارة")}
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            {selectedQuotes.length}
          </div>
        </div>

        {/* Card 4: In Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition hover:shadow-md hover:border-slate-300">
          <div className="text-xs font-bold text-slate-500 mb-1">
            {t("In Progress", "قيد التنفيذ")}
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            {inProgressCount}
          </div>
        </div>
      </div>

      {/* ── Two Column Activity Area matching Screenshot 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Column (2/3): Latest Opportunities and Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {t("Latest Opportunities and Activity", "أحدث الفرص والنشاط")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  "Selected shipments remain visible while moving to execution",
                  "تظل الأعمال المختارة ظاهرة أثناء انتقالها إلى التنفيذ"
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("requests")}
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-white transition cursor-pointer shrink-0"
            >
              {t("View All", "عرض الكل")}
            </button>
          </div>

          {/* Activity Content Area */}
          <div className="p-6">
            {/* If there are unsubmitted available RFQs or selected shipments, show preview cards; otherwise exact empty state */}
            {availableRfqs.length > 0 ? (
              <div className="space-y-3">
                {availableRfqs.slice(0, 2).map((rfq) => (
                  <div
                    key={rfq.id}
                    className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {rfq.id}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{rfq.modeLabel}</span>
                        <span className="text-[11px] text-amber-600 font-bold">
                          ⏱ {rfq.deadlineDays} {t("days left", "أيام متبقية")}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{rfq.origin}</span>
                        <span className="text-slate-400 font-normal">{isArabic ? "←" : "➔"}</span>
                        <span>{rfq.destination}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {rfq.cargo} · {rfq.weight}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenQuote(rfq)}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs shrink-0 cursor-pointer"
                    >
                      {t("Submit Quote", "تقديم عرض سعر")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  {t(
                    "No opportunities or selected operations currently.",
                    "لا توجد فرص أو عمليات مختارة حاليًا."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab("requests")}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                >
                  {t("Browse Matched Requests", "استعراض الطلبات المطابقة")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Side Column (1/3): Blue Callout Card matching Screenshot 1 */}
        <div className="bg-[#f0f7ff] rounded-2xl border border-blue-100 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900">
            {t("Keep Your Offers Active", "حافظ على نشاط عروضك")}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t(
              "Review available quotation requests, submit full commercial details, and track selected business directly from the workspace itself.",
              "راجع طلبات الأسعار المتاحة وقدم التفاصيل التجارية كاملة وتابع الأعمال المختارة من مساحة العمل نفسها."
            )}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab("requests")}
              className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 transition shadow-2xs cursor-pointer"
            >
              {t("Explore Matched Requests", "الانتقال إلى الطلبات المطابقة")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

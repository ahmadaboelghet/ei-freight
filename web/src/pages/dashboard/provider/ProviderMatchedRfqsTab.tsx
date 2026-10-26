/**
 * @file src/pages/dashboard/provider/ProviderMatchedRfqsTab.tsx
 * @description Matched RFQs View matching Image 3:
 *              - Header with total available RFQs count
 *              - Filter toolbar: Transport mode dropdown & live search input
 *              - Exact RFQ card structure (Route, Cargo, ID, "Protected client identity", Mode, Status, Action)
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ProviderMatchedRfq } from "./types";
import { IconSearch } from "../../../components/ui/Icons";

interface ProviderMatchedRfqsTabProps {
  rfqs: ProviderMatchedRfq[];
  onOpenQuote: (rfq: ProviderMatchedRfq) => void;
}

export function ProviderMatchedRfqsTab({
  rfqs,
  onOpenQuote,
}: ProviderMatchedRfqsTabProps) {
  const { t, isArabic } = useLanguage();
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filtering logic
  const filteredRfqs = rfqs.filter((rfq) => {
    const matchesMode = modeFilter === "all" || rfq.mode === modeFilter;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      rfq.id.toLowerCase().includes(term) ||
      rfq.route.toLowerCase().includes(term) ||
      rfq.origin.toLowerCase().includes(term) ||
      rfq.destination.toLowerCase().includes(term) ||
      rfq.cargo.toLowerCase().includes(term);

    return matchesMode && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo',sans-serif]">
      {/* ── Top Header matching Screenshot 3 ── */}
      <div className="pb-2 border-b border-slate-100">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t("Matched RFQs", "الطلبات المطابقة")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t(
            `${filteredRfqs.length} request(s) available in the workspace`,
            `${filteredRfqs.length} طلب متاح في مساحة العمل`
          )}
        </p>
      </div>

      {/* ── Filters Toolbar matching Screenshot 3 ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Mode Dropdown */}
        <div className="shrink-0">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="all">{t("All Modes", "كل الوسائل")}</option>
            <option value="sea">{t("⚓ Ocean Freight", "⚓ بحري")}</option>
            <option value="air">{t("✈ Air Freight", "✈ جوي")}</option>
            <option value="road">{t("🚛 Land Freight", "🚛 بري")}</option>
            <option value="multimodal">{t("⇄ Multimodal", "⇄ متعدد الوسائط")}</option>
          </select>
        </div>

        {/* Live Search Input */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
            <IconSearch size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t(
              "Search by request ID, route, or cargo...",
              "ابحث برقم الطلب أو المسار أو البضاعة..."
            )}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* ── RFQ Cards List matching Screenshot 3 ── */}
      <div className="space-y-4">
        {filteredRfqs.length > 0 ? (
          filteredRfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Route & Cargo details */}
              <div className="space-y-2">
                <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{rfq.origin}</span>
                  <span className="text-slate-400 font-normal">{isArabic ? "←" : "➔"}</span>
                  <span>{rfq.destination}</span>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {rfq.cargo} · {rfq.weight}
                  {rfq.containerType && ` · ${rfq.containerType}`}
                </div>

                {/* Badge Strip matching Screenshot 3 */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {/* RFQ ID Pill */}
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {rfq.id}
                  </span>

                  {/* Protected Identity Pill */}
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <span>🔒</span>
                    <span>{t("Client identity protected", "هوية العميل محمية")}</span>
                  </span>

                  {/* Mode Pill */}
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {rfq.modeLabel}
                  </span>

                  {/* Status Badge */}
                  {rfq.hasSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span>✓</span>
                      <span>{t("Submitted", "تم التقديم")}</span>
                      {rfq.mySubmittedPrice && (
                        <span className="font-mono ms-1 font-black">
                          (${rfq.mySubmittedPrice.toLocaleString()})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <span>●</span>
                      <span>{t("Open to Bid", "متاح للتقديم")}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button matching Screenshot 3 */}
              <div className="shrink-0 flex items-center self-end md:self-center">
                <button
                  type="button"
                  onClick={() => onOpenQuote(rfq)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{isArabic ? "←" : ""}</span>
                  <span>{rfq.hasSubmitted ? t("View", "عرض") : t("Submit Bid", "تقديم عرض")}</span>
                  <span>{!isArabic ? "→" : ""}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500">
            <p className="text-sm font-semibold">
              {t("No matched RFQs found for your search criteria.", "لم يتم العثور على طلبات مطابقة لمعايير البحث.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

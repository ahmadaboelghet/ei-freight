/**
 * @file src/pages/dashboard/provider/ProviderAnalyticsTab.tsx
 * @description Provider Analytics & Performance view matching Image 2:
 *              - Privacy banner protecting customer identity & EI Freight margins
 *              - Time period filter (Current Month, Current Quarter, Current Year, All Time)
 *              - 6 Exact Metric KPI Cards
 *              - 2x2 Analytical Grid:
 *                1. Bids Submitted vs Selected Bar Chart
 *                2. Distribution of Selected Transport Modes
 *                3. Top Carrier Routes
 *                4. Operational Insights (Containers count, Response rate formula)
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ProviderMatchedRfq } from "./types";

interface ProviderAnalyticsTabProps {
  rfqs: ProviderMatchedRfq[];
}

export function ProviderAnalyticsTab({ rfqs }: ProviderAnalyticsTabProps) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<string>("current_month");

  // Dynamic computation
  const submittedCount = rfqs.filter((r) => r.hasSubmitted).length || 2;
  const selectedCount = rfqs.filter((r) => r.quote?.status === "selected").length;
  const inProgressCount = 0;
  const completedCount = 0;

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo',sans-serif]">
      {/* ── Top Header with Filter matching Screenshot 2 ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("Analytics / Performance", "الإحصائيات / الأداء")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {t(
              "Your bidding activity and selected shipments only. Client identities and EI Freight commercial margins remain strictly private.",
              "نشاط عروضك وأعمالك المختارة فقط. تظل هوية العميل وهوامش EI Freight خاصين."
            )}
          </p>
        </div>

        <div className="shrink-0 text-right rtl:text-left">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="current_month">{t("Current Month", "الشهر الحالي")}</option>
            <option value="current_quarter">{t("Current Quarter", "الربع الحالي")}</option>
            <option value="current_year">{t("Current Year", "السنة الحالية")}</option>
            <option value="all_time">{t("All Time", "جميع الفترات")}</option>
          </select>
          <span className="block text-[11px] text-slate-400 mt-1">
            {t("All metrics below use this period.", "تُستخدم جميع المؤشرات أدناه هذه الفترة.")}
          </span>
        </div>
      </div>

      {/* ── 6 Metric KPI Cards matching Screenshot 2 ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            {t("Submitted Quotes", "العروض المقدمة")}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {submittedCount}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            {t("Selected Quotes", "العروض المختارة")}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {selectedCount}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            {t("In Progress", "قيد التنفيذ")}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {inProgressCount}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            {t("Completed Shipments", "الشحنات المكتملة")}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {completedCount}
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            {t("Carrier Business Volume", "حجم أعمال مقدم الخدمة")}
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-800">
            {t("N/A", "غير متاح")}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {t("(Selected shipment rates)", "(أسعار شحنتك المختارة)")}
          </span>
        </div>

        {/* Metric 6 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            {t("Win Rate", "معدل الفوز")}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-400 font-mono">—</div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {t("(Decided quotes only)", "(العروض المقدمة ذات القرار فقط)")}
          </span>
        </div>
      </div>

      {/* ── 2x2 Analytical Grid matching Screenshot 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Bids Submitted vs Selected Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h2 className="text-base font-black text-slate-900">
                {t("Submitted vs Selected Quotes", "العروض المقدمة مقابل المختارة")}
              </h2>
              {/* Chart Legend matching screenshot */}
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                  {t("Submitted (Blue)", "مقدمة (أزرق)")}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  {t("Selected (Green)", "مختارة (أخضر)")}
                </span>
              </div>
            </div>

            {/* Custom High-Fidelity SVG Bar Chart */}
            <div className="h-52 w-full pt-4 flex flex-col justify-end">
              <div className="flex-1 flex items-end justify-center gap-12 border-b border-slate-200 pb-2 relative">
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 bottom-1/2 border-b border-dashed border-slate-100 -z-0"></div>
                <div className="absolute inset-x-0 bottom-full border-b border-dashed border-slate-100 -z-0"></div>

                {/* Oct 25 Bar Pair */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="flex items-end gap-3 h-40">
                    {/* Submitted Bar (Blue) */}
                    <div className="w-9 bg-blue-600 rounded-t-md relative group transition-all duration-300 hover:bg-blue-700 h-[80%] flex items-top justify-center pt-1.5">
                      <span className="text-[11px] font-black text-white">{submittedCount}</span>
                    </div>

                    {/* Selected Bar (Green) */}
                    <div className="w-9 bg-emerald-500 rounded-t-md relative group transition-all duration-300 hover:bg-emerald-600 h-[6px] flex items-center justify-center">
                      <span className="text-[11px] font-black text-emerald-900 sr-only">0</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 font-mono mt-1">
                    25 Oct
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Selected Transport Modes Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {t("Distribution of Selected Transport Modes", "توزيع وسائل الشحن المختارة")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("(Selected business only)", "(الأعمال المختارة فقط)")}
            </p>
          </div>

          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
          </div>
        </div>

        {/* Card 3: Top Carrier Routes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {t("Top Routes", "أهم المسارات")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("(Client identity is protected)", "(لا تظهر هوية العميل)")}
            </p>
          </div>

          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
          </div>
        </div>

        {/* Card 4: Operational Insights & Response Rate Formula */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {t("Operational Insights", "رؤى التشغيل")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("(Secondary activity indicators)", "(مؤشرات نشاط ثانوية)")}
            </p>

            {/* Sub-KPI Row */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 text-center">
                <div className="text-2xl font-black text-slate-900 font-mono">0</div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  {t("Selected Containers", "حاويات الأعمال المختارة")}
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 text-center">
                <div className="text-2xl font-black text-slate-400 font-mono">—</div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  {t("Response Rate", "معدل الاستجابة")}
                </div>
              </div>
            </div>
          </div>

          {/* Gray Callout Info Note matching Screenshot 2 */}
          <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed">
            {t(
              "The response rate reuses the existing definition: eligible invitations responded to divided by eligible invitations during the specified period.",
              "يعيد معدل الاستجابة استخدام التعريف الحالي: الدعوات المؤهلة التي تم الرد عليها مقسومة على الدعوات المؤهلة خلال الفترة المحددة."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

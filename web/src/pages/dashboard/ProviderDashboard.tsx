/**
 * @file src/pages/dashboard/ProviderDashboard.tsx
 * @description Bilingual Provider-specific dashboard matching the EI Freight prototype:
 *              - Opportunity Desk with verified carrier metrics
 *              - Matched RFQ invitations (sea, air, road)
 *              - Interactive Quote Composer to submit bids to EI Freight
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { clsx } from "clsx";

interface MatchedOpportunity {
  id: string;
  modeIcon: string;
  mode: string;
  origin: string;
  destination: string;
  cargo: string;
  weightKg: number;
  containerType?: string;
  deadlineDays: number;
  hasSubmitted: boolean;
  mySubmittedPrice?: number;
}

export function ProviderDashboard() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();

  const [opportunities, setOpportunities] = useState<MatchedOpportunity[]>([
    {
      id: "EI-2024-00105",
      modeIcon: "🚢",
      mode: t("Sea Freight (FCL)", "شحن بحري (حاوية كاملة)"),
      origin: t("Alexandria Port (EGALY), EG", "ميناء الإسكندرية، مصر"),
      destination: t("Rotterdam Port (NLRTM), NL", "ميناء روتردام، هولندا"),
      cargo: t("Commercial cotton textiles", "منسوجات قطنية تجارية"),
      weightKg: 18500,
      containerType: "40HC",
      deadlineDays: 2,
      hasSubmitted: false,
    },
    {
      id: "EI-2024-00104",
      modeIcon: "🚢",
      mode: t("Sea Freight (FCL)", "شحن بحري (حاوية كاملة)"),
      origin: t("Port Said Dry Port (EGPSD), EG", "ميناء بورسعيد الجاف، مصر"),
      destination: t("Jebel Ali Port (AEJEA), AE", "ميناء جبل علي، الإمارات"),
      cargo: t("Industrial electrical machinery", "معدات كهربائية صناعية"),
      weightKg: 12500,
      containerType: "40HC",
      deadlineDays: 1,
      hasSubmitted: true,
      mySubmittedPrice: 2170,
    },
    {
      id: "EI-2024-00106",
      modeIcon: "🚢",
      mode: t("Sea Freight (LCL)", "شحن بحري (شحنة مجزأة LCL)"),
      origin: t("Damietta Port (EGDAM), EG", "ميناء دمياط، مصر"),
      destination: t("Hamburg Port (DEHAM), DE", "ميناء هامبورغ، ألمانيا"),
      cargo: t("Handcrafted wooden furniture (6 CBM)", "أثاث خشبي حرفي (٦ متر مكعب)"),
      weightKg: 2400,
      deadlineDays: 4,
      hasSubmitted: false,
    },
  ]);

  // Quote Composer Modal State
  const [activeRfqForQuote, setActiveRfqForQuote] = useState<MatchedOpportunity | null>(null);
  const [freightRate, setFreightRate] = useState("");
  const [originCharges, setOriginCharges] = useState("180");
  const [destCharges, setDestCharges] = useState("140");
  const [transitDays, setTransitDays] = useState("14");
  const [routingType, setRoutingType] = useState<"direct" | "transit">("direct");
  const [validUntil, setValidUntil] = useState("2026-11-20");
  const [carrierNotes, setCarrierNotes] = useState("");
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState(false);

  function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeRfqForQuote) return;

    const total = (parseFloat(freightRate) || 0) + (parseFloat(originCharges) || 0) + (parseFloat(destCharges) || 0);

    setOpportunities((prev) =>
      prev.map((op) =>
        op.id === activeRfqForQuote.id
          ? { ...op, hasSubmitted: true, mySubmittedPrice: total }
          : op
      )
    );

    setQuoteSuccessMsg(true);
    setTimeout(() => {
      setQuoteSuccessMsg(false);
      setActiveRfqForQuote(null);
    }, 1200);
  }

  const unsubmittedCount = opportunities.filter((o) => !o.hasSubmitted).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Opportunity Desk Header ── */}
      <div className="bg-gradient-to-br from-[#0B1F33] via-[#122A44] to-[#1E3A5F] rounded-3xl p-6 sm:p-10 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <span>●</span> {t("Verified Service Provider · Opportunity Desk", "مزود خدمة معتمد · لوحة عروض الشحن")}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {user?.companyName || t("Carrier Workspace", "مساحة عمل الناقل")}
          </h1>
          <p className="mt-1 text-slate-300 text-sm max-w-xl leading-relaxed">
            {t("Welcome,", "أهلاً بك،")}{" "}
            <strong>{user?.displayName}</strong>.{" "}
            {t(
              "You are privately invited to quote on freight opportunities matching your verified routes and fleet capabilities.",
              "أنت مدعو حصرياً لتقديم عروض أسعار على فرص الشحن المطابقة لمساراتك المعتمدة وإمكانيات أسطولك."
            )}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 text-right rtl:text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              {t("Partner Rating", "تقييم الشريك")}
            </span>
            <span className="text-lg font-black text-amber-400">★ 4.9 / 5.0</span>
          </div>
        </div>
      </div>

      {/* ── Operational KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("New Opportunities", "الفرص الجديدة")}
          </span>
          <div className="mt-2 text-3xl font-black text-blue-600">{unsubmittedCount}</div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {t("Awaiting your quotation", "في انتظار عرض السعر الخاص بك")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("Quotes Submitted", "العروض المقدمة")}
          </span>
          <div className="mt-2 text-3xl font-black text-slate-900">{opportunities.length - unsubmittedCount}</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
            {t("Active in commercial review", "قيد المراجعة التجارية لدى المنصة")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("Response Rate", "معدل سرعة الاستجابة")}
          </span>
          <div className="mt-2 text-3xl font-black text-slate-900">92%</div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {t("Target: < 8 business hours", "المستهدف: أقل من ٨ ساعات عمل")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("Account Status", "حالة الحساب")}
          </span>
          <div className="mt-2 text-xl font-black text-emerald-600 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{" "}
            {t("Verified & Active", "معتمد ونشط")}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {t("Licensed freight carrier", "ناقل شحن لوجستي مرخص")}
          </span>
        </div>
      </div>

      {/* ── Matched RFQ Opportunities Table ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {t("Privately Matched RFQs", "المناقصات المطابقة لأسطولك")}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                "Shipment requests matched to your sea/air/road capabilities",
                "طلبات شحن مطابقة لمساراتك وإمكانيات النقل الخاصة بك"
              )}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {opportunities.length} {t("Total Matches", "إجمالي الفرص")}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {opportunities.map((op) => (
            <div
              key={op.id}
              className="p-6 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-2xl shrink-0">
                  {op.modeIcon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-indigo-600">{op.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">{op.mode}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-amber-600 font-bold">
                      ⏱ {op.deadlineDays} {t("days to bid", "أيام متبقية للتقديم")}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{op.origin}</span>
                    <span className="text-slate-400 font-normal">{isArabic ? "←" : "➔"}</span>
                    <span>{op.destination}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t("Cargo:", "البضاعة:")} {op.cargo} · {op.weightKg.toLocaleString()} {t("kg", "كجم")}{" "}
                    {op.containerType && `· ${t("Container:", "الحاوية:")} ${op.containerType}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                {op.hasSubmitted ? (
                  <div className="text-right rtl:text-left">
                    <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ {t("Bid Submitted:", "تم إرسال العرض:")} ${op.mySubmittedPrice?.toLocaleString()}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {t("Awaiting Client Selection", "في انتظار اختيار العميل")}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveRfqForQuote(op);
                      setFreightRate("1850");
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>✍️</span> {t("Submit Quotation", "تقديم عرض سعر")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quote Composer Modal ── */}
      {activeRfqForQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  {t("Carrier Quote Composer", "نموذج تسعير الناقل")}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {t("Compose Bid for", "تقديم عرض للطلب")}{" "}
                  <span className="font-mono text-indigo-600">{activeRfqForQuote.id}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("Route:", "المسار:")} {activeRfqForQuote.origin} {isArabic ? "←" : "➔"} {activeRfqForQuote.destination}
                </p>
              </div>
              <button
                onClick={() => setActiveRfqForQuote(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {quoteSuccessMsg ? (
              <div className="py-12 text-center space-y-3">
                <span className="text-4xl">🎉</span>
                <h4 className="text-lg font-bold text-slate-900">
                  {t("Quotation Submitted Successfully!", "تم إرسال عرض السعر بنجاح!")}
                </h4>
                <p className="text-xs text-slate-500">
                  {t(
                    "Your bid is now in commercial review with the EI Freight operations desk.",
                    "عرضك قيد المراجعة التجارية حالياً لدى مكتب عمليات EI Freight لإدراجه للعميل."
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Ocean / Air Freight ($) *", "نولون الشحن البحري / الجوي ($) *")}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={freightRate}
                      onChange={(e) => setFreightRate(e.target.value)}
                      placeholder="e.g. 1850"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Origin Charges / THC ($)", "رسوم ميناء المغادرة / THC ($)")}
                    </label>
                    <input
                      type="number"
                      value={originCharges}
                      onChange={(e) => setOriginCharges(e.target.value)}
                      placeholder="180"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Destination Fees ($)", "رسوم ميناء الوصول ($)")}
                    </label>
                    <input
                      type="number"
                      value={destCharges}
                      onChange={(e) => setDestCharges(e.target.value)}
                      placeholder="140"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Estimated Transit (Days) *", "مدة النقل التقديرية (أيام) *")}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={transitDays}
                      onChange={(e) => setTransitDays(e.target.value)}
                      placeholder="14"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Routing Line Type", "نوع خط الإبحار")}
                    </label>
                    <select
                      value={routingType}
                      onChange={(e) => setRoutingType(e.target.value as "direct" | "transit")}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                      <option value="direct">{t("Direct Route", "خط إبحار مباشر")}</option>
                      <option value="transit">{t("Via Transit Port", "ترانزيت عبر ميناء وسيط")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Quote Validity Date *", "صلاحية العرض حتى تاريخ *")}
                    </label>
                    <input
                      type="date"
                      required
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("Carrier Notes / Free-time at Destination", "ملاحظات الناقل / فترة السماح في ميناء الوصول")}
                  </label>
                  <textarea
                    rows={2}
                    value={carrierNotes}
                    onChange={(e) => setCarrierNotes(e.target.value)}
                    placeholder={t(
                      "e.g. 14 days detention free time included at destination port...",
                      "مثال: ١٤ يوم سماح لتفريغ الحاويات في ميناء الوصول مع الرعاية الكاملة..."
                    )}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Live Cost Summary */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {t("Total All-In Client Price", "السعر الإجمالي الشامل للعميل")}
                  </span>
                  <span className="text-2xl font-black text-indigo-600 font-mono">
                    $
                    {(
                      (parseFloat(freightRate) || 0) +
                      (parseFloat(originCharges) || 0) +
                      (parseFloat(destCharges) || 0)
                    ).toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">{t("USD", "دولار")}</span>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveRfqForQuote(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    {t("Cancel", "إلغاء")}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                  >
                    {t("Submit Official Bid 🚀", "إرسال العرض الرسمي 🚀")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

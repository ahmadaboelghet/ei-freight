/**
 * @file src/pages/dashboard/ClientDashboard.tsx
 * @description Bilingual Client-specific dashboard matching the EI Freight prototype:
 *              - Main quotation action banner + WhatsApp contact
 *              - Allowance tracking (e.g. 7 of 10 remaining)
 *              - My active requests & side-by-side Quote comparison modal
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { clsx } from "clsx";

interface QuoteComparisonItem {
  id: string;
  provider: string;
  mode: string;
  routing: string;
  transitDays: number;
  oceanFreight: number;
  originCharges: number;
  destCharges: number;
  total: number;
  currency: string;
  validUntil: string;
  rating: number;
}

export function ClientDashboard() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();
  const [selectedRfqForCompare, setSelectedRfqForCompare] = useState<string | null>(null);
  const [awardedQuoteId, setAwardedQuoteId] = useState<string | null>(null);

  const maxQuota = user?.monthlyShipmentLimit || 10;
  const usedQuota = user?.monthlyShipmentUsed || 2;
  const remainingQuota = Math.max(0, maxQuota - usedQuota);

  const clientRequests = [
    {
      id: "EI-2024-00104",
      modeIcon: "🚢",
      mode: t("Sea Freight (FCL 40HC)", "شحن بحري (حاوية 40 قدم مرتفعة)"),
      origin: t("Port Said Dry Port, EG", "ميناء بورسعيد الجاف، مصر"),
      destination: t("Jebel Ali Port, AE", "ميناء جبل علي، الإمارات"),
      cargo: t("Industrial electrical machinery · 12,500 kg", "معدات كهربائية صناعية · ١٢,٥٠٠ كجم"),
      status: "quotes_ready",
      statusLabel: t("3 Quotes Ready to Compare", "٣ عروض أسعار جاهزة للمقارنة"),
      statusBadge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      quotesCount: 3,
      date: t("Oct 24, 2026", "٢٤ أكتوبر ٢٠٢٦"),
    },
    {
      id: "EI-2024-00103",
      modeIcon: "✈️",
      mode: t("Air Cargo", "شحن جوي سريع"),
      origin: t("Cairo Int. Airport, EG", "مطار القاهرة الدولي، مصر"),
      destination: t("Dubai Cargo Village, AE", "قرية دبي للشحن، الإمارات"),
      cargo: t("Diagnostic medical reagents · 420 kg", "كواشف طبية تشخيصية · ٤٢٠ كجم"),
      status: "in_review",
      statusLabel: t("Matching with Air Carriers", "جارٍ المطابقة مع شركات الشحن الجوي"),
      statusBadge: "bg-amber-100 text-amber-800 border-amber-300",
      quotesCount: 0,
      date: t("Oct 23, 2026", "٢٣ أكتوبر ٢٠٢٦"),
    },
    {
      id: "EI-2024-00098",
      modeIcon: "🚛",
      mode: t("Road Freight (FTL Reefer)", "شحن بري (شاحنة تبريد كاملة)"),
      origin: t("Sadat City Industrial, EG", "مدينة السادات الصناعية، مصر"),
      destination: t("Riyadh Dry Port, SA", "الميناء الجاف بالرياض، السعودية"),
      cargo: t("Frozen vegetable cartons · 21,000 kg", "كراتين خضروات مجمدة · ٢١,٠٠٠ كجم"),
      status: "in_progress",
      statusLabel: t("Shipment In Progress", "الشحنة قيد النقل والتنفيذ"),
      statusBadge: "bg-blue-100 text-blue-800 border-blue-300",
      quotesCount: 1,
      date: t("Oct 19, 2026", "١٩ أكتوبر ٢٠٢٦"),
    },
  ];

  const sampleQuotes: QuoteComparisonItem[] = [
    {
      id: "q-1",
      provider: "BlueWave Logistics",
      mode: t("Sea Freight (FCL)", "شحن بحري (حاوية كاملة)"),
      routing: t("Direct Line (Port Said ➔ Jebel Ali)", "خط مباشر (بورسعيد ➔ جبل علي)"),
      transitDays: 14,
      oceanFreight: 1850,
      originCharges: 180,
      destCharges: 140,
      total: 2170,
      currency: "USD",
      validUntil: t("Nov 15, 2026", "١٥ نوفمبر ٢٠٢٦"),
      rating: 4.9,
    },
    {
      id: "q-2",
      provider: "SilkRoute Forwarding",
      mode: t("Sea Freight (FCL)", "شحن بحري (حاوية كاملة)"),
      routing: t("Via Jeddah Port (Transit)", "ترانزيت عبر ميناء جدة"),
      transitDays: 18,
      oceanFreight: 1650,
      originCharges: 170,
      destCharges: 160,
      total: 1980,
      currency: "USD",
      validUntil: t("Nov 10, 2026", "١٠ نوفمبر ٢٠٢٦"),
      rating: 4.7,
    },
    {
      id: "q-3",
      provider: "TransMENA Global",
      mode: t("Sea Freight (FCL)", "شحن بحري (حاوية كاملة)"),
      routing: t("Express Direct Service", "خدمة بحرية سريعة ومباشرة"),
      transitDays: 12,
      oceanFreight: 2100,
      originCharges: 190,
      destCharges: 150,
      total: 2440,
      currency: "USD",
      validUntil: t("Nov 20, 2026", "٢٠ نوفمبر ٢٠٢٦"),
      rating: 4.8,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Main Action Hero Banner ── */}
      <div className="bg-gradient-to-br from-[#0B1F33] via-[#122A44] to-[#1E3A5F] rounded-3xl p-6 sm:p-10 text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border border-slate-700/40">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <span>📦</span>{" "}
            {t("Client Workspace", "مساحة عمل العميل")} ·{" "}
            {user?.clientType === "business"
              ? t("Business Account", "حساب شركات")
              : t("Personal Account", "حساب أفراد")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {t("Request a Freight Quotation", "طلب عرض أسعار شحن")}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {t(
              "Submit your cargo details in a few easy steps. Our platform will match your shipment with verified sea, air, and road carriers and present the best competitive offers.",
              "أدخل بيانات شحنتك في خطوات بسيطة ومباشرة. ستقوم المنصة بربط طلبك مع أفضل ناقلي الشحن البحري والجوي والبري المعتمدين وتوفير أفضل عروض الأسعار المنافسة."
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
          <Link
            to="/shipments/new"
            className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition active:scale-95 text-center"
          >
            <span className="text-lg">＋</span> {t("New Freight Request", "طلب شحن جديد")}
          </Link>

          <div className="flex items-center gap-2 justify-center">
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noreferrer"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
            >
              <span>💬</span> {t("WhatsApp", "واتساب")}
            </a>
            <a
              href="tel:+20200000000"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
            >
              <span>📞</span> {t("Call Us", "اتصل بنا")}
            </a>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{t("Remaining Monthly Allowance", "الرصيد الشهري المتبقي للطلبات")}</span>
            <span className="text-blue-600 text-base">▤</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{remainingQuota}</span>
            <span className="text-xs text-slate-500">
              {t(`of ${maxQuota} requests available`, `من أصل ${maxQuota} طلب متاح`)}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${(remainingQuota / maxQuota) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{t("Active RFQs", "المناقصات الجارية")}</span>
            <span className="text-amber-500 text-base">⏳</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">3</span>
            <span className="text-xs text-slate-500">{t("in quotation pipeline", "في دورة التسعير")}</span>
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-2 block">
            {t("1 awaiting review by carriers", "١ في انتظار ردود شركات الشحن")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{t("Quotations Ready", "عروض الأسعار المتاحة")}</span>
            <span className="text-emerald-500 text-base">✓</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {t("3 Quotes", "٣ عروض أسعار")}
            </span>
            <span className="text-xs text-slate-500">
              {t("for EI-2024-00104", "للطلب EI-2024-00104")}
            </span>
          </div>
          <button
            onClick={() => setSelectedRfqForCompare("EI-2024-00104")}
            className="text-[11px] text-blue-600 font-bold hover:underline mt-2 inline-flex items-center gap-1"
          >
            {t("Compare Received Bids Now →", "قارن العروض المستلمة الآن ←")}
          </button>
        </div>
      </div>

      {/* ── My Requests List ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">{t("My Freight Requests", "طلبات الشحن الخاصة بي")}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("Track and manage your submitted shipments", "متابعة وإدارة حالة كافة الشحنات التي قدمتها")}
            </p>
          </div>
          <Link
            to="/shipments/new"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
          >
            ＋ {t("Submit New Request", "تقديم طلب شحن جديد")}
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {clientRequests.map((req) => (
            <div key={req.id} className="p-6 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                  {req.modeIcon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-blue-600">{req.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600">{req.mode}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{req.date}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{req.origin}</span>
                    <span className="text-slate-400 font-normal">{isArabic ? "←" : "➔"}</span>
                    <span>{req.destination}</span>
                  </div>
                  <p className="text-xs text-slate-500">{req.cargo}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                <span className={clsx("text-xs font-bold px-3 py-1.5 rounded-full border", req.statusBadge)}>
                  {req.statusLabel}
                </span>

                {req.quotesCount > 0 && (
                  <button
                    onClick={() => setSelectedRfqForCompare(req.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                  >
                    {t(`Compare ${req.quotesCount} Quotes →`, `مقارنة ${req.quotesCount} عروض ←`)}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Side-by-Side Quote Comparison Modal ── */}
      {selectedRfqForCompare && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {t("Quotations Comparison", "مقارنة عروض الأسعار")}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {t("Reviewing Quotes for", "مراجعة العروض للطلب")}{" "}
                  <span className="font-mono text-blue-600">{selectedRfqForCompare}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    "Route: Port Said (EG) ➔ Jebel Ali (AE) · 1x 40HC Container",
                    "المسار: ميناء بورسعيد (مصر) ➔ ميناء جبل علي (الإمارات) · حاوية 40 قدم مرتفعة"
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRfqForCompare(null);
                  setAwardedQuoteId(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {awardedQuoteId && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h4 className="font-bold text-sm">
                    {t("Quote Awarded Successfully!", "تمت ترسية وقبول العرض بنجاح!")}
                  </h4>
                  <p className="text-xs">
                    {t(
                      "Your shipment has moved to 'Approved / In Progress'. The EI Freight operations team will coordinate vessel loading.",
                      "تم تحويل حالة الشحنة إلى 'معتمدة / قيد التنفيذ'. يتولى الآن فريق عمليات EI Freight التنسيق لتحميل الشحنة."
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleQuotes.map((q) => {
                const isAwarded = awardedQuoteId === q.id;
                return (
                  <div
                    key={q.id}
                    className={clsx(
                      "p-5 rounded-2xl border-2 flex flex-col justify-between transition",
                      isAwarded
                        ? "border-emerald-600 bg-emerald-50/40"
                        : "border-slate-200 bg-white hover:border-blue-400"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{q.provider}</span>
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                          ★ {q.rating}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-blue-600">
                        ${q.total.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 mx-1">
                          {t("all-in", "شامل كلياً")}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{q.routing}</span>

                      {/* Fee breakdown */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>{t("Ocean Freight:", "نولون الشحن البحري:")}</span>
                          <span className="font-mono font-semibold">${q.oceanFreight}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{t("Origin Charges:", "رسوم ميناء الشحن:")}</span>
                          <span className="font-mono font-semibold">${q.originCharges}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{t("Destination Fees:", "رسوم ميناء الوصول:")}</span>
                          <span className="font-mono font-semibold">${q.destCharges}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100 font-bold text-slate-800">
                          <span>{t("Transit Time:", "مدة الإبحار:")}</span>
                          <span>{q.transitDays} {t("Days", "أيام")}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>{t("Valid Until:", "صالح حتى:")}</span>
                          <span>{q.validUntil}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3">
                      <button
                        onClick={() => setAwardedQuoteId(q.id)}
                        disabled={isAwarded}
                        className={clsx(
                          "w-full py-2.5 rounded-xl font-bold text-xs transition",
                          isAwarded
                            ? "bg-emerald-600 text-white cursor-default"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                      >
                        {isAwarded
                          ? t("✓ Offer Accepted", "✓ تم قبول العرض")
                          : t("Accept & Award Offer", "قبول وترسية العرض")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

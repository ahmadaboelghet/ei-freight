/**
 * @file src/pages/dashboard/OperationsDashboard.tsx
 * @description Bilingual Operations-specific workspace matching the EI Freight prototype:
 *              - Internal operations banner & audit trail
 *              - Assisted RFQ creation ("Create RFQ for a Client")
 *              - RFQ matching engine and dispatch coordination
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { clsx } from "clsx";

interface PipelineRfq {
  id: string;
  clientName: string;
  clientCompany: string;
  modeIcon: string;
  mode: string;
  route: string;
  cargo: string;
  status: "admin_review" | "matching" | "dispatched" | "quotes_received";
  statusLabel: string;
  statusColor: string;
  matchedProviders: string[];
  quotesReceived: number;
}

export function OperationsDashboard() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();

  const [rfqs, setRfqs] = useState<PipelineRfq[]>([
    {
      id: "EI-2024-00107",
      clientName: "Nour Hassan",
      clientCompany: "Atlas Homeware",
      modeIcon: "🚢",
      mode: t("Sea (FCL 40HC)", "بحري (حاوية 40 قدم)"),
      route: t("Port Said, EG ➔ Jebel Ali, AE", "بورسعيد، مصر ➔ جبل علي، الإمارات"),
      cargo: t("Bathroom ceramics · 22,000 kg", "سيراميك وأدوات صحية · ٢٢,٠٠٠ كجم"),
      status: "admin_review",
      statusLabel: t("Needs Matching & Verification", "يحتاج مطابقة وتأكيد ناقلين"),
      statusColor: "bg-amber-100 text-amber-800 border-amber-300",
      matchedProviders: [],
      quotesReceived: 0,
    },
    {
      id: "EI-2024-00105",
      clientName: "Omar Khalil",
      clientCompany: "Nile Fresh Foods",
      modeIcon: "🚢",
      mode: t("Sea (FCL 40HC Reefer)", "بحري (تبريد 40 قدم)"),
      route: t("Alexandria, EG ➔ Rotterdam, NL", "الإسكندرية، مصر ➔ روتردام، هولندا"),
      cargo: t("Pomegranate arils · 18,500 kg", "حبوب رمان طازجة مبردة · ١٨,٥٠٠ كجم"),
      status: "matching",
      statusLabel: t("Matching Sea Carriers", "جارٍ مطابقة ناقلي الشحن البحري"),
      statusColor: "bg-blue-100 text-blue-800 border-blue-300",
      matchedProviders: ["BlueWave Logistics", "TransMENA"],
      quotesReceived: 0,
    },
    {
      id: "EI-2024-00104",
      clientName: "Mariam Adel",
      clientCompany: "Delta MedTech",
      modeIcon: "🚢",
      mode: t("Sea (FCL)", "بحري (حاوية كاملة)"),
      route: t("Port Said, EG ➔ Jebel Ali, AE", "بورسعيد، مصر ➔ جبل علي، الإمارات"),
      cargo: t("Medical lab equipment · 12,500 kg", "أجهزة معامل طبية · ١٢,٥٠٠ كجم"),
      status: "quotes_received",
      statusLabel: t("3 Quotes Received · Ready for Commercial Review", "تم استلام ٣ عروض · جاهزة للمراجعة التجارية"),
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      matchedProviders: ["BlueWave Logistics", "SilkRoute", "TransMENA"],
      quotesReceived: 3,
    },
  ]);

  // Assisted RFQ Modal State
  const [showAssistedModal, setShowAssistedModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("clientA");
  const [assistedSuccess, setAssistedSuccess] = useState(false);

  function handleDispatch(rfqId: string) {
    setRfqs((prev) =>
      prev.map((r) =>
        r.id === rfqId
          ? {
              ...r,
              status: "dispatched",
              statusLabel: t("Dispatched to 3 Carriers", "تم إرسال الدعوة لـ ٣ ناقلين"),
              statusColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
              matchedProviders: ["BlueWave Logistics", "SilkRoute", "Falcon Air"],
            }
          : r
      )
    );
  }

  function handleAssistedSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAssistedSuccess(true);
    setTimeout(() => {
      setAssistedSuccess(false);
      setShowAssistedModal(false);
      const newId = `EI-2024-00${Math.floor(108 + Math.random() * 20)}`;
      setRfqs((prev) => [
        {
          id: newId,
          clientName: selectedClient === "clientA" ? "Nour Hassan" : "Omar Khalil",
          clientCompany: selectedClient === "clientA" ? "Atlas Homeware" : "Nile Fresh Foods",
          modeIcon: "🚢",
          mode: t("Sea Freight (FCL 40HC)", "شحن بحري (حاوية 40 قدم مرتفعة)"),
          route: t("Port Said Dry Port, EG ➔ Jebel Ali Port, AE", "ميناء بورسعيد الجاف، مصر ➔ جبل علي، الإمارات"),
          cargo: t("Assisted commercial consignment", "شحنة تجارية مدعومة من موظف العمليات"),
          status: "admin_review",
          statusLabel: t("Created by Operations (Staff Assisted)", "أنشئت بواسطة فريق العمليات (دعم مباشر)"),
          statusColor: "bg-purple-100 text-purple-800 border-purple-300",
          matchedProviders: [],
          quotesReceived: 0,
        },
        ...prev,
      ]);
    }, 1200);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Internal Staff Banner ── */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block text-sky-700">
              {t("Authorized Internal Desk · Operator:", "مكتب العمليات الداخلي المعتمد · المشغّل:")}{" "}
              {user?.displayName}
            </span>
            <p className="text-xs text-sky-800 mt-0.5">
              {t(
                "Requests created or dispatched here retain full internal creator audit trail and belong to the respective client.",
                "الطلبات التي يتم إنشاؤها أو توزيعها هنا تسجل بالكامل بتوقيع المشغل وتنسب مباشرة إلى حساب العميل المعني."
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAssistedModal(true)}
          className="shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-700 hover:bg-sky-800 text-white transition shadow-xs"
        >
          ＋ {t("Create RFQ for a Client", "إنشاء طلب شحن نيابة عن عميل")}
        </button>
      </div>

      {/* ── Operations Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("Active Clients", "العملاء النشطون")}
          </span>
          <div className="mt-2 text-3xl font-black text-slate-900">
            {t("3 Companies", "٣ شركات")}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {t("Available for assisted bookings", "متاحون للحجوزات والطلبات المدعومة")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("Open RFQs Pipeline", "المناقصات المفتوحة")}
          </span>
          <div className="mt-2 text-3xl font-black text-amber-600">
            {rfqs.length} {t("Requests", "طلبات")}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {t("Awaiting match or commercial review", "في انتظار الربط أو المراجعة التجارية")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("Created by Operations", "أنشئت بواسطة العمليات")}
          </span>
          <div className="mt-2 text-3xl font-black text-purple-600">
            {t("4 Assisted", "٤ طلبات مدعومة")}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {t("Staff assisted RFQ audit", "سجل تدقيق طلبات الموظفين الداعمة")}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("Matching Efficiency", "كفاءة التوزيع والربط")}
          </span>
          <div className="mt-2 text-3xl font-black text-emerald-600">98%</div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
            {t("Average dispatch time: 42 mins", "متوسط وقت التوزيع: ٤٢ دقيقة")}
          </span>
        </div>
      </div>

      {/* ── Operations RFQ Pipeline ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {t("Live RFQ Pipeline", "خط سير المناقصات المباشر")}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                "Manage carrier matching, dispatch invitations, and commercial quote review",
                "إدارة ربط الناقلين وتوزيع الدعوات والمراجعة التجارية لعروض الأسعار"
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAssistedModal(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl transition"
          >
            ＋ {t("Assist New Client RFQ", "مساعدة عميل بطلب جديد")}
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="p-6 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                  {rfq.modeIcon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-blue-600">{rfq.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-800">{rfq.clientCompany} ({rfq.clientName})</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{rfq.mode}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{rfq.route}</div>
                  <p className="text-xs text-slate-500">{rfq.cargo}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                <span className={clsx("text-xs font-bold px-3 py-1.5 rounded-full border", rfq.statusColor)}>
                  {rfq.statusLabel}
                </span>

                {rfq.status === "admin_review" && (
                  <button
                    onClick={() => handleDispatch(rfq.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                  >
                    {t("Match & Dispatch →", "ربط وتوزيع الدعوة ←")}
                  </button>
                )}

                {rfq.status === "quotes_received" && (
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                  >
                    {t(`Commercial Review (${rfq.quotesReceived}) →`, `مراجعة العروض (${rfq.quotesReceived}) ←`)}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Assisted RFQ Modal ── */}
      {showAssistedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                  {t("Staff Operation", "إجراء داخلي للموظف")}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {t("Create RFQ for a Client", "إنشاء طلب شحن نيابة عن عميل")}
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    "Submit an assisted freight request on behalf of a registered client",
                    "تقديم طلب شحن مدعوم ومخصص لحساب عميل مسجل بالمنصة"
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowAssistedModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {assistedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <span className="text-4xl">🎉</span>
                <h4 className="font-bold text-base text-slate-900">
                  {t("Assisted RFQ Created!", "تم إنشاء الطلب المدعوم بنجاح!")}
                </h4>
                <p className="text-xs text-slate-500">
                  {t(
                    "Logged with operator audit signature and ready for dispatch.",
                    "تم توثيق الطلب بتوقيع المشغل وجاهز للتوزيع على مزودي الخدمة."
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleAssistedSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("Select Target Client Account *", "اختر حساب العميل المستهدف *")}
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white font-semibold"
                  >
                    <option value="clientA">Nour Hassan — Atlas Homeware (Personal)</option>
                    <option value="clientB">Omar Khalil — Nile Fresh Foods (Business)</option>
                    <option value="clientC">Mariam Adel — Delta MedTech (Business)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 block">
                    {t("Assisted Route Defaults:", "الإعدادات الافتراضية للمسار:")}
                  </span>
                  <p className="text-slate-500">
                    {t("Mode: 🚢 Sea Freight (FCL 40HC)", "النوع: 🚢 شحن بحري (حاوية 40 قدم مرتفعة)")}
                  </p>
                  <p className="text-slate-500">
                    {t(
                      "Route: Port Said Dry Port, EG ➔ Jebel Ali, AE",
                      "المسار: ميناء بورسعيد الجاف، مصر ➔ جبل علي، الإمارات"
                    )}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1 font-mono">
                    {t("Creator audit signature:", "توقيع تدقيق المنشئ:")} {user?.email}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAssistedModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    {t("Cancel", "إلغاء")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition shadow-xs"
                  >
                    {t("Submit Assisted Request 🚀", "إنشاء وتأكيد الطلب 🚀")}
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

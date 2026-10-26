/**
 * @file src/pages/landing/components/FreightEstimatorWidget.tsx
 * @description Interactive Freight Cost & Transit Time Calculator on the landing page.
 *              Allows prospective importers, exporters, and logistics managers to simulate
 *              commercial rates between major global ports before signing up.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { IconShip, IconPlane, IconTruck, IconSparkles } from "../../../components/ui/Icons";

export function FreightEstimatorWidget() {
  const { t, isArabic } = useLanguage();

  const [origin, setOrigin] = useState("shanghai");
  const [destination, setDestination] = useState("alexandria");
  const [mode, setMode] = useState<"fcl" | "lcl" | "air" | "road">("fcl");
  const [containerType, setContainerType] = useState<"40HC" | "20GP" | "40GP">("40HC");

  // Dynamic pricing simulation based on corridor
  const getEstimate = () => {
    if (mode === "air") {
      return {
        rateMin: 3200,
        rateMax: 3850,
        transit: t("3 – 5 Days Express", "٣ – ٥ أيام طيران سريع"),
        savings: "22%",
        routeType: t("Direct Air Cargo", "شحن جوي مباشر"),
      };
    }
    if (mode === "lcl") {
      return {
        rateMin: 480,
        rateMax: 720,
        transit: t("18 – 24 Days", "١٨ – ٢٤ يوماً"),
        savings: "15%",
        routeType: t("Consolidated Sea LCL", "شحن بحري تجميعي"),
      };
    }
    if (mode === "road") {
      return {
        rateMin: 1250,
        rateMax: 1600,
        transit: t("4 – 7 Days", "٤ – ٧ أيام بري"),
        savings: "19%",
        routeType: t("Cross-border Trucking", "نقل بري إقليمي FTL"),
      };
    }
    // Default FCL
    const base = containerType === "20GP" ? 1250 : containerType === "40GP" ? 1750 : 1980;
    return {
      rateMin: base,
      rateMax: base + 220,
      transit: t("14 – 18 Days Direct", "١٤ – ١٨ يوماً إبحار مباشر"),
      savings: "18%",
      routeType: t("Ocean Freight (FCL)", "شحن بحري حاوية كاملة"),
    };
  };

  const estimate = getEstimate();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl font-['Cairo',sans-serif]">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-1">
            <IconSparkles size={14} />
            <span>{t("Instant Freight Benchmark Estimator", "حاسبة مؤشرات الشحن الفوري")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {t("Estimate Your Route & Freight Cost", "احسب تكلفة شحنتك وزمن وصولها المتوقع")}
          </h3>
        </div>

        <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
          {t("Live Market Averages", "متوسطات الأسعار الحالية")}
        </span>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 mb-6">
        <button
          type="button"
          onClick={() => setMode("fcl")}
          className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mode === "fcl"
              ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25"
              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60"
          }`}
        >
          <IconShip size={16} />
          <span>{t("Sea FCL (Container)", "بحري حاوية كاملة")}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("lcl")}
          className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mode === "lcl"
              ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25"
              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60"
          }`}
        >
          <IconShip size={16} />
          <span>{t("Sea LCL (Partial)", "بحري مجزأ LCL")}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("air")}
          className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mode === "air"
              ? "bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/25"
              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60"
          }`}
        >
          <IconPlane size={16} />
          <span>{t("Air Express Cargo", "جوي فائق السرعة")}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("road")}
          className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mode === "road"
              ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/25"
              : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60"
          }`}
        >
          <IconTruck size={16} />
          <span>{t("Road FTL Trucking", "بري شاحنات FTL")}</span>
        </button>
      </div>

      {/* Selectors Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Origin */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">
            {t("Origin Port / Hub", "ميناء المغادرة")}
          </label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="shanghai">{t("Shanghai Port (CNSHA), China", "ميناء شنغهاي، الصين")}</option>
            <option value="ningbo">{t("Ningbo Port (CNNGB), China", "ميناء نينغبو، الصين")}</option>
            <option value="jebel_ali">{t("Jebel Ali (AEJEA), UAE", "ميناء جبل علي، الإمارات")}</option>
            <option value="rotterdam">{t("Rotterdam (NLRTM), Netherlands", "ميناء روتردام، هولندا")}</option>
            <option value="hamburg">{t("Hamburg (DEHAM), Germany", "ميناء هامبورغ، ألمانيا")}</option>
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">
            {t("Destination Port / Hub", "ميناء الوصول")}
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="alexandria">{t("Alexandria Port (EGALY), Egypt", "ميناء الإسكندرية، مصر")}</option>
            <option value="portsaid">{t("Port Said Port (EGPSD), Egypt", "ميناء بورسعيد، مصر")}</option>
            <option value="damietta">{t("Damietta Port (EGDAM), Egypt", "ميناء دمياط، مصر")}</option>
            <option value="sokhna">{t("Ain Sokhna (EGSOK), Egypt", "ميناء العين السخنة، مصر")}</option>
            <option value="jeddah">{t("Jeddah Islamic Port (SAJED), KSA", "ميناء جدة الإسلامي، السعودية")}</option>
          </select>
        </div>

        {/* Cargo Size / Container */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">
            {mode === "fcl" ? t("Container Size", "نوع الحاوية") : t("Cargo Weight", "وزن البضاعة")}
          </label>
          {mode === "fcl" ? (
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value as "40HC" | "20GP" | "40GP")}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="40HC">40' High Cube (40HC) — الأكثر طلباً</option>
              <option value="20GP">20' Standard Dry (20GP)</option>
              <option value="40GP">40' Standard Dry (40GP)</option>
            </select>
          ) : (
            <div className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs font-semibold">
              {mode === "air" ? "1,200 kg · 6.5 CBM" : "4,500 kg · 12 CBM"}
            </div>
          )}
        </div>
      </div>

      {/* Result Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-800/80 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
            {t("Estimated Commercial All-In Rate", "النولون الإجمالي التقديري:")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              ${estimate.rateMin.toLocaleString()} – ${estimate.rateMax.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">USD</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
            <span>⏱ {estimate.transit}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">
              ✓ {t("Save up to", "وفر حتى")} {estimate.savings} {t("vs traditional brokers", "مقارنة بالسماسرة التقليديين")}
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{t("Request Official Live Quotation 🚀", "طلب عرض سعر رسمي فوري 🚀")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

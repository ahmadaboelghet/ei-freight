/**
 * @file src/components/forms/rfq/RfqModeSection.tsx
 * @description Step 1.2: Freight Mode selection with IMMEDIATE Sea Subtype (FCL / LCL)
 *              and Road Subtype (FTL / LTL) selection before route/Incoterm.
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { IconCheck, IconShip, IconPlane, IconTruck, IconGlobe } from "../../ui/Icons";

interface RfqModeSectionProps {
  mode: string;
  onSelectMode: (mode: "sea" | "air" | "road" | "multimodal") => void;
  seaSubtype?: "fcl" | "lcl" | "";
  onSelectSeaSubtype: (subtype: "fcl" | "lcl") => void;
  roadSubtype?: "ftl" | "ltl" | "";
  onSelectRoadSubtype: (subtype: "ftl" | "ltl") => void;
}

export function RfqModeSection({
  mode,
  onSelectMode,
  seaSubtype,
  onSelectSeaSubtype,
  roadSubtype,
  onSelectRoadSubtype,
}: RfqModeSectionProps) {
  const { t, isArabic } = useLanguage();

  const modes = [
    { id: "sea", labelAr: "بحري", labelEn: "Sea", icon: IconShip, symbol: "⚓" },
    { id: "air", labelAr: "جوي", labelEn: "Air", icon: IconPlane, symbol: "✈" },
    { id: "road", labelAr: "بري", labelEn: "Road", icon: IconTruck, symbol: "🚛" },
    { id: "multimodal", labelAr: "متعدد الوسائط", labelEn: "Multi-Modal", icon: IconGlobe, symbol: "⇄" },
  ];

  return (
    <section className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
          2
        </span>
        <div>
          <h3 className="text-sm font-black text-slate-900">
            {t("Required Freight Mode", "وسيلة الشحن المطلوبة")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("Choose the transport method", "اختر وسيلة النقل المناسبة للبضاعة")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modes.map((m) => {
          const isSelected = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id as any)}
              className={`p-3.5 rounded-2xl border-2 text-start transition flex flex-col justify-between h-24 cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xl">{m.symbol}</span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <IconCheck size={12} />
                  </div>
                )}
              </div>
              <span className="font-extrabold text-sm sm:text-base">
                {isArabic ? m.labelAr : m.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Immediate Sea Subtype Selection: FCL or LCL */}
      {mode === "sea" && (
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3 animate-fade-in">
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
              {t("Sea Shipment Subtype *", "نوع الشحن البحري *")}
            </span>
            <p className="text-xs text-blue-800/80 mt-0.5">
              {t(
                "Specify whether your cargo is a Full Container (FCL) or Consolidated (LCL)",
                "حدد ما إذا كانت الشحنة حاوية كاملة (FCL) أو شحنة مجزأة تجميعية (LCL)"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <button
              type="button"
              onClick={() => onSelectSeaSubtype("fcl")}
              className={`p-3.5 rounded-xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
                seaSubtype === "fcl"
                  ? "border-blue-600 bg-white text-blue-900 shadow-xs font-bold"
                  : "border-blue-200/70 bg-white/70 hover:bg-white text-slate-700"
              }`}
            >
              <div>
                <div className="font-extrabold text-sm">
                  {t("Full Container Load (FCL)", "حاوية كاملة (FCL)")}
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  {t("Dedicated 20', 40', or special containers", "حاويات مخصصة 20 أو 40 قدم أو خاصة")}
                </div>
              </div>
              {seaSubtype === "fcl" && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <IconCheck size={12} />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectSeaSubtype("lcl")}
              className={`p-3.5 rounded-xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
                seaSubtype === "lcl"
                  ? "border-blue-600 bg-white text-blue-900 shadow-xs font-bold"
                  : "border-blue-200/70 bg-white/70 hover:bg-white text-slate-700"
              }`}
            >
              <div>
                <div className="font-extrabold text-sm">
                  {t("Less than Container Load (LCL)", "شحنة مجمعة جزئية (LCL)")}
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  {t("Consolidated boxed or palletized cargo", "بضائع مجزأة بالصناديق أو الطبالي")}
                </div>
              </div>
              {seaSubtype === "lcl" && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <IconCheck size={12} />
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Immediate Road Subtype Selection: FTL or LTL */}
      {mode === "road" && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {t("Road Shipment Subtype *", "نوع النقل البري *")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <button
              type="button"
              onClick={() => onSelectRoadSubtype("ftl")}
              className={`p-3 rounded-xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
                roadSubtype === "ftl"
                  ? "border-blue-600 bg-white text-blue-900 shadow-xs font-bold"
                  : "border-slate-200 bg-white/70 hover:bg-white text-slate-700"
              }`}
            >
              <div className="font-extrabold text-xs sm:text-sm">
                {t("Full Truck Load (FTL)", "حمولة شاحنة كاملة (FTL)")}
              </div>
              {roadSubtype === "ftl" && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <IconCheck size={12} />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectRoadSubtype("ltl")}
              className={`p-3 rounded-xl border-2 text-start transition flex items-center justify-between cursor-pointer ${
                roadSubtype === "ltl"
                  ? "border-blue-600 bg-white text-blue-900 shadow-xs font-bold"
                  : "border-slate-200 bg-white/70 hover:bg-white text-slate-700"
              }`}
            >
              <div className="font-extrabold text-xs sm:text-sm">
                {t("Less than Truck Load (LTL)", "حمولة شاحنة جزئية (LTL)")}
              </div>
              {roadSubtype === "ltl" && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <IconCheck size={12} />
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * @file src/pages/landing/components/LiveLogisticsTicker.tsx
 * @description Real-time scrolling telemetry ticker showcasing live platform activity,
 *              dispatched containers, carrier bids, and customs clearance events.
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

export function LiveLogisticsTicker() {
  const { t } = useLanguage();

  const events = [
    {
      icon: "🚢",
      textAr: "حاوية 40HC مبحرة الآن من شنغهاي إلى الإسكندرية عبر SilkRoute Forwarding",
      textEn: "40HC Container departed Shanghai Port to Alexandria via SilkRoute",
      time: "منذ 4 دقائق",
    },
    {
      icon: "⚡",
      textAr: "تم اختيار العرض الأفضل للطلب RFQ-1048 وتثبيت النولون بنجاح",
      textEn: "Best carrier quote selected for RFQ-1048 with confirmed rate",
      time: "منذ 11 دقيقة",
    },
    {
      icon: "✈️",
      textAr: "شحنة إلكترونيات جوية غادرت دبي (DXB) متجهة إلى مطار القاهرة الدولي",
      textEn: "Air Cargo Electronics shipment dispatched DXB to Cairo International",
      time: "منذ 18 دقيقة",
    },
    {
      icon: "🟢",
      textAr: "اكتمال الفحص والتخليص الجمركي المسبق بميناء الدخيلة خلال ساعتين",
      textEn: "Customs pre-clearance successfully completed at Dekheila Port in 2 hours",
      time: "منذ 25 دقيقة",
    },
    {
      icon: "🚛",
      textAr: "شاحنة نقل مبرد FTL أنهت التوصيل النهائي بمستودعات العاشر من رمضان",
      textEn: "Reefer FTL truck completed final warehouse delivery at 10th of Ramadan",
      time: "منذ 32 دقيقة",
    },
  ];

  return (
    <div className="w-full bg-slate-950/90 border-y border-slate-800/80 py-3 overflow-hidden backdrop-blur-md font-['Cairo',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Live Badge */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{t("Live Operations", "بث حي للعمليات")}</span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
            {events.concat(events).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-sm">{item.icon}</span>
                <span className="font-semibold text-white">{item.textAr}</span>
                <span className="text-[10px] text-slate-500 font-mono">({item.time})</span>
                <span className="text-slate-700">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-flex;
          animation: ticker 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

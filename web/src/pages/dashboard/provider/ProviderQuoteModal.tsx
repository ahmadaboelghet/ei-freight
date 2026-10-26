/**
 * @file src/pages/dashboard/provider/ProviderQuoteModal.tsx
 * @description Provider Quote Composer & Review Modal.
 *              Allows verified carriers to view request details, input ocean/air freight,
 *              origin & destination THC charges, transit days, and submit official bids.
 */

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ProviderMatchedRfq, ProviderQuoteDetail } from "./types";
import { IconClose, IconCheck } from "../../../components/ui/Icons";

interface ProviderQuoteModalProps {
  rfq: ProviderMatchedRfq;
  onClose: () => void;
  onSubmitQuote: (rfqId: string, quote: ProviderQuoteDetail) => Promise<void> | void;
}

export function ProviderQuoteModal({
  rfq,
  onClose,
  onSubmitQuote,
}: ProviderQuoteModalProps) {
  const { t, isArabic } = useLanguage();

  const [freightRate, setFreightRate] = useState<string>(
    rfq.quote ? String(rfq.quote.freightRate) : "1850"
  );
  const [originCharges, setOriginCharges] = useState<string>(
    rfq.quote ? String(rfq.quote.originCharges) : "180"
  );
  const [destCharges, setDestCharges] = useState<string>(
    rfq.quote ? String(rfq.quote.destCharges) : "140"
  );
  const [transitDays, setTransitDays] = useState<string>(
    rfq.quote ? String(rfq.quote.transitDays) : "14"
  );
  const [routingType, setRoutingType] = useState<"direct" | "transit">(
    rfq.quote?.routingType || "direct"
  );
  const [validUntil, setValidUntil] = useState<string>(
    rfq.quote?.validUntil || "2026-11-20"
  );
  const [carrierNotes, setCarrierNotes] = useState<string>(
    rfq.quote?.carrierNotes || "14 days detention free time included at destination port."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const total =
    (parseFloat(freightRate) || 0) +
    (parseFloat(originCharges) || 0) +
    (parseFloat(destCharges) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const quoteData: ProviderQuoteDetail = {
      freightRate: parseFloat(freightRate) || 0,
      originCharges: parseFloat(originCharges) || 0,
      destCharges: parseFloat(destCharges) || 0,
      totalPrice: total,
      transitDays: parseInt(transitDays, 10) || 14,
      routingType,
      validUntil,
      carrierNotes,
      submittedAt: new Date().toISOString(),
      status: "active",
    };

    try {
      await onSubmitQuote(rfq.id, quoteData);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Quote submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo',sans-serif] animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-1">
              <span>{rfq.modeLabel}</span>
              <span>•</span>
              <span className="font-mono">{rfq.id}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {rfq.hasSubmitted
                ? t("Review Submitted Quotation", "مراجعة عرض السعر المقدم")
                : t("Compose Carrier Quotation", "تقديم عرض سعر الناقل")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{rfq.origin}</span>
              <span className="text-slate-400 font-normal">{isArabic ? "←" : "➔"}</span>
              <span>{rfq.destination}</span>
              <span className="text-slate-300">•</span>
              <span>{rfq.cargo} ({rfq.weight})</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm transition cursor-pointer"
          >
            <IconClose size={18} />
          </button>
        </div>

        {successMsg ? (
          <div className="py-12 text-center space-y-3">
            <span className="text-4xl">🎉</span>
            <h4 className="text-lg font-bold text-slate-900">
              {t("Quotation Submitted Successfully!", "تم إرسال عرض السعر بنجاح!")}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t(
                "Your commercial bid is now active and in review with EI Freight operations desk.",
                "عرضك التجاري نشط الآن وقيد المراجعة لدى مكتب عمليات EI Freight لتقديمه للعميل."
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Base Freight Rate ($) *", "نولون الشحن البحري / الجوي ($) *")}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={freightRate}
                  onChange={(e) => setFreightRate(e.target.value)}
                  placeholder="1850"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Origin THC / Charges ($)", "رسوم ميناء المغادرة / THC ($)")}
                </label>
                <input
                  type="number"
                  value={originCharges}
                  onChange={(e) => setOriginCharges(e.target.value)}
                  placeholder="180"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Destination Port Fees ($)", "رسوم ميناء الوصول ($)")}
                </label>
                <input
                  type="number"
                  value={destCharges}
                  onChange={(e) => setDestCharges(e.target.value)}
                  placeholder="140"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Transit and Validity Row */}
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Routing Line Type", "نوع خط الإبحار")}
                </label>
                <select
                  value={routingType}
                  onChange={(e) => setRoutingType(e.target.value as "direct" | "transit")}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Notes */}
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
                  "مثال: ١٤ يوم سماح لتفريغ الحاويات في ميناء الوصول..."
                )}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total Calculation Strip */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {t("Total Quoted Price", "إجمالي السعر المقدم")}
              </span>
              <span className="text-2xl font-black text-blue-600 font-mono">
                ${total.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400">USD</span>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {t("Cancel", "إلغاء")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{rfq.hasSubmitted ? t("Update Quotation", "تحديث العرض") : t("Submit Official Bid 🚀", "إرسال العرض الرسمي 🚀")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

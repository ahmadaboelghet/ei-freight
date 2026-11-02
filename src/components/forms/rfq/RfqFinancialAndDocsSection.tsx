/**
 * @file src/components/forms/rfq/RfqFinancialAndDocsSection.tsx
 * @description Step 1.8: Financial Terms (Bill of Lading Type for Sea, Payment Type, Credit Days)
 *              and General Supporting Attachments.
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { CanonicalPaymentTerms, CanonicalAttachment } from "../../../types/domain";

interface RfqFinancialAndDocsSectionProps {
  paymentTerms: CanonicalPaymentTerms;
  mode: string;
  attachments: CanonicalAttachment[];
  onChangePaymentTerms: (updates: Partial<CanonicalPaymentTerms>) => void;
  onAddAttachments: (files: FileList | null) => void;
  onRemoveAttachment: (id: string) => void;
}

export function RfqFinancialAndDocsSection({
  paymentTerms,
  mode,
  attachments,
  onChangePaymentTerms,
  onAddAttachments,
  onRemoveAttachment,
}: RfqFinancialAndDocsSectionProps) {
  const { t } = useLanguage();

  const isSea = mode === "sea";

  return (
    <section className="space-y-6 pt-4 border-t border-slate-100">
      {/* ── Financial Terms Header ── */}
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
          8
        </span>
        <div>
          <h3 className="text-sm font-black text-slate-900">
            {t("Financial Terms & Payment Preferences", "الشروط والمعاملات المالية")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("Specify payment terms and bill of lading type", "تحديد نوع بوليصة الشحن وطريقة السداد")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bill of Lading Type (Top-level Sea Only) */}
        {isSea && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("Bill of Lading Type *", "نوع بوليصة الشحن *")}
            </label>
            <select
              value={paymentTerms.billOfLadingType || ""}
              onChange={(e) =>
                onChangePaymentTerms({
                  billOfLadingType: e.target.value as "original_bl" | "sea_waybill" | "telex_release",
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">{t("Select Bill of Lading Type", "اختر نوع البوليصة")}</option>
              <option value="original_bl">Original B/L (بوليصة أصلية)</option>
              <option value="sea_waybill">Sea Waybill (بوليصة إلكترونية مباشرة)</option>
              <option value="telex_release">Telex Release (إفراج تلكس)</option>
            </select>
          </div>
        )}

        {/* Payment Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("Payment Type *", "طريقة السداد *")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangePaymentTerms({ type: "cash", creditDays: null })}
              className={`px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition cursor-pointer ${
                paymentTerms.type === "cash"
                  ? "border-blue-600 bg-blue-50 text-blue-900 font-extrabold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {t("Cash", "كاش (نقدي)")}
            </button>
            <button
              type="button"
              onClick={() => onChangePaymentTerms({ type: "credit", creditDays: paymentTerms.creditDays || 30 })}
              className={`px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition cursor-pointer ${
                paymentTerms.type === "credit"
                  ? "border-blue-600 bg-blue-50 text-blue-900 font-extrabold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {t("Credit", "كريدت (آجل)")}
            </button>
          </div>
        </div>

        {/* Credit Days Input */}
        {paymentTerms.type === "credit" && (
          <div className="animate-fade-in sm:col-span-2 max-w-sm">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t(
                "Credit Period from Receipt of Transport Document (Days) *",
                "مدة الائتمان من تاريخ استلام البوليصة (بالأيام) *"
              )}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                required
                value={paymentTerms.creditDays || ""}
                onChange={(e) =>
                  onChangePaymentTerms({
                    creditDays: parseInt(e.target.value, 10) || null,
                  })
                }
                placeholder="30"
                className="w-32 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-xs font-bold text-slate-500">{t("days", "يوم")}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── General Attachments Area ── */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {t("Supporting Documents & Attachments (Optional)", "مستندات داعمة ومرفقات (اختياري)")}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t(
                "Commercial invoice, packing list, or cargo pictures (PDF, JPG, PNG <= 10MB)",
                "الفاتورة المبدئية، بيان العبوة، أو صور البضاعة (بحد أقصى 10 ميجابايت)"
              )}
            </p>
          </div>

          <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs">
            <span>＋ {t("Add Files", "إرفاق ملفات")}</span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => onAddAttachments(e.target.files)}
              className="hidden"
            />
          </label>
        </div>

        {/* Uploaded file list */}
        {attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{file.type?.includes("pdf") ? "📄" : "🖼"}</span>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{file.name}</p>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveAttachment(file.id)}
                  className="text-rose-600 hover:text-rose-800 text-xs font-bold ms-2 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-1">
            {t("No attachments added.", "لم يتم إرفاق أي ملفات إضافية.")}
          </p>
        )}
      </div>
    </section>
  );
}

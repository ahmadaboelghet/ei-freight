/**
 * @file src/components/forms/rfq/RfqDirtyCloseDialog.tsx
 * @description Confirmation modal when user attempts to close or discard an in-progress RFQ draft.
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { IconClose } from "../../ui/Icons";

interface RfqDirtyCloseDialogProps {
  isOpen: boolean;
  onConfirmClose: () => void;
  onCancel: () => void;
}

export function RfqDirtyCloseDialog({
  isOpen,
  onConfirmClose,
  onCancel,
}: RfqDirtyCloseDialogProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 max-w-md w-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <IconClose className="w-6 h-6 stroke-[2.5]" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-2">
          {t("Discard Request Draft?", "هل تريد إلغاء مسودة الطلب؟")}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          {t(
            "You have unsaved changes in this shipment request. If you leave now, your entered details will be lost.",
            "لديك بيانات غير محفوظة في هذا الطلب. إذا غادرت الآن، سيتم فقدان كافة التغييرات والبيانات المدخلة."
          )}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            {t("Continue Editing", "متابعة التعديل")}
          </button>
          <button
            onClick={onConfirmClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-sm transition"
          >
            {t("Discard & Close", "إلغاء وإغلاق")}
          </button>
        </div>
      </div>
    </div>
  );
}

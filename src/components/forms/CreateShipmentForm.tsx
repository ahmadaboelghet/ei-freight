/**
 * @file src/components/forms/CreateShipmentForm.tsx
 * @description Bilingual Shipment request form — fully wired to Firebase via the service layer.
 *
 *  Architecture:
 *    • This component is PURELY PRESENTATIONAL.
 *    • All state, validation, and submission logic lives in `useShipmentForm`.
 *    • The component only renders fields and delegates events to the hook.
 *    • Auth check is done in the hook — component stays clean.
 */

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useShipmentForm } from "../../hooks/useShipmentForm";
import { FormField, inputCls, selectCls } from "../ui/FormField";
import { ShipmentMode } from "../../types/domain";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const INCOTERMS = ["EXW","FCA","CPT","CIP","DAP","DPU","DDP","FAS","FOB","CFR","CIF"];
const CONTAINER_TYPES = ["20GP", "40GP", "40HC", "45HC", "20RF", "40RF"];

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

/** Section heading with subtle divider */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
        {children}
      </div>
      <hr className="mt-6 border-slate-100" />
    </div>
  );
}

/** Address group: label, city, governorate, country, street */
function AddressGroup({
  prefix,
  title,
  subtitle,
  form,
  setField,
  t,
}: {
  prefix: "origin" | "dest";
  title: string;
  subtitle: string;
  form: ReturnType<typeof useShipmentForm>["form"];
  setField: ReturnType<typeof useShipmentForm>["setField"];
  t: (en: string, ar: string) => string;
}) {
  const f = (sub: string) => `${prefix}${sub[0].toUpperCase() + sub.slice(1)}` as keyof typeof form;
  return (
    <Section title={title} subtitle={subtitle}>
      <FormField label={t("Location Label", "اسم أو وصف الموقع")} htmlFor={`${prefix}-label`} required className="sm:col-span-2">
        <input
          id={`${prefix}-label`}
          type="text"
          placeholder={prefix === "origin" ? t("e.g. Port Said Dry Port", "مثال: ميناء بورسعيد الجاف") : t("e.g. Jebel Ali Port", "مثال: ميناء جبل علي")}
          value={form[f("label")] as string}
          onChange={(e) => setField(f("label"), e.target.value)}
          className={inputCls()}
        />
      </FormField>
      <FormField label={t("City", "المدينة")} htmlFor={`${prefix}-city`} required>
        <input
          id={`${prefix}-city`}
          type="text"
          placeholder={t("City", "المدينة")}
          value={form[f("city")] as string}
          onChange={(e) => setField(f("city"), e.target.value)}
          className={inputCls()}
        />
      </FormField>
      <FormField label={t("Governorate / Region", "المحافظة / الإقليم")} htmlFor={`${prefix}-gov`} required>
        <input
          id={`${prefix}-gov`}
          type="text"
          placeholder={t("Governorate or State", "المحافظة أو الولاية")}
          value={form[f("gov")] as string}
          onChange={(e) => setField(f("gov"), e.target.value)}
          className={inputCls()}
        />
      </FormField>
      <FormField label={t("Country Code", "رمز الدولة")} htmlFor={`${prefix}-country`} required hint={t("2-letter ISO code, e.g. EG, AE, SA", "رمز ثنائي، مثل: EG, AE, SA")}>
        <input
          id={`${prefix}-country`}
          type="text"
          maxLength={2}
          placeholder="EG"
          value={form[f("country")] as string}
          onChange={(e) => setField(f("country"), e.target.value.toUpperCase())}
          className={clsx(inputCls(), "uppercase tracking-widest font-mono")}
        />
      </FormField>
      <FormField label={t("Street Address", "العنوان بالتفصيل")} htmlFor={`${prefix}-street`} hint={t("Optional", "اختياري")}>
        <input
          id={`${prefix}-street`}
          type="text"
          placeholder={t("Optional street address", "العنوان بالشارع (اختياري)")}
          value={form[f("street")] as string}
          onChange={(e) => setField(f("street"), e.target.value)}
          className={inputCls()}
        />
      </FormField>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function CreateShipmentForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    form,
    setField,
    validationErrors,
    submitError,
    isSubmitting,
    handleSubmit,
  } = useShipmentForm();

  const modes: { value: ShipmentMode; label: string; icon: string }[] = [
    { value: "sea", label: t("Sea Freight", "شحن بحري"), icon: "🚢" },
    { value: "air", label: t("Air Freight", "شحن جوي"), icon: "✈️" },
    { value: "road", label: t("Road Freight", "شحن بري"), icon: "🚛" },
    { value: "multimodal", label: t("Multimodal", "متعدد الوسائط"), icon: "🔗" },
  ];

  const packagingTypes = [
    { value: "pallets", label: t("Pallets", "بالتات / طبالي") },
    { value: "boxes", label: t("Boxes", "كراتين / صناديق") },
    { value: "drums", label: t("Drums", "براميل") },
    { value: "bags", label: t("Bags", "أكياس / شكائر") },
    { value: "crates", label: t("Crates", "أقفاص خشبية") },
    { value: "loose", label: t("Loose", "بضائع صب / سائبة") },
    { value: "other", label: t("Other", "أخرى") },
  ];

  const truckTypes = [
    { value: "curtainsider", label: t("Curtainsider", "شاحنة ستائرية") },
    { value: "flatbed", label: t("Flatbed", "شاحنة مسطحة") },
    { value: "box_truck", label: t("Box Truck", "شاحنة صندوق مقفل") },
    { value: "reefer_truck", label: t("Reefer Truck", "شاحنة تبريد وتجميد") },
    { value: "lowbed", label: t("Lowbed", "لوبد حمولات ثقيلة") },
    { value: "tanker", label: t("Tanker", "صهريج") },
  ];

  // ── Guard: unauthenticated ──────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-amber-50 border border-amber-200 rounded-2xl max-w-sm">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-3 text-lg font-bold text-amber-900">{t("Sign In Required", "تسجيل الدخول مطلوب")}</h2>
          <p className="mt-1 text-sm text-amber-700">
            {t("You must be signed in to create a shipment request.", "يجب تسجيل الدخول لتقديم طلب عرض أسعار شحن.")}
          </p>
        </div>
      </div>
    );
  }

  // ── Guard: account not approved ─────────────────────────
  if (user.status !== "approved") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-2xl max-w-sm">
          <span className="text-4xl">⏳</span>
          <h2 className="mt-3 text-lg font-bold text-blue-900">{t("Account Pending Approval", "الحساب قيد المراجعة والاعتماد")}</h2>
          <p className="mt-1 text-sm text-blue-700">
            {t(
              `Your account is currently ${user.status}. Once approved by EI Freight, you'll be able to submit shipment requests.`,
              `حسابك حالياً في حالة "${user.status}". بمجرد اعتماده من إدارة EI Freight ستتمكن من تقديم طلبات الشحن مباشرة.`
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
          {t("New Request", "طلب جديد")}
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          {t("Create Shipment Request", "طلب عرض أسعار شحن جديد")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t(
            "Fill in the details below. Our team will match you with the best freight providers.",
            "املأ البيانات أدناه، وسيقوم فريقنا بربط شحنتك بأفضل مزودي خدمات الشحن المعتمدين."
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

        {/* ═══════════════════════════════════════════════════
            SECTION 1 — TRANSPORT MODE
        ═══════════════════════════════════════════════════ */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {t("Transport Mode", "وسيلة النقل")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {modes.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setField("mode", value)}
                className={clsx(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-all",
                  form.mode === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/50"
                )}
                aria-pressed={form.mode === value}
              >
                <span className="text-2xl">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <hr className="mt-6 border-slate-100" />
        </div>

        {/* ═══════════════════════════════════════════════════
            SECTION 2 — ORIGIN
        ═══════════════════════════════════════════════════ */}
        <AddressGroup
          prefix="origin"
          title={t("📍 Pick-up Location", "📍 مكان الاستلام (ميناء / نقطة الشحن)")}
          subtitle={t("Enter the pick-up location details.", "أدخل بيانات وموقع استلام البضاعة من المصنع أو الميناء.")}
          form={form}
          setField={setField}
          t={t}
        />

        {/* ═══════════════════════════════════════════════════
            SECTION 3 — DESTINATION
        ═══════════════════════════════════════════════════ */}
        <AddressGroup
          prefix="dest"
          title={t("🏁 Delivery Location", "🏁 مكان التسليم (ميناء / نقطة الوصول)")}
          subtitle={t("Enter the delivery location details.", "أدخل بيانات وموقع تسليم الشحنة للوجهة النهائية.")}
          form={form}
          setField={setField}
          t={t}
        />

        {/* ═══════════════════════════════════════════════════
            SECTION 4 — CARGO DETAILS
        ═══════════════════════════════════════════════════ */}
        <Section
          title={t("📦 Cargo Details", "📦 تفاصيل ومواصفات البضاعة")}
          subtitle={t("Describe the goods being shipped.", "صف نوع وطبيعة البضائع المشحونة.")}
        >
          <FormField label={t("Cargo Description", "وصف البضاعة")} htmlFor="cargo-desc" required className="sm:col-span-2">
            <textarea
              id="cargo-desc"
              rows={2}
              placeholder={t("e.g. Electronic components, industrial machinery parts…", "مثال: معدات كهربائية، قطع غيار صناعية، منسوجات قطنية...")}
              value={form.cargoDescription}
              onChange={(e) => setField("cargoDescription", e.target.value)}
              className={clsx(inputCls(), "resize-none")}
            />
          </FormField>

          <FormField label={t("Weight (kg)", "الوزن الإجمالي (كجم)")} htmlFor="weight" required>
            <input
              id="weight"
              type="number"
              min={0.1}
              step={0.1}
              placeholder="e.g. 12500"
              value={form.weightKg}
              onChange={(e) => setField("weightKg", e.target.value)}
              className={inputCls()}
            />
          </FormField>

          <FormField label={t("Volume (CBM)", "الحجم بالمتر المكعب (CBM)")} htmlFor="volume" hint={t("Optional", "اختياري")}>
            <input
              id="volume"
              type="number"
              min={0.1}
              step={0.1}
              placeholder="e.g. 48.5"
              value={form.volumeCbm}
              onChange={(e) => setField("volumeCbm", e.target.value)}
              className={inputCls()}
            />
          </FormField>

          <FormField label={t("Packaging Type", "نوع التعبئة والتغليف")} htmlFor="packaging">
            <select
              id="packaging"
              value={form.packagingType}
              onChange={(e) => setField("packagingType", e.target.value)}
              className={selectCls()}
            >
              <option value="">{t("— Select —", "— اختر النوع —")}</option>
              {packagingTypes.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t("Quantity (units)", "الكمية / عدد الطرود")} htmlFor="qty" hint={t("Optional", "اختياري")}>
            <input
              id="qty"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 24"
              value={form.quantity}
              onChange={(e) => setField("quantity", e.target.value)}
              className={inputCls()}
            />
          </FormField>

          <FormField label={t("Incoterms", "شروط التجارة الدولية (Incoterms)")} htmlFor="incoterms" hint={t("Optional", "اختياري")}>
            <select
              id="incoterms"
              value={form.incoterms}
              onChange={(e) => setField("incoterms", e.target.value)}
              className={selectCls()}
            >
              <option value="">{t("— Select Incoterms —", "— اختر شرط التجارة —")}</option>
              {INCOTERMS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t("Routing Preference", "تفضيل خط السير")} htmlFor="routing">
            <select
              id="routing"
              value={form.routingPreference}
              onChange={(e) => setField("routingPreference", e.target.value)}
              className={selectCls()}
            >
              <option value="">{t("— Any —", "— أي مسار متاح —")}</option>
              <option value="direct">{t("Direct", "مباشر")}</option>
              <option value="transit">{t("Via Transit Port", "ترانزيت عبر ميناء وسيط")}</option>
            </select>
          </FormField>

          {/* Toggles */}
          <div className="sm:col-span-2 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isHazardous}
                onChange={(e) => setField("isHazardous", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
              />
              <span className="text-sm text-slate-700">{t("⚠️ Hazardous Goods", "⚠️ بضائع ومواد خطرة (IMO)")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.requiresRefrigeration}
                onChange={(e) => setField("requiresRefrigeration", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
              />
              <span className="text-sm text-slate-700">{t("❄️ Requires Refrigeration", "❄️ تتطلب تبريد أو تجميد")}</span>
            </label>
          </div>

          {/* Temperature range — conditional */}
          {form.requiresRefrigeration && (
            <>
              <FormField label={t("Min Temperature (°C)", "أدنى درجة حرارة (°م)")} htmlFor="temp-min" required>
                <input
                  id="temp-min"
                  type="number"
                  step={1}
                  placeholder="e.g. -18"
                  value={form.temperatureMin}
                  onChange={(e) => setField("temperatureMin", e.target.value)}
                  className={inputCls()}
                />
              </FormField>
              <FormField label={t("Max Temperature (°C)", "أقصى درجة حرارة (°م)")} htmlFor="temp-max" required>
                <input
                  id="temp-max"
                  type="number"
                  step={1}
                  placeholder="e.g. 4"
                  value={form.temperatureMax}
                  onChange={(e) => setField("temperatureMax", e.target.value)}
                  className={inputCls()}
                />
              </FormField>
            </>
          )}
        </Section>

        {/* ═══════════════════════════════════════════════════
            SECTION 5 — MODE-SPECIFIC DETAILS
        ═══════════════════════════════════════════════════ */}
        {form.mode === "sea" && (
          <Section
            title={t("🚢 Sea Freight Details", "🚢 تفاصيل الشحن البحري")}
            subtitle={t("FCL = full container load, LCL = shared container.", "حاوية كاملة (FCL) أو شحنة مجزأة (LCL).")}
          >
            <FormField label={t("Shipment Type", "نوع الشحن البحري")} htmlFor="sea-type" required>
              <select
                id="sea-type"
                value={form.seaShipmentType}
                onChange={(e) => setField("seaShipmentType", e.target.value as "FCL" | "LCL")}
                className={selectCls()}
              >
                <option value="FCL">{t("FCL — Full Container Load", "FCL — حاوية كاملة")}</option>
                <option value="LCL">{t("LCL — Less than Container Load", "LCL — شحن مجزأ (أقل من حاوية)")}</option>
              </select>
            </FormField>

            {form.seaShipmentType === "FCL" && (
              <>
                <FormField label={t("Container Type", "نوع الحاوية")} htmlFor="container-type" hint={t("Optional", "اختياري")}>
                  <select
                    id="container-type"
                    value={form.containerType}
                    onChange={(e) => setField("containerType", e.target.value)}
                    className={selectCls()}
                  >
                    <option value="">{t("— Select —", "— اختر نوع الحاوية —")}</option>
                    {CONTAINER_TYPES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label={t("Container Count", "عدد الحاويات")} htmlFor="container-count" hint={t("Optional", "اختياري")}>
                  <input
                    id="container-count"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="e.g. 2"
                    value={form.containerCount}
                    onChange={(e) => setField("containerCount", e.target.value)}
                    className={inputCls()}
                  />
                </FormField>
              </>
            )}
          </Section>
        )}

        {form.mode === "road" && (
          <Section title={t("🚛 Road Freight Details", "🚛 تفاصيل الشحن البري")}>
            <FormField label={t("Shipment Type", "نوع النقل البري")} htmlFor="road-type" required>
              <select
                id="road-type"
                value={form.roadShipmentType}
                onChange={(e) => setField("roadShipmentType", e.target.value as "FTL" | "LTL")}
                className={selectCls()}
              >
                <option value="FTL">{t("FTL — Full Truck Load", "FTL — شاحنة كاملة")}</option>
                <option value="LTL">{t("LTL — Less than Truck Load", "LTL — حمولة مجزأة")}</option>
              </select>
            </FormField>
            <FormField label={t("Truck Type", "نوع الشاحنة المفضلة")} htmlFor="truck-type" hint={t("Optional vehicle preference", "اختياري")}>
              <select
                id="truck-type"
                value={form.truckType}
                onChange={(e) => setField("truckType", e.target.value)}
                className={selectCls()}
              >
                <option value="">{t("— Any —", "— أي نوع متاح —")}</option>
                {truckTypes.map((tItem) => (
                  <option key={tItem.value} value={tItem.value}>{tItem.label}</option>
                ))}
              </select>
            </FormField>
          </Section>
        )}

        {/* ═══════════════════════════════════════════════════
            SECTION 6 — NOTES
        ═══════════════════════════════════════════════════ */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {t("📝 Additional Notes", "📝 ملاحظات وتفاصيل إضافية")}
          </h2>
          <textarea
            rows={3}
            placeholder={t(
              "Any special requirements, preferred carriers, deadline constraints…",
              "أي متطلبات خاصة، ناقلين مفضلين، تواريخ نهائية حرجة للتسليم..."
            )}
            value={form.clientNotes}
            onChange={(e) => setField("clientNotes", e.target.value)}
            className={clsx(inputCls(), "resize-none w-full")}
          />
        </div>

        {/* ═══════════════════════════════════════════════════
            VALIDATION ERRORS
        ═══════════════════════════════════════════════════ */}
        {validationErrors.length > 0 && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-1"
          >
            <p className="text-sm font-bold text-red-700 mb-2">
              {t("Please fix the following before submitting:", "يرجى تصحيح الأخطاء التالية قبل الإرسال:")}
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-sm text-red-600">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Submit error (from Firebase) ── */}
        {submitError && (
          <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-bold text-red-700">{t("Submission failed", "فشل إرسال الطلب")}</p>
            <p className="text-sm text-red-600 mt-1">{submitError}</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            SUBMIT BUTTON
        ═══════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-400">
            {t("Logged in as", "مسجل باسم:")} <strong className="text-slate-600 font-mono">{user.email}</strong>
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm",
              "bg-blue-600 text-white shadow-sm transition-all",
              "hover:bg-blue-700 active:scale-[0.98]",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t("Submitting…", "جارٍ إرسال الطلب…")}
              </>
            ) : (
              <>{t("🚀 Submit Request", "🚀 إرسال طلب الشحن")}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateShipmentForm;

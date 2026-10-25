/**
 * @file src/pages/auth/SignupPage.tsx
 * @description Bilingual multi-step interactive registration flow matching EI Freight personas:
 *              - Client (Personal vs Business)
 *              - Service Provider (Carrier / Freight Forwarder)
 */

import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { UserRole, ClientType, ShipmentMode } from "../../types/domain";
import { clsx } from "clsx";

export function SignupPage() {
  const { signup, authError, clearError, loading } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  // ── Step management: 1 (Role) -> 2 (Details) -> 3 (Complete) ──
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Form State ──
  const [selectedRole, setSelectedRole] = useState<"client" | "provider">("client");
  const [clientType, setClientType] = useState<ClientType>("business");

  // Common credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Business client fields
  const [companyName, setCompanyName] = useState("");
  const [commercialRegNo, setCommercialRegNo] = useState("");
  const [taxId, setTaxId] = useState("");

  // Provider fields
  const [providerModes, setProviderModes] = useState<ShipmentMode[]>(["sea", "road"]);

  // Local validation & UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function toggleProviderMode(mode: ShipmentMode) {
    setProviderModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (password.length < 6) {
      setValidationError(
        t("Password must be at least 6 characters.", "يجب ألا تقل كلمة المرور عن ٦ أحرف.")
      );
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(
        t("Passwords do not match.", "كلمتا المرور غير متطابقتين.")
      );
      return;
    }

    if (selectedRole === "client" && clientType === "business" && !companyName.trim()) {
      setValidationError(
        t("Company name is required for business accounts.", "اسم الشركة مطلوب لحسابات الشركات.")
      );
      return;
    }

    if (selectedRole === "provider" && !companyName.trim()) {
      setValidationError(
        t("Company/Organization name is required.", "اسم شركة الشحن مطلوب.")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const extraData = {
        phone: phone.trim(),
        clientType: selectedRole === "client" ? clientType : undefined,
        companyName: companyName.trim() || undefined,
        commercialRegistrationNo: commercialRegNo.trim() || undefined,
        taxId: taxId.trim() || undefined,
        providerType: providerModes[0] || "multimodal",
        supportedServices: providerModes.map((m) => m.toUpperCase()),
        status: "approved" as const, // Approved for seamless prototype testing
      };

      await signup(
        email.trim(),
        password,
        name.trim(),
        selectedRole as UserRole,
        extraData
      );

      setStep(3); // Move to completion view
    } catch {
      // Handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10 relative">
      {/* Language Switcher in Corner */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition"
        >
          <span>🌐</span>
          <span>{lang === "ar" ? "English" : "العربية"}</span>
        </button>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
        {/* Brand & Progress Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl mb-3 shadow-md">
            EI
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("Create your EI Freight Account", "إنشاء حسابك في EI Freight")}
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
            {step === 1 && t("Step 1 of 2 · Choose your account role", "الخطوة ١ من ٢ · اختر نوع الحساب")}
            {step === 2 &&
              `${t("Step 2 of 2 · ", "الخطوة ٢ من ٢ · ")}${
                selectedRole === "client"
                  ? t("Client Profile", "ملف بيانات العميل")
                  : t("Provider Capabilities", "إمكانيات مزود الخدمة")
              }`}
            {step === 3 && t("Registration Confirmed", "تم تأكيد التسجيل بنجاح")}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={clsx("h-1.5 rounded-full transition-all", step === 1 ? "w-8 bg-blue-600" : "w-2 bg-slate-200")}></span>
            <span className={clsx("h-1.5 rounded-full transition-all", step === 2 ? "w-8 bg-blue-600" : "w-2 bg-slate-200")}></span>
            <span className={clsx("h-1.5 rounded-full transition-all", step === 3 ? "w-8 bg-emerald-600" : "w-2 bg-slate-200")}></span>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            STEP 1: ROLE SELECTION
        ═════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-base font-bold text-slate-800">
                {t("How will you use the platform?", "كيف تخطط لاستخدام المنصة؟")}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  "Select your persona to customize your dashboard and freight workflows.",
                  "اختر نوع حسابك لتخصيص لوحة التحكم ودورات العمل المناسبة لك."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Client */}
              <button
                type="button"
                onClick={() => setSelectedRole("client")}
                className={clsx(
                  "p-5 rounded-2xl border-2 text-left rtl:text-right transition-all relative flex flex-col justify-between",
                  selectedRole === "client"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl mb-3">
                    📦
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t("Client / Shipper", "عميل شحن / شاحن بضائع")}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t(
                      "Request freight quotations, compare bids from vetted carriers, and manage shipments.",
                      "طلب عروض أسعار شحن، مقارنة عروض الناقلين المعتمدين، وإدارة الشحنات بسهولة."
                    )}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>{t("I need to ship cargo", "أريد شحن بضائع")}</span>
                  <span className={clsx("w-4 h-4 rounded-full border flex items-center justify-center text-[10px]", selectedRole === "client" ? "bg-blue-600 text-white border-blue-600" : "border-slate-300")}>
                    {selectedRole === "client" && "✓"}
                  </span>
                </div>
              </button>

              {/* Option B: Service Provider */}
              <button
                type="button"
                onClick={() => setSelectedRole("provider")}
                className={clsx(
                  "p-5 rounded-2xl border-2 text-left rtl:text-right transition-all relative flex flex-col justify-between",
                  selectedRole === "provider"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl mb-3">
                    🚢
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t("Service Provider", "مزود خدمة / ناقل لوجستي")}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t(
                      "Receive matched RFQs, submit freight offers (sea, air, road), and win shipping jobs.",
                      "استلام المناقصات المطابقة، تقديم عروض الأسعار (بحري، جوي، بري)، والفوز بطلبات الشحن."
                    )}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>{t("I offer transport services", "أقدم خدمات شحن ونقل")}</span>
                  <span className={clsx("w-4 h-4 rounded-full border flex items-center justify-center text-[10px]", selectedRole === "provider" ? "bg-blue-600 text-white border-blue-600" : "border-slate-300")}>
                    {selectedRole === "provider" && "✓"}
                  </span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>{t("Continue to Account Details", "المتابعة إلى بيانات الحساب")}</span>
              <span className="rtl:rotate-180">→</span>
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              {t("Already have an account?", "لديك حساب بالفعل؟")}{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                {t("Sign in here", "سجل دخولك هنا")}
              </Link>
            </p>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════
            STEP 2: DETAILS (CLIENT OR PROVIDER)
        ═════════════════════════════════════════════════════ */}
        {step === 2 && (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* If Client: Choose Personal vs Business */}
            {selectedRole === "client" && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  {t("Client Account Type", "تصنيف حساب العميل")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClientType("personal")}
                    className={clsx(
                      "py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center",
                      clientType === "personal"
                        ? "bg-white text-blue-700 shadow-xs border border-blue-200"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    👤 {t("Personal", "أفراد")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientType("business")}
                    className={clsx(
                      "py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center",
                      clientType === "business"
                        ? "bg-white text-blue-700 shadow-xs border border-blue-200"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    🏢 {t("Business / Company", "شركات ومؤسسات")}
                  </button>
                </div>
              </div>
            )}

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Full Name / Contact Person *", "الاسم بالكامل / مسؤول الاتصال *")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("e.g. Nour Hassan", "مثال: نور حسن")}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Phone Number", "رقم الهاتف / الجوال")}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                />
              </div>

              {/* Company Details if Business Client or Provider */}
              {(selectedRole === "provider" || (selectedRole === "client" && clientType === "business")) && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {selectedRole === "provider"
                        ? t("Logistics Company Name *", "اسم شركة الشحن واللوجستيات *")
                        : t("Company / Organization Name *", "اسم الشركة أو المنشأة *")}
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={
                        selectedRole === "provider"
                          ? t("e.g. BlueWave Logistics Ltd.", "مثال: شركة بلو ويف للخدمات اللوجستية")
                          : t("e.g. Atlas Homeware Egypt", "مثال: شركة أطلس للأدوات المنزلية")
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Commercial Reg. (السجل التجاري)", "رقم السجل التجاري")}
                    </label>
                    <input
                      type="text"
                      value={commercialRegNo}
                      onChange={(e) => setCommercialRegNo(e.target.value)}
                      placeholder="e.g. 1029384"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Tax Registration / Card (البطاقة الضريبية)", "رقم البطاقة الضريبية")}
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="e.g. 987-654-321"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                    />
                  </div>
                </>
              )}

              {/* Provider Transport Modes */}
              {selectedRole === "provider" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {t("Transport Capabilities (Select all that apply)", "إمكانيات ووسائط النقل المتاحة لديك")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: "sea" as const, label: t("🚢 Sea Freight", "🚢 شحن بحري") },
                        { id: "air" as const, label: t("✈️ Air Cargo", "✈️ شحن جوي") },
                        { id: "road" as const, label: t("🚛 Road Trucking", "🚛 شحن بري") },
                        { id: "multimodal" as const, label: t("🔗 Multimodal", "🔗 متعدد الوسائط") },
                      ]
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleProviderMode(m.id)}
                        className={clsx(
                          "py-2 px-2.5 rounded-lg text-xs font-semibold border transition text-center",
                          providerModes.includes(m.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Login Credentials */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Email Address *", "البريد الإلكتروني *")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Password *", "كلمة المرور *")}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Confirm Password *", "تأكيد كلمة المرور *")}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Error Message */}
            {(validationError || authError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                {validationError || authError}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                {t("← Back", "→ رجوع")}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? t("Creating Account…", "جارٍ إنشاء الحساب…")
                  : t("Complete Registration 🚀", "إتمام التسجيل 🚀")}
              </button>
            </div>
          </form>
        )}

        {/* ═════════════════════════════════════════════════════
            STEP 3: REGISTRATION COMPLETE
        ═════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
              ✓
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {t("Registration Successful!", "تم التسجيل بنجاح!")}
            </h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {t(
                `Your account has been created and verified on EI Freight as a ${
                  selectedRole === "client" ? `${clientType} Client` : "Service Provider"
                }.`,
                `تم إنشاء وتفعيل حسابك بنجاح على منصة EI Freight بصفتك ${
                  selectedRole === "client"
                    ? clientType === "business"
                      ? "عميل شركات"
                      : "عميل أفراد"
                    : "مزود خدمة شحن"
                }.`
              )}
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
              >
                {t("Open Dashboard Now ➔", "فتح لوحة التحكم الآن ←")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

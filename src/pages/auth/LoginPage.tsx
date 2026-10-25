/**
 * @file src/pages/auth/LoginPage.tsx
 * @description Bilingual login page wired to AuthContext with seeded Demo Accounts.
 */

import React, { useState, FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// PRE-SEEDED DEMO ACCOUNTS (Matches the EI Freight Prototype)
// ─────────────────────────────────────────────────────────────
export const DEMO_ACCOUNTS = [
  {
    role: "client" as const,
    clientType: "personal" as const,
    name: "Nour Hassan",
    company: "Atlas Homeware",
    email: "nour@atlashomeware.com",
    password: "Demo123!",
    badge: "Client (Personal)",
    badgeAr: "عميل (أفراد)",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    role: "client" as const,
    clientType: "business" as const,
    name: "Omar Khalil",
    company: "Nile Fresh Foods",
    email: "omar@nilefreshfoods.com",
    password: "Demo123!",
    badge: "Client (Business)",
    badgeAr: "عميل (شركات)",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    role: "admin" as const,
    internalRole: "super_admin" as const,
    name: "Ibrahim Al-Iraqi",
    company: "EI Freight",
    email: "ibrahim@eifreight.demo",
    password: "Demo123!",
    badge: "Super Admin",
    badgeAr: "مدير النظام",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    role: "staff" as const,
    internalRole: "operations" as const,
    name: "Operations Desk",
    company: "EI Freight",
    email: "operations@eifreight.demo",
    password: "Demo123!",
    badge: "Operations",
    badgeAr: "العمليات",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    role: "provider" as const,
    name: "Ahmed Farouk",
    company: "BlueWave Logistics",
    email: "ahmed@bluewavelogistics.com",
    password: "Demo123!",
    badge: "Provider",
    badgeAr: "مزود خدمة",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
];

export function LoginPage() {
  const { login, loginAsDemo, authError, clearError, loading } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Helper to ensure a demo account is registered and approved in Firebase
   * before signing in (useful when running against clean Emulators or a fresh project).
   */
  async function signInOrSeedDemo(demo: typeof DEMO_ACCOUNTS[0]) {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    setEmail(demo.email);
    setPassword(demo.password);

    try {
      // 1. Try standard login first
      await login(demo.email, demo.password);
      navigate(from, { replace: true });
    } catch {
      // 2. If user doesn't exist yet, seed them automatically with approved status
      try {
        const cred = await createUserWithEmailAndPassword(auth, demo.email, demo.password);
        await updateProfile(cred.user, { displayName: demo.name });

        const demoProfileData = {
          uid: cred.user.uid,
          email: demo.email,
          displayName: demo.name,
          role: demo.role,
          status: "approved", // Pre-approved for testing
          companyName: demo.company,
          ...("clientType" in demo && demo.clientType ? { clientType: demo.clientType } : {}),
          ...("internalRole" in demo && demo.internalRole ? { internalRole: demo.internalRole } : {}),
          monthlyShipmentLimit: 10,
          monthlyShipmentUsed: 0,
          lang: "en",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", cred.user.uid), demoProfileData);

        // Signed in!
        navigate(from, { replace: true });
      } catch (err: unknown) {
        // If Firebase Auth is offline or emulator is not running, log in locally as demo user
        console.warn("[EI Freight] Firebase offline, falling back to local demo session:", err);
        loginAsDemo({
          email: demo.email,
          displayName: demo.name,
          role: demo.role,
          status: "approved",
          companyName: demo.company,
          clientType: "clientType" in demo ? demo.clientType : undefined,
          internalRole: "internalRole" in demo ? demo.internalRole : undefined,
        });
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    // Check if entered credentials match a demo account and auto-seed if needed
    const matchedDemo = DEMO_ACCOUNTS.find(
      (d) => d.email.toLowerCase() === email.trim().toLowerCase() && d.password === password
    );

    if (matchedDemo) {
      await signInOrSeedDemo(matchedDemo);
      return;
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errStr = String(err);
      if (errStr.includes("network") || errStr.includes("offline") || errStr.includes("CONNECTION_REFUSED")) {
        setLocalError(
          t(
            "Firebase Emulator is offline. Click one of the 'Demo Accounts' above to explore in Preview Mode.",
            "تعذر الاتصال بـ Firebase. اضغط على أحد الحسابات التجريبية بالأعلى للاستكشاف في وضع المعاينة الفورية."
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
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

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl mb-3 shadow-md">
            EI
          </div>
          <h1 className="text-xl font-bold text-slate-900">EI Freight</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
            {t("Freight Quotation Platform", "منصة طلب عروض أسعار الشحن اللوجستي")}
          </p>
        </div>

        {/* ── Demo Accounts Quick-Select (One-Click Login) ── */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {t("Demo Accounts (One-Click)", "حسابات تجريبية (دخول بنقرة واحدة)")}
            </span>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {t("Ready to Test", "جاهز للتجربة")}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => signInOrSeedDemo(acc)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition text-left rtl:text-right group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                      {acc.name}
                    </span>
                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-semibold border", acc.color)}>
                      {lang === "ar" ? acc.badgeAr : acc.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{acc.email}</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 rtl:rotate-180">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {t("Or Sign In Manually", "أو تسجيل الدخول يدوياً")}
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
              {t("Email Address", "البريد الإلكتروني")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              {t("Password", "كلمة المرور")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="••••••••"
            />
          </div>

          {(authError || localError) && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-xs text-red-600">{authError || localError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={clsx(
              "w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600",
              "hover:bg-blue-700 transition active:scale-[0.98]",
              "disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
            )}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t("Signing in…", "جارٍ تسجيل الدخول…")}
              </>
            ) : (
              t("Sign In", "تسجيل الدخول")
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {t("Don't have an account?", "ليس لديك حساب بعد؟")}{" "}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            {t("Create one", "إنشاء حساب جديد")}
          </Link>
        </p>
      </div>
    </div>
  );
}

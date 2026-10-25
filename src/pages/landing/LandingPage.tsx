import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  IconShip,
  IconPlane,
  IconTruck,
  IconShield,
  IconCoins,
  IconUsers,
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconGlobe,
  IconSparkles,
  IconStar,
  IconClock,
  IconFileText,
  IconTrendingUp,
  IconBuilding,
  IconCommandCenter,
  IconAnalytics,
  IconPipeline,
} from "../../components/ui/Icons";

export function LandingPage() {
  const { t, isArabic, lang, toggleLanguage } = useLanguage();
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [activeModeTab, setActiveModeTab] = useState<"sea" | "air" | "road" | "multimodal">("sea");

  const ArrowIcon = isArabic ? IconArrowLeft : IconArrowRight;

  const handleDemoLogin = (role: "admin" | "client" | "provider") => {
    if (role === "admin") {
      loginAsDemo({
        uid: "demo-admin",
        displayName: "Super Admin",
        email: "admin@eifreight.demo",
        role: "admin",
        status: "approved",
      });
    } else if (role === "client") {
      loginAsDemo({
        uid: "demo-client",
        displayName: "Nour Hassan (Atlas)",
        email: "nour@atlashomeware.com",
        role: "client",
        status: "approved",
        companyName: "Atlas Homeware",
      });
    } else {
      loginAsDemo({
        uid: "demo-provider",
        displayName: "Ahmed Farouk (BlueWave)",
        email: "ahmed@bluewavelogistics.com",
        role: "provider",
        status: "approved",
        companyName: "BlueWave Logistics",
      });
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  EI
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  EI Freight
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {t("Smart Freight Orchestration", "المنصة الذكية لإدارة وتنسيق الشحن")}
              </p>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#modes" className="hover:text-blue-400 transition-colors">
              {t("Freight Modes", "طرق الشحن")}
            </a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">
              {t("7-Stage Cycle", "دورة الشحن")}
            </a>
            <a href="#metrics" className="hover:text-blue-400 transition-colors">
              {t("Metrics & Scale", "الأرقام والإحصائيات")}
            </a>
            <a href="#why-us" className="hover:text-blue-400 transition-colors">
              {t("Why EI Freight", "لماذا منصتنا")}
            </a>
          </div>

          {/* Action Buttons & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Lang switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
              title={t("Switch Language", "تغيير اللغة")}
            >
              <IconGlobe size={14} className="text-blue-400" />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
              >
                <span>{t("Dashboard", "لوحة التحكم")}</span>
                <ArrowIcon size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent hover:border-slate-800"
                >
                  {t("Sign In", "تسجيل الدخول")}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                >
                  <span>{t("Get Started", "إنشاء حساب")}</span>
                  <ArrowIcon size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (LANDSCAPE PREMIUM BANNER)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow Effects Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pill Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold shadow-inner shadow-blue-500/10">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <IconSparkles size={16} className="text-cyan-400" />
              <span>
                {t(
                  "Next-Gen Digital Freight & Customs Platform",
                  "الجيل الجديد من منصات إدارة الشحن والتخليص الجمركي الذكي"
                )}
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] text-white">
              {t(
                "Modern Freight Quotation & Logistics",
                "منظومة الشحن المتكاملة التي تجمع"
              )}{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                {t("Without Complexity", "أفضل الأسعار وأوثق الناقلين")}
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-slate-400 font-normal leading-relaxed max-w-3xl mx-auto">
              {t(
                "Empower your supply chain with direct vetted carrier quotes, automated RFQ lifecycle tracking, transparent markups, and full real-time operational visibility from booking to final discharge.",
                "أدر مناقصاتك وعقود الشحن البحري والجوي والبري، احصل على عروض أسعار تنافسية من ناقلين معتمدين، وتابع كل شحنة عبر 7 مراحل دقيقة بوضوح تام وبدون رسوم خفية."
              )}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <span>{t("Create Free Account", "ابدأ الآن مجاناً")}</span>
              <ArrowIcon size={18} />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-base hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2.5"
            >
              <IconCommandCenter size={18} className="text-blue-400" />
              <span>{t("Explore Live Prototype", "استكشف لوحة التحكم التجريبية")}</span>
            </Link>
          </div>

          {/* Fast Persona Quick-Logins */}
          <div className="max-w-xl mx-auto mb-16 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {t("Try Platform as Instant Demo Persona", "جرب المنصة فوراً بحساب تجريبي بنقرة واحدة:")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin("admin")}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-blue-900/40 border border-slate-700/60 hover:border-blue-500/50 text-xs font-bold text-blue-300 transition-all flex items-center justify-center gap-1.5"
              >
                <IconShield size={14} className="text-blue-400" />
                <span>{t("Super Admin", "مدير النظام")}</span>
              </button>
              <button
                onClick={() => handleDemoLogin("client")}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-emerald-900/40 border border-slate-700/60 hover:border-emerald-500/50 text-xs font-bold text-emerald-300 transition-all flex items-center justify-center gap-1.5"
              >
                <IconBuilding size={14} className="text-emerald-400" />
                <span>{t("Client (Atlas)", "عميل مستورد")}</span>
              </button>
              <button
                onClick={() => handleDemoLogin("provider")}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-900/40 border border-slate-700/60 hover:border-amber-500/50 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-1.5"
              >
                <IconShip size={14} className="text-amber-400" />
                <span>{t("Carrier (BlueWave)", "شركة شحن")}</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              LIVE INTERACTIVE DASHBOARD PREVIEW MOCKUP
          ───────────────────────────────────────────────────────────── */}
          <div className="relative mx-auto max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-blue-500/30 via-slate-800/50 to-slate-900/80 shadow-2xl shadow-blue-900/30">
            <div className="rounded-[22px] bg-slate-950 p-4 sm:p-6 md:p-8 border border-slate-800/80">
              {/* Fake Mac Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-mono text-slate-500">
                    ei-freight-command-center.live
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t("Real-Time Firestore Sync", "مزامنة لحظية مباشرة")}
                  </span>
                </div>
              </div>

              {/* Sample Live RFQ Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <IconShip size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-base">RFQ-1048</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                          {t("Sea FCL · 40HC", "بحري FCL · 40HC")}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                          {t("Quotes Received (3)", "تم استلام 3 عروض")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Atlas Homeware · {t("Furniture Components", "مكونات أثاث")} · 12,500 kg
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">{t("Route", "خط السير")}</div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{t("Shanghai Port (CN)", "ميناء شنغهاي")}</span>
                      <ArrowIcon size={14} className="text-blue-400" />
                      <span>{t("Alexandria Port (EG)", "ميناء الإسكندرية")}</span>
                    </div>
                  </div>
                </div>

                {/* 3 Live Quotes Comparison Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-blue-500/30 relative">
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                      {t("Best Match", "العرض الأفضل")}
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">BlueWave Logistics</span>
                      <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                        <IconStar size={12} fill="currentColor" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <div className="text-lg font-black text-white">$2,170 <span className="text-xs text-slate-400 font-normal">USD</span></div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                      <IconClock size={12} />
                      <span>14 {t("days transit", "يوم إبحار مباشر")}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">SilkRoute Forwarding</span>
                      <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                        <IconStar size={12} fill="currentColor" />
                        <span>4.7</span>
                      </div>
                    </div>
                    <div className="text-lg font-black text-white">$1,980 <span className="text-xs text-slate-400 font-normal">USD</span></div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <IconClock size={12} />
                      <span>18 {t("days (transit)", "يوم ترانزيت")}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">TransMENA Global</span>
                      <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                        <IconStar size={12} fill="currentColor" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <div className="text-lg font-black text-white">$2,440 <span className="text-xs text-slate-400 font-normal">USD</span></div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                      <IconClock size={12} />
                      <span>12 {t("days express", "يوم سريع")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <IconCheck size={14} className="text-emerald-400" />
                    {t("Transparent Commercial Margin", "هامش ربح تجاري معتمد وشفاف")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconShield size={14} className="text-blue-400" />
                    {t("Vetted Egyptian & Global Carriers", "ناقلون ملاحيون مرخصون ومعتمدون")}
                  </span>
                </div>
                <Link
                  to="/dashboard?tab=requests"
                  className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>{t("Open full detail view", "افتح تفاصيل الطلب بالكامل")}</span>
                  <ArrowIcon size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. METRICS & SCALE SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="metrics" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">
              {t("Scale & Performance", "الأرقام وحجم العمليات")}
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {t("Trusted Platform Powering Regional Trade", "أرقام تعكس ثقة مجتمع التجارة والشحن")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconShip size={24} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                +12,450
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("Total Shipments Delivered", "شحنة تم تسليمها بنجاح")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconClock size={24} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">
                99.2%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("On-Time Milestone Execution", "دقة في مواعيد الوصول والتسليم")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconUsers size={24} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                +85
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("Vetted Shipping Lines & Carriers", "شركة شحن ووكيل ملاحي معتمد")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconCoins size={24} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-1">
                $2.4M+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("Freight Cost Savings Generated", "وفر مالي محقق لصالح عملائنا")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FREIGHT MODES SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="modes" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">
              {t("Multimodal Capabilities", "خيارات ووسائل النقل")}
            </h2>
            <p className="text-3xl sm:text-5xl font-black text-white">
              {t("Tailored for Every Cargo Size & Destination", "حلول شحن متكاملة تناسب كل طبيعة بضاعة")}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: "sea", labelAr: "الشحن البحري (FCL / LCL)", labelEn: "Ocean Freight", icon: IconShip },
              { id: "air", labelAr: "الشحن الجوي السريع", labelEn: "Air Cargo", icon: IconPlane },
              { id: "road", labelAr: "النقل البري (FTL / LTL)", labelEn: "Road Freight", icon: IconTruck },
              { id: "multimodal", labelAr: "متعدد الوسائط", labelEn: "Multimodal", icon: IconGlobe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeModeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveModeTab(tab.id as any)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2.5 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                      : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Active Mode Card Details */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/70 border border-slate-800 p-6 sm:p-10 backdrop-blur-xl">
            {activeModeTab === "sea" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold mb-4">
                    <IconShip size={14} />
                    <span>{t("Ocean Freight Leader", "الخيار الأكثر توفيراً للكميات الكبيرة")}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                    {t("Containerized & Breakbulk Shipping", "حاويات كاملة 20ft / 40HC وشحن مجزأ")}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {t(
                      "Direct line connections with major carriers (Hapag-Lloyd, Maersk, MSC, COSCO) through Alexandria, Port Said, Sokhna, and Dekheila to all major Asian and European hubs.",
                      "ربط مباشر مع كبرى الخطوط الملاحية العالمية عبر موانئ الإسكندرية، بورسعيد، السخنة، والدخيلة إلى موانئ الصين، ألمانيا، وتركيا."
                    )}
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <IconCheck size={14} className="text-emerald-400" />
                      <span>{t("Full Container Load (FCL) & Less than Container (LCL)", "شحن حاويات كاملة وشحن جزئي مجزأ")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={14} className="text-emerald-400" />
                      <span>{t("Verified Free-Time detention & demurrage periods", "أيام سماح وفترة مجانية للتفريغ بالميناء")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={14} className="text-emerald-400" />
                      <span>{t("Integrated Port Dues & Terminal Handling Charges", "تفصيل دقيق لمصروفات النولون والتفريغ الجمركي")}</span>
                    </li>
                  </ul>
                  <Link
                    to="/shipments/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    <span>{t("Request Ocean Freight Quote", "طلب تسعير شحن بحري")}</span>
                    <ArrowIcon size={14} />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-xs font-bold text-slate-400 mb-3">{t("Popular Routes & Transit", "أبرز الخطوط وأوقات الإبحار:")}</div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Shanghai (CN) ➔ Alexandria (EG)</span>
                        <p className="text-slate-400 text-[11px]">Direct / Suez Canal routing</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-bold">14-16 {t("Days", "يوم")}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Ningbo (CN) ➔ Sokhna (EG)</span>
                        <p className="text-slate-400 text-[11px]">Direct express service</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-bold">12-14 {t("Days", "يوم")}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Hamburg (DE) ➔ Port Said (EG)</span>
                        <p className="text-slate-400 text-[11px]">North Europe Med loop</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-bold">8-10 {t("Days", "أيام")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModeTab === "air" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold mb-4">
                    <IconPlane size={14} />
                    <span>{t("Express Cargo Speed", "السرعة القصوى للشحنات المستعجلة")}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                    {t("Airport-to-Airport & Door Delivery", "شحن جوي للشحنات الحساسة والقيمة")}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {t(
                      "Rapid air freight solutions connecting Cairo International Airport (CAI) with Dubai (DXB), Frankfurt (FRA), and Istanbul (IST) for temperature-controlled pharma and urgent parts.",
                      "شحن جوي سريع يربط مطار القاهرة الدولي مع مطارات دبي، فرانكفورت، وإسطنبول للأدوية والعينات والمعدات المستعجلة."
                    )}
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <IconCheck size={14} className="text-emerald-400" />
                      <span>{t("Express delivery within 24 to 72 hours", "وصول سريع خلال 24 إلى 72 ساعة")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={14} className="text-emerald-400" />
                      <span>{t("Pharma & temperature-controlled handling", "نقل مبرد وتخزين مخصص للمنتجات الطبية")}</span>
                    </li>
                  </ul>
                  <Link
                    to="/shipments/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                  >
                    <span>{t("Request Air Cargo Quote", "طلب تسعير شحن جوي")}</span>
                    <ArrowIcon size={14} />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-xs font-bold text-slate-400 mb-3">{t("Air Hubs & Flight Times", "أبرز المسارات الجوية:")}</div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Frankfurt (FRA) ➔ Cairo (CAI)</span>
                        <p className="text-slate-400 text-[11px]">Direct Cargo flight</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">1-2 {t("Days", "يوم")}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Dubai (DXB) ➔ Cairo (CAI)</span>
                        <p className="text-slate-400 text-[11px]">Daily flights</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">24-48 {t("Hours", "ساعة")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModeTab === "road" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4">
                    <IconTruck size={14} />
                    <span>{t("Cross-Border Regional Network", "نقل بري دولي بين مصر والخليج")}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                    {t("FTL & LTL Land Freight Transport", "شاحنات كاملة وجزئية مبردة وجافة")}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {t(
                      "Fleet-managed transport connecting Egyptian logistics zones with Saudi Arabia (Riyadh, Jeddah) and the UAE (Dubai, Abu Dhabi) via land and Ro-Ro services.",
                      "أسطول نقل معتمد يربط المناطق الصناعية بمصر مع المملكة العربية السعودية ودولة الإمارات عبر سفن الرورو والعبور البري السريع."
                    )}
                  </p>
                  <Link
                    to="/shipments/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <span>{t("Request Road Freight Quote", "طلب تسعير نقل بري")}</span>
                    <ArrowIcon size={14} />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-xs font-bold text-slate-400 mb-3">{t("Land Corridors", "الممرات البرية الرئيسية:")}</div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Cairo (EG) ➔ Riyadh (SA)</span>
                        <p className="text-slate-400 text-[11px]">Ro-Ro & Highway</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">4-5 {t("Days", "أيام")}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Dubai (AE) ➔ Riyadh (SA)</span>
                        <p className="text-slate-400 text-[11px]">Direct express truck</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">2-3 {t("Days", "أيام")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModeTab === "multimodal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold mb-4">
                    <IconGlobe size={14} />
                    <span>{t("End-to-End Multimodal", "نقل متعدد الوسائط ببوليصة موحدة")}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                    {t("Sea + Road + Rail Integrated Solutions", "حلول مدمجة من باب المصنع إلى المستودع")}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {t(
                      "Seamless cargo orchestration combining sea freight from international origins with land transport and bonded customs warehousing in Egypt and the Middle East.",
                      "إدارة متكاملة تبدأ من استلام البضائع من المصانع بالصين أو أوروبا، نقلها بحرياً، ثم تخليصها جمركياً ونقلها برياً إلى مستودع العميل النهائي."
                    )}
                  </p>
                  <Link
                    to="/shipments/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    <span>{t("Request Multimodal Quote", "طلب تسعير متعدد الوسائط")}</span>
                    <ArrowIcon size={14} />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-xs font-bold text-slate-400 mb-3">{t("Full Chain Orchestration", "سلسلة الإمداد الكاملة:")}</div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">Shenzhen (CN) ➔ Giza (EG)</span>
                        <p className="text-slate-400 text-[11px]">Factory pickup + Ocean + Customs + Trucking</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold">18-20 {t("Days", "يوم")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. THE 7-STAGE LIFECYCLE WORKFLOW PIPELINE
      ───────────────────────────────────────────────────────────── */}
      <section id="workflow" className="py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">
              {t("Transparent Workflow", "دورة حياة الشحنة")}
            </h2>
            <p className="text-3xl sm:text-5xl font-black text-white">
              {t("7 Precise Stages for Complete Peace of Mind", "7 مراحل شفافة من تقديم الطلب حتى التسليم")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                titleAr: "طلب التسعير (RFQ)",
                titleEn: "RFQ Request",
                descAr: "يقوم العميل بتحديد طبيعة البضاعة، الوزن، الحاوية، وموانئ الشحن والتفريغ بسهولة.",
                descEn: "Client specifies cargo details, container type, origin, and destination.",
                icon: IconFileText,
                badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
              },
              {
                step: "02",
                titleAr: "المطابقة والمناقصة",
                titleEn: "Carrier Matching",
                descAr: "إرسال المناقصة تلقائياً للناقلين المعتمدين والمؤهلين لهذا المسار.",
                descEn: "System matches and dispatches RFQ to vetted carriers with verified fleet.",
                icon: IconUsers,
                badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
              },
              {
                step: "03",
                titleAr: "استلام العروض",
                titleEn: "Quotes Received",
                descAr: "يتنافس الناقلون بتقديم عروض أسعار دقيقة تشمل النولون ومصروفات الموانئ والترانزيت.",
                descEn: "Carriers submit detailed bids with freight rates, transit days, and validity.",
                icon: IconCoins,
                badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
              },
              {
                step: "04",
                titleAr: "المراجعة التجارية",
                titleEn: "Commercial Review",
                descAr: "فحص وتدقيق العروض وتحديد هامش الربح وإرسال أفضل 1-3 عروض معتمدة للعميل.",
                descEn: "Commercial team vets bids, validates margin, and presents best vetted offers.",
                icon: IconShield,
                badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
              },
              {
                step: "05",
                titleAr: "الترسية والاعتماد",
                titleEn: "Quote Award",
                descAr: "يختار العميل العرض الأنسب ويبدأ التعاقد والحجز المباشر فوراً.",
                descEn: "Client selects and awards their preferred quotation with a single click.",
                icon: IconCheck,
                badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
              },
              {
                step: "06",
                titleAr: "التنفيذ والتتبع",
                titleEn: "Active Execution",
                descAr: "إصدار بوالص الشحن، متابعة خط السير، وإتمام التخليص الجمركي بالميناء.",
                descEn: "Bill of Lading issued, live milestone tracking, and customs clearance.",
                icon: IconTrendingUp,
                badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
              },
              {
                step: "07",
                titleAr: "التسليم والأرشفة",
                titleEn: "Completed History",
                descAr: "تسليم البضاعة وإصدار الفواتير الرسمية وتقييم أداء شركة الشحن.",
                descEn: "Final cargo discharge, electronic invoicing, and performance rating.",
                icon: IconStar,
                badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
              },
              {
                step: "🔥",
                titleAr: "جولة الأخذ النهائي",
                titleEn: "Final Call Round",
                descAr: "ميزة حصرية لفتح جولة تخفيض أسعار تنافسية لمدة محددة قبل الترسية النهائية.",
                descEn: "Exclusive countdown round for carriers to submit their best discounted rates.",
                icon: IconSparkles,
                badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${s.badgeColor}`}>
                        {s.step}
                      </span>
                      <Icon size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h4 className="text-base font-extrabold text-white mb-2">
                      {isArabic ? s.titleAr : s.titleEn}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isArabic ? s.descAr : s.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. WHY CHOOSE EI FREIGHT
      ───────────────────────────────────────────────────────────── */}
      <section id="why-us" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">
              {t("Unmatched Value", "لماذا منصة EI Freight؟")}
            </h2>
            <p className="text-3xl sm:text-5xl font-black text-white">
              {t("Built for Shippers & Forwarders Seeking Reliability", "صممت لتمنحك الأمان والشفافية وتوفير التكاليف")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <IconShield size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("100% Vetted Carrier Network", "شركات شحن معتمدة فقط (KYC)")}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t(
                  "Every forwarder, carrier, and customs broker is rigorously audited with commercial registrations, fleet licenses, and financial checks before bidding.",
                  "تدقيق وفحص شامل للسجلات التجارية، التراخيص الملاحية، والبطاقات الضريبية لجميع الناقلين لضمان سلامة وأمان بضائعك."
                )}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <IconCoins size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("Transparent All-In Pricing", "تسعير شامل بدون أي مصاريف خفية")}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t(
                  "No surprise invoices. Freight rates clearly distinguish origin charges, sea freight, terminal handling, and port customs dues upfront.",
                  "عرض مفصل للنولون ومصاريف الشحن والتفريغ ورسوم الموانئ بشكل مسبق يمنع أي مفاجآت في الفاتورة النهائية."
                )}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-emerald-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <IconAnalytics size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("Executive Analytics & Profitability", "لوحة إحصائيات متقدمة للتحكم الكامل")}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t(
                  "Track spend, transit trends, top carrier performances, and profit margins in real-time with comprehensive charts and exportable reports.",
                  "تقارير ورسوم بيانية ترصد حجم الشحنات الشهرية، أكثر المسارات استخداماً، وأداء شركات الشحن لتسهيل اتخاذ القرارات."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. BOTTOM CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/80 border border-blue-500/40 shadow-2xl shadow-blue-950/50 text-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                {t(
                  "Ready to Transform Your Freight Operations?",
                  "جاهز لتطوير وإدارة عمليات الشحن الخاصة بشركتك؟"
                )}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                {t(
                  "Join hundreds of importers, exporters, and certified freight forwarders streamlining their trade logistics on EI Freight today.",
                  "انضم الآن إلى شبكة المستوردين والمصدرين وشركات الشحن المعتمدة وابدأ تجربة إدارة الشحن الأكثر احترافية."
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t("Create Account Now", "أنشئ حسابك الآن")}</span>
                  <ArrowIcon size={16} />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
                >
                  {t("Sign In to Existing Account", "تسجيل الدخول إلى حسابك")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              EI
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">EI Freight Platform</span>
              <p className="text-[11px] text-slate-400">
                © {new Date().getFullYear()} {t("All rights reserved.", "جميع الحقوق محفوظة.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <a href="#modes" className="hover:text-blue-400 transition-colors">
              {t("Freight Modes", "طرق الشحن")}
            </a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">
              {t("Workflow Pipeline", "دورة الشحن")}
            </a>
            <Link to="/login" className="hover:text-blue-400 transition-colors">
              {t("Sign In", "الدخول")}
            </Link>
            <Link to="/signup" className="hover:text-blue-400 transition-colors">
              {t("Register", "التسجيل")}
            </Link>
            <Link to="/dashboard" className="text-blue-400 font-bold hover:underline">
              {t("Live Demo", "لوحة التحكم")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;

/**
 * @file src/pages/landing/LandingPage.tsx
 * @description Ultra-Premium Landscape Landing Page for EI Freight featuring:
 *              - Interactive 3D Logistics Globe with orbiting supersonic airplanes & cruising ships
 *              - Live Telemetry Operations Ticker
 *              - Interactive Freight Benchmark Estimator (Origin/Destination/Container pricing calculator)
 *              - Authentic RFQ-1048 Live Quotation Comparison
 *              - 4 Multimodal Transport Modes showcase (Sea, Air, Road, Multimodal)
 *              - 7-Stage Digital Logistics Workflow Pipeline
 *              - Global Verified Carrier Network (SilkRoute, BlueWave, Maersk, Hapag-Lloyd, etc.)
 *              - 4 One-Click Demo Personas (Admin, Client, SilkRoute, BlueWave)
 *              - Bilingual Cairo font typography (Arabic RTL / English LTR)
 */

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
  IconBuilding,
  IconCommandCenter,
} from "../../components/ui/Icons";
import { InteractiveLogisticsGlobe } from "./components/InteractiveLogisticsGlobe";
import { FreightEstimatorWidget } from "./components/FreightEstimatorWidget";
import { LiveLogisticsTicker } from "./components/LiveLogisticsTicker";

export function LandingPage() {
  const { t, isArabic, lang, toggleLanguage } = useLanguage();
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [activeModeTab, setActiveModeTab] = useState<"sea" | "air" | "road" | "multimodal">("sea");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const ArrowIcon = isArabic ? IconArrowLeft : IconArrowRight;

  const handleDemoLogin = (role: "admin" | "client" | "silkroute" | "bluewave") => {
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
    } else if (role === "silkroute") {
      loginAsDemo({
        uid: "demo-silkroute",
        displayName: "Tarek Mansour",
        email: "tarek@silkrouteforwarding.com",
        role: "provider",
        status: "approved",
        companyName: "SilkRoute Forwarding",
      });
    } else {
      loginAsDemo({
        uid: "demo-bluewave",
        displayName: "Ahmed Farouk",
        email: "ahmed@bluewavelogistics.com",
        role: "provider",
        status: "approved",
        companyName: "BlueWave Logistics",
      });
    }
    navigate("/dashboard");
  };

  const faqs = [
    {
      qAr: "كيف تضمن EI Freight شفافية الأسعار وعدم وجود رسوم خفية؟",
      qEn: "How does EI Freight guarantee transparent pricing without hidden fees?",
      aAr: "يتم تفصيل عرض السعر بكل دقة ليشمل نولون الشحن الأساسي، رسوم محطة المغادرة والوصول (THC)، وتكاليف التخليص الجمركي بوضوح، مع تحديد فترة السماح (Free Time) بالميناء قبل اعتماد الحجز.",
      aEn: "Every quote itemizes ocean/air freight, origin & destination THC, and customs clearance with guaranteed container free-time before booking confirmation.",
    },
    {
      qAr: "هل شركات الشحن والناقلين في المنصة معتمدون ومرخصون؟",
      qEn: "Are service providers and shipping lines vetted and licensed?",
      aAr: "نعم، يخضع جميع الناقلين لتدقيق صارم في سجلاتهم التجارية، تراخيص النقل الدولي، وكفاءة الأسطول، مع تقييم أداء دوري لكل رحلة.",
      aEn: "Yes, every freight carrier undergoes strict commercial verification, international forwarding licenses review, and continuous shipment milestone rating.",
    },
    {
      qAr: "ما هو الوقت المتوقع لاستلام أول عروض أسعار رسمية؟",
      qEn: "What is the expected turnaround time for official quotes?",
      aAr: "في معظم مسارات الشحن البحري والجوي النشطة، يتلقى العميل ما بين 2 إلى 4 عروض تجارية مؤكدة خلال أقل من 4 ساعات عمل.",
      aEn: "For active global corridors, clients receive 2 to 4 competitive carrier bids in less than 4 business hours.",
    },
    {
      qAr: "هل تقدم المنصة خدمات التخليص الجمركي في الموانئ المصرية والإقليمية؟",
      qEn: "Does the platform handle customs clearance in regional ports?",
      aAr: "نعم، تتكامل المنصة مباشرة مع مخلصين جمركيين معتمدين بموانئ الإسكندرية، بورسعيد، السخنة، ومطار القاهرة لإنجاز التخليص المسبق والإفراج الجمركي السريع.",
      aEn: "Yes, fully integrated with accredited customs brokers across Alexandria, Port Said, Sokhna, and Cairo International Airport.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-['Cairo',sans-serif] antialiased overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
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

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs sm:text-sm font-bold text-slate-300">
            <a href="#globe" className="hover:text-blue-400 transition-colors">
              {t("Global Radar", "الرادار العالمي")}
            </a>
            <a href="#calculator" className="hover:text-blue-400 transition-colors">
              {t("Freight Calculator", "حاسبة الشحن")}
            </a>
            <a href="#modes" className="hover:text-blue-400 transition-colors">
              {t("Transport Modes", "وسائل النقل")}
            </a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">
              {t("Workflow", "دورة العمل")}
            </a>
            <a href="#partners" className="hover:text-blue-400 transition-colors">
              {t("Partners", "الشركاء")}
            </a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">
              {t("FAQ", "الأسئلة الشائعة")}
            </a>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              title={t("Switch to Arabic", "Switch to English")}
            >
              <IconGlobe size={15} className="text-blue-400" />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>{t("Dashboard", "لوحة التحكم")}</span>
                <ArrowIcon size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800"
                >
                  {t("Sign In", "تسجيل الدخول")}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
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
          2. HERO SECTION WITH 3D INTERACTIVE LOGISTICS GLOBE
      ───────────────────────────────────────────────────────────── */}
      <section id="globe" className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        {/* Ambient Cosmic Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Subtle Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill Announcement */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold shadow-inner shadow-blue-500/10">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
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

            <p className="mt-6 text-sm sm:text-lg text-slate-300/90 font-normal leading-relaxed max-w-3xl mx-auto">
              {t(
                "Empower your supply chain with direct vetted carrier quotes, automated RFQ lifecycle tracking, transparent markups, and full real-time operational visibility from booking to final discharge.",
                "أدر مناقصاتك وعقود الشحن البحري والجوي والبري، احصل على عروض أسعار تنافسية من ناقلين معتمدين، وتابع كل شحنة عبر 7 مراحل دقيقة بوضوح تام وبدون رسوم خفية."
              )}
            </p>
          </div>

          {/* Main Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>{t("Create Free Account", "ابدأ الآن مجاناً 🚀")}</span>
              <ArrowIcon size={18} />
            </Link>

            <a
              href="#calculator"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm sm:text-base hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <IconSparkles size={18} className="text-cyan-400" />
              <span>{t("Estimate Freight Cost", "احسب تكلفة شحنتك فوراً ⚡")}</span>
            </a>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-slate-300 font-bold text-sm sm:text-base hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2.5"
            >
              <IconCommandCenter size={18} className="text-blue-400" />
              <span>{t("Explore Live Prototype", "استكشف لوحة التحكم ⌂")}</span>
            </Link>
          </div>

          {/* Fast Persona Quick-Logins (Admin, Client, SilkRoute, BlueWave) */}
          <div className="max-w-2xl mx-auto mb-10 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {t("Experience the Platform Directly as Demo Persona:", "جرّب المنصة مباشرة كـ Demo بنقرة واحدة:")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-blue-900/40 border border-slate-700/60 hover:border-blue-500/50 text-xs font-bold text-blue-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <IconShield size={14} className="text-blue-400" />
                <span>{t("Super Admin", "مدير النظام")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("client")}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-emerald-900/40 border border-slate-700/60 hover:border-emerald-500/50 text-xs font-bold text-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <IconBuilding size={14} className="text-emerald-400" />
                <span>{t("Client (Atlas)", "عميل مستورد")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("silkroute")}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-900/40 border border-slate-700/60 hover:border-cyan-500/50 text-xs font-bold text-cyan-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <IconShip size={14} className="text-cyan-400" />
                <span>{t("Carrier (SilkRoute)", "ناقل (SilkRoute)")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("bluewave")}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-900/40 border border-slate-700/60 hover:border-amber-500/50 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <IconShip size={14} className="text-amber-400" />
                <span>{t("Carrier (BlueWave)", "ناقل (BlueWave)")}</span>
              </button>
            </div>
          </div>

          {/* ── THE 3D INTERACTIVE LOGISTICS GLOBE ── */}
          <div className="relative mx-auto max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-blue-500/30 via-slate-800/50 to-slate-900/80 shadow-2xl shadow-blue-900/40">
            <div className="rounded-[22px] bg-slate-950 p-4 sm:p-8 border border-slate-800/80">
              <InteractiveLogisticsGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. LIVE LOGISTICS OPERATIONS SCROLLING TICKER
      ───────────────────────────────────────────────────────────── */}
      <LiveLogisticsTicker />

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE FREIGHT ESTIMATOR CALCULATOR
      ───────────────────────────────────────────────────────────── */}
      <section id="calculator" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 mb-2">
              {t("Commercial Benchmark Simulator", "حاسبة الأسعار اللحظية")}
            </h2>
            <p className="text-3xl sm:text-5xl font-black text-white">
              {t("Calculate Your Shipping Cost in Real Time", "احسب تكلفة شحنتك مباشرة وفقاً لأسعار السوق")}
            </p>
          </div>

          <FreightEstimatorWidget />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SCALE & KEY OPERATIONAL METRICS
      ───────────────────────────────────────────────────────────── */}
      <section id="metrics" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative">
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
              <div className="text-3xl sm:text-4xl font-black text-white mb-1 font-mono">
                +18,400
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("Total Containers Delivered", "حاوية وبضائع تم شحنها وتفريغها")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconClock size={24} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1 font-mono">
                99.4%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("On-Time Milestone Execution", "دقة في مواعيد الإبحار والوصول والتسليم")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconUsers size={24} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-1 font-mono">
                +85
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("Vetted Shipping Lines & Carriers", "خط ملاحي وناقل شحن جوي معتمد")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconCoins size={24} />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-1 font-mono">
                $4.2M+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">
                {t("Freight Cost Savings Generated", "وفورات نولون محققة لصالح عملائنا")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LIVE PROTOTYPE RFQ-1048 COMPARISON SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">
              {t("Commercial Quotation Transparency", "شفافية المناقصات والعروض")}
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {t("Real-Time Multi-Carrier Bidding (RFQ-1048)", "مقارنة حية لأسعار الشحن بدون رسوم خفية")}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <IconShip size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white text-lg">RFQ-1048</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                      {t("Sea FCL · 40HC", "بحري FCL · حاوية 40HC")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {t("3 Active Quotes", "تم استلام ٣ عروض رسمية")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Atlas Homeware · {t("Furniture Components · 8,400 kg", "مكونات أثاث · ٨,٤٠٠ كجم")}
                  </p>
                </div>
              </div>

              <div className="text-right rtl:text-left">
                <div className="text-xs text-slate-400">{t("Corridor", "المسار الملاحي")}</div>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{t("Shanghai Port (CN)", "ميناء شنغهاي")}</span>
                  <ArrowIcon size={14} className="text-blue-400" />
                  <span>{t("Alexandria Port (EG)", "ميناء الإسكندرية")}</span>
                </div>
              </div>
            </div>

            {/* 3 Real Prototype Bids */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              {/* BlueWave */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/40 relative group hover:border-blue-400 transition">
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
                  {t("Recommended", "العرض الأسرع")}
                </span>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">BlueWave Logistics</span>
                  <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                    <IconStar size={12} fill="currentColor" />
                    <span>4.9</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  $2,170 <span className="text-xs text-slate-400 font-normal">USD</span>
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <IconClock size={13} />
                  <span>14 {t("days direct transit", "يوم إبحار مباشر")}</span>
                </div>
              </div>

              {/* SilkRoute */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 relative group hover:border-emerald-400 transition">
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                  {t("Best Price", "السعر الأوفر")}
                </span>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">SilkRoute Forwarding</span>
                  <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                    <IconStar size={12} fill="currentColor" />
                    <span>4.7</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  $1,980 <span className="text-xs text-slate-400 font-normal">USD</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                  <IconClock size={13} />
                  <span>18 {t("days via Damietta", "يوم عبر دمياط")}</span>
                </div>
              </div>

              {/* TransMENA */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">TransMENA Global</span>
                  <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                    <IconStar size={12} fill="currentColor" />
                    <span>4.8</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  $2,440 <span className="text-xs text-slate-400 font-normal">USD</span>
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <IconClock size={13} />
                  <span>12 {t("days express loop", "يوم خط سريع")}</span>
                </div>
              </div>
            </div>

            {/* Bottom Note & Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <IconCheck size={14} className="text-emerald-400" />
                  {t("Transparent Commercial Margins", "هوامش تجارية واضحة ومعتمدة")}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconShield size={14} className="text-blue-400" />
                  {t("Verified Egyptian & Global Carriers", "ناقلون ملاحيون مرخصون")}
                </span>
              </div>

              <Link
                to="/dashboard?tab=requests&rfqId=RFQ-1048"
                className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>{t("Open Full RFQ Workspace", "افتح تفاصيل الطلب بالكامل")}</span>
                <ArrowIcon size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FREIGHT MODES SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="modes" className="py-24 bg-slate-900/30 border-t border-slate-800/80 relative">
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
                  type="button"
                  onClick={() => setActiveModeTab(tab.id as any)}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer ${
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
                      "Direct line connections with major carriers through Alexandria, Port Said, Sokhna, and Dekheila to all major Asian and European hubs.",
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
                  </ul>
                  <Link
                    to="/signup"
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
                      "Rapid air freight solutions connecting Cairo International Airport (CAI) with Dubai (DXB), Frankfurt (FRA), and Istanbul (IST).",
                      "شحن جوي سريع يربط مطار القاهرة الدولي مع مطارات دبي، فرانكفورت، وإسطنبول للأدوية والعينات والمعدات المستعجلة."
                    )}
                  </p>
                  <Link
                    to="/signup"
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
                      "Fleet-managed transport connecting Egyptian logistics zones with Saudi Arabia and UAE via land and Ro-Ro services.",
                      "أسطول نقل معتمد يربط المناطق الصناعية بمصر مع المملكة العربية السعودية ودولة الإمارات عبر سفن الرورو والعبور البري السريع."
                    )}
                  </p>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <span>{t("Request Road Freight Quote", "طلب تسعير نقل بري")}</span>
                    <ArrowIcon size={14} />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-xs font-bold text-slate-400 mb-3">{t("Land Corridors", "الممرات البرية الرئيسية:")}</div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white">Cairo (EG) ➔ Riyadh (SA)</span>
                      <p className="text-slate-400 text-[11px]">Ro-Ro & Highway</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">4-5 {t("Days", "أيام")}</span>
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
                      "Seamless cargo orchestration combining sea freight with land transport and bonded customs warehousing.",
                      "إدارة متكاملة تبدأ من استلام البضائع من المصانع بالصين، نقلها بحرياً، ثم تخليصها جمركياً ونقلها برياً لمستودع العميل."
                    )}
                  </p>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    <span>{t("Request Multimodal Quote", "طلب تسعير متعدد الوسائط")}</span>
                    <ArrowIcon size={14} />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-xs font-bold text-slate-400 mb-3">{t("Full Chain Orchestration", "سلسلة الإمداد الكاملة:")}</div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white">Shenzhen (CN) ➔ 10th of Ramadan (EG)</span>
                      <p className="text-slate-400 text-[11px]">Factory + Ocean + Customs + Trucking</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold">18-20 {t("Days", "يوم")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. THE 7-STAGE LIFECYCLE WORKFLOW PIPELINE
      ───────────────────────────────────────────────────────────── */}
      <section id="workflow" className="py-24 relative">
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
                descAr: "يقوم العميل بتحديد طبيعة البضاعة، الوزن، الحاوية، وموانئ الشحن والتفريغ بسهولة.",
                badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
              },
              {
                step: "02",
                titleAr: "المطابقة والمناقصة",
                descAr: "إرسال المناقصة تلقائياً للناقلين المعتمدين والمؤهلين لهذا المسار الملاحي.",
                badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
              },
              {
                step: "03",
                titleAr: "استلام وتدقيق العروض",
                descAr: "يقدم الناقلون أسعارهم الرسمية، وتراجع العمليات الهوامش لضمان مطابقة الشروط.",
                badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
              },
              {
                step: "04",
                titleAr: "اختيار العميل للعرض",
                descAr: "يختار العميل العرض الأنسب من حيث السعر، الأيام، وفترة السماح بنقرة زر.",
                badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
              },
              {
                step: "05",
                titleAr: "حجز الحاوية والإبحار",
                descAr: "إصدار إذن الحجز الملاحي وتحميل البضاعة وتتبع حركة السفينة أو الطائرة.",
                badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
              },
              {
                step: "06",
                titleAr: "التخليص الجمركي",
                descAr: "فحص المستندات والإفراج الجمركي المسبق عبر المخلصين المعتمدين بالميناء.",
                badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
              },
              {
                step: "07",
                titleAr: "التسليم والتسوية",
                descAr: "توصيل الحاوية لمستودع العميل وإغلاق الدورة بفاتورة نهائية موحدة.",
                badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition relative"
              >
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border mb-4 ${st.badgeColor}`}
                >
                  {t("Stage", "المرحلة")} {st.step}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{st.titleAr}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.descAr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. GLOBAL PARTNERS & CARRIER ECOSYSTEM
      ───────────────────────────────────────────────────────────── */}
      <section id="partners" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
            {t("Connected with Global Shipping Lines & Carriers", "ربط مباشر مع كبرى الخطوط الملاحية وشركات الشحن الدولية")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-75">
            {[
              "SilkRoute Forwarding",
              "BlueWave Logistics",
              "Maersk Line",
              "Hapag-Lloyd",
              "CMA CGM",
              "COSCO Shipping",
              "Emirates SkyCargo",
              "EgyptAir Cargo",
            ].map((carrier) => (
              <span
                key={carrier}
                className="px-5 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm font-bold text-slate-300 font-mono tracking-wide"
              >
                {carrier}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">
              {t("Got Questions?", "الأسئلة الأكثر شيوعاً")}
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {t("Everything You Need to Know", "إجابات واضحة لكل ما يخص منصة EI Freight")}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-blue-400 transition cursor-pointer"
                  >
                    <span>{isArabic ? faq.qAr : faq.qEn}</span>
                    <span className="text-xl text-blue-400">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {isArabic ? faq.aAr : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. FINAL CONVERSION BANNER & FOOTER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-950 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-6">
            <span>●</span>
            <span>{t("Instant Onboarding · Zero Setup Fee", "تسجيل فوري مجاني وبدون أي رسوم اشتراك مسبقة")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            {t(
              "Ready to Streamline Your Global Cargo?",
              "جاهز لإطلاق مناقصات شحنك بأفضل الأسعار وأعلى سرعة؟"
            )}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            {t(
              "Join hundreds of forwarders, traders, and manufacturers who trust EI Freight for reliable sea, air, and land freight quotations.",
              "انضم لمئات المستوردين، المصدرين، ووكلاء الشحن الذين يعتمدون على EI Freight في الحصول على أفضل عروض النولون الملاحي والتخليص الجمركي الموثوق."
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>{t("Get Started for Free 🚀", "ابدأ الآن مجاناً 🚀")}</span>
              <ArrowIcon size={18} />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm sm:text-base transition-all"
            >
              <span>{t("Sign In to Existing Account", "تسجيل الدخول إلى حسابك")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400">
              EI
            </div>
            <span>© 2026 EI Freight Platform. {t("All rights reserved.", "جميع الحقوق محفوظة.")}</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#globe" className="hover:text-slate-300 transition">
              {t("Global Radar", "الرادار الحي")}
            </a>
            <a href="#calculator" className="hover:text-slate-300 transition">
              {t("Freight Calculator", "حاسبة النولون")}
            </a>
            <Link to="/login" className="hover:text-slate-300 transition">
              {t("Platform Login", "بوابة الدخول")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

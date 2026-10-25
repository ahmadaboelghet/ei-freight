/**
 * @file src/components/layout/AppLayout.tsx
 * @description Dynamic Role-Aware & Bilingual Application Shell Layout with:
 *              - Full Arabic (RTL) & English (LTR) language switching
 *              - Role-specific sidebar navigation (Client, Provider, Operations, Admin)
 *              - Exact 8 Super Admin tabs matching https://ei-freight-prototype.pages.dev/
 *              - Instant Demo Role Switcher
 */

import React, { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { DEMO_ACCOUNTS } from "../../pages/auth/LoginPage";
import {
  IconCommandCenter,
  IconAnalytics,
  IconPipeline,
  IconRegistrations,
  IconProviders,
  IconClients,
  IconLocations,
  IconDemo,
  IconPlus,
  IconBell,
  IconGlobe,
  IconLogout,
  IconChevronDown,
} from "../ui/Icons";
import { clsx } from "clsx";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, loginAsDemo } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const role = user?.role;
  const internalRole = user?.internalRole;
  const currentTab = searchParams.get("tab") || "dashboard";

  // ── 1. Dynamic Nav Items Based on Role (Bilingual) ──
  const getNavItems = () => {
    if (role === "admin" || internalRole === "super_admin") {
      return [
        { id: "dashboard", label: t("Command center", "مركز التحكم"), path: "/dashboard?tab=dashboard", icon: IconCommandCenter },
        { id: "analytics", label: t("Analytics", "الإحصائيات"), path: "/dashboard?tab=analytics", icon: IconAnalytics },
        { id: "requests", label: t("RFQ pipeline", "مسار طلبات الأسعار"), path: "/dashboard?tab=requests", icon: IconPipeline },
        { id: "registrations", label: t("Registration requests", "طلبات التسجيل"), path: "/dashboard?tab=registrations", icon: IconRegistrations },
        { id: "providers", label: t("Service Providers", "مقدمو الخدمات"), path: "/dashboard?tab=providers", icon: IconProviders },
        { id: "clients", label: t("Clients", "العملاء"), path: "/dashboard?tab=clients", icon: IconClients },
        { id: "locations", label: t("Locations & countries", "المواقع والدول"), path: "/dashboard?tab=locations", icon: IconLocations },
        { id: "demo", label: t("Demo controls", "أدوات العرض"), path: "/dashboard?tab=demo", icon: IconDemo },
      ];
    }

    if (role === "staff" || internalRole === "operations") {
      return [
        { id: "dashboard", label: t("Operations Desk", "مكتب العمليات"), path: "/dashboard", icon: "⌂" },
        { id: "requests", label: t("RFQ Pipeline", "خط سير المناقصات"), path: "/dashboard?tab=requests", icon: "▤" },
        { id: "providers", label: t("Providers", "مزودي الخدمة"), path: "/dashboard?tab=providers", icon: "◉" },
        { id: "clients", label: t("Clients", "العملاء"), path: "/dashboard?tab=clients", icon: "♙" },
      ];
    }

    if (role === "provider") {
      return [
        { id: "dashboard", label: t("Opportunity Desk", "لوحة الفرص"), path: "/dashboard", icon: "⌂" },
        { id: "requests", label: t("Matched RFQs", "الطلبات المطابقة"), path: "/dashboard", icon: "▤" },
        { id: "quotes", label: t("My Quotations", "عروضي المقدمة"), path: "/dashboard", icon: "◇" },
        { id: "profile", label: t("Carrier Capabilities", "إمكانيات النقل"), path: "/dashboard", icon: "◉" },
      ];
    }

    // Default: Client
    return [
      { id: "dashboard", label: t("Home", "الرئيسية"), path: "/dashboard", icon: "⌂" },
      { id: "requests", label: t("My Requests", "طلباتي"), path: "/dashboard", icon: "▤" },
      { id: "new", label: t("New Request", "طلب جديد"), path: "/shipments/new", icon: "➕" },
    ];
  };

  const navItems = getNavItems();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleSwitchDemoPersona(acc: typeof DEMO_ACCOUNTS[0]) {
    loginAsDemo({
      email: acc.email,
      displayName: acc.name,
      role: acc.role,
      status: "approved",
      companyName: acc.company,
      clientType: "clientType" in acc ? acc.clientType : undefined,
      internalRole: "internalRole" in acc ? acc.internalRole : undefined,
    });
    setShowRoleSwitcher(false);
  }

  const roleLabel =
    role === "admin" || internalRole === "super_admin"
      ? t("Super Admin", "مدير النظام")
      : role === "staff" || internalRole === "operations"
      ? t("Operations", "العمليات")
      : role === "provider"
      ? t("Carrier", "مزود خدمة")
      : t("Client", "عميل شحن");

  const roleBadgeColor =
    role === "admin" || internalRole === "super_admin"
      ? "bg-purple-100 text-purple-700 border-purple-300"
      : role === "staff"
      ? "bg-amber-100 text-amber-700 border-amber-300"
      : role === "provider"
      ? "bg-indigo-100 text-indigo-700 border-indigo-300"
      : "bg-blue-100 text-blue-700 border-blue-300";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-64 bg-[#0B1F33] text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-blue-950/50 group-hover:scale-105 group-hover:rotate-3 transition duration-300">
              EI
            </div>
            <div>
              <b className="text-base tracking-tight font-bold block leading-none text-white group-hover:text-blue-300 transition">EI Freight</b>
              <span className="text-[10px] text-slate-400 font-medium">
                {t("Freight Quotation Platform", "منصة عروض أسعار الشحن")}
              </span>
            </div>
          </Link>
          <span className={clsx("text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider border shadow-xs", roleBadgeColor)}>
            {roleLabel}
          </span>
        </div>

        {/* Dynamic Role Navigation Links */}
        <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              role === "admin" || internalRole === "super_admin"
                ? currentTab === item.id
                : location.pathname === item.path;

            const IconComp = item.icon as any;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                  active
                    ? "bg-gradient-to-r rtl:bg-gradient-to-l from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 font-bold scale-[1.02] border border-blue-400/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1"
                )}
              >
                <span className={clsx("transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-blue-400")}>
                  {typeof item.icon === "string" ? item.icon : <IconComp size={19} />}
                </span>
                <span>{item.label}</span>
                {active && (
                  <span className="ms-auto w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Privacy Note matching the prototype */}
        <div className="px-5 py-3 border-t border-slate-800/70 text-[11px] text-slate-400 leading-relaxed bg-[#081726]/40">
          <b className="block text-slate-300 font-bold mb-0.5">
            {t("Private brokerage space", "مساحة وساطة خاصة")}
          </b>
          <p>
            {t(
              "Client and Provider identities remain protected throughout the quotation process.",
              "تظل هويات العميل ومقدم الخدمة منفصلة طوال عملية التسعير."
            )}
          </p>
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-4 border-t border-slate-800 bg-[#081726]/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center font-bold text-blue-300 text-sm">
              {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.displayName || t("Demo User", "مستخدم تجريبي")}
              </p>
              <p className="text-[11px] text-slate-400 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60 transition cursor-pointer active:scale-95 shadow-xs"
          >
            <IconLogout size={15} /> {t("Sign Out", "تسجيل الخروج")}
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Action button on left/right depending on dir */}
          <div className="flex items-center gap-3">
            {role !== "provider" && location.pathname !== "/shipments/new" && (
              <Link
                to="/shipments/new"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
              >
                <span>➕</span>{" "}
                <span>
                  {role === "admin" || role === "staff"
                    ? t("Create Request", "إنشاء طلب عرض سعر")
                    : t("New Request", "طلب جديد")}
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 text-xs font-bold text-slate-700 transition shadow-xs cursor-pointer active:scale-95"
              title={t("Switch to Arabic", "Switch to English")}
            >
              <span className="text-sm">🌐</span>
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>

            {/* Notification Bell with Pulse Badge */}
            <div className="relative">
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 relative transition cursor-pointer active:scale-95"
                title={t("Notifications", "الإشعارات")}
              >
                <span>🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-pulse">
                  1
                </span>
              </button>
            </div>

            {/* Quick Demo Switcher Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleSwitcher((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-xs font-bold text-slate-700 transition cursor-pointer active:scale-95 shadow-xs"
              >
                <span className="text-slate-400 font-normal">
                  {t("Demo Account", "حساب العرض التجريبي")} |
                </span>
                <span className="text-slate-900">
                  {roleLabel} - {user?.displayName || "User"}
                </span>
                <span className="text-[10px] text-slate-400 transition-transform duration-200" style={{ transform: showRoleSwitcher ? "rotate(180deg)" : "none" }}>▼</span>
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 z-40 space-y-1 animate-in fade-in zoom-in-95">
                  <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("Switch Active Persona:", "اختر الشخصية التجريبية:")}
                  </span>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSwitchDemoPersona(acc)}
                      className={clsx(
                        "w-full text-left rtl:text-right p-2.5 rounded-xl flex items-center justify-between transition-all duration-150 text-xs cursor-pointer",
                        user?.email === acc.email
                          ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                          : "hover:bg-slate-100/80 text-slate-700 hover:translate-x-0.5 rtl:hover:-translate-x-0.5"
                      )}
                    >
                      <div>
                        <p className="font-semibold">{acc.name}</p>
                        <p className="text-[10px] text-slate-400">{acc.company}</p>
                      </div>
                      <span className={clsx("text-[9px] px-1.5 py-0.5 rounded font-bold border", acc.color)}>
                        {lang === "ar" ? acc.badgeAr : acc.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * @file src/pages/dashboard/provider/ProviderCapabilitiesTab.tsx
 * @description Carrier Capabilities & KYC Verification view matching Image 4:
 *              - Hero Navy Banner with Verified Partner status & "معتمد" (Approved) badge
 *              - Section 1: Scope of Operations & FCL Service Capabilities (Import, Export, Liner, NVOCC)
 *              - Section 2: Activity Classification & Transport Modes (Sea, Air, Road, Multimodal)
 *              - Section 3: Geographic Coverage (Served Countries & Locations from Master Data)
 *              - Save Changes button with operational pending review notification
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { IconShield, IconCheck, IconPlus, IconClose } from "../../../components/ui/Icons";

interface ProviderCapabilitiesTabProps {
  companyName?: string | null;
}

export function ProviderCapabilitiesTab({ companyName }: ProviderCapabilitiesTabProps) {
  const { t } = useLanguage();

  // Scope of Operations state
  const [scopeImport, setScopeImport] = useState(true);
  const [scopeExport, setScopeExport] = useState(true);
  const [scopeLiner, setScopeLiner] = useState(false);
  const [scopeNvocc, setScopeNvocc] = useState(true);

  // Classification & Modes
  const [classification, setClassification] = useState("freight_forwarder");
  const [modeSea, setModeSea] = useState(true);
  const [modeAir, setModeAir] = useState(true);
  const [modeRoad, setModeRoad] = useState(true);
  const [modeMultimodal, setModeMultimodal] = useState(true);

  // Geographic Coverage
  const [countries, setCountries] = useState<string[]>([
    "الصين (China)",
    "مصر (Egypt)",
    "الإمارات (UAE)",
    "هولندا (Netherlands)",
    "ألمانيا (Germany)",
    "السعودية (Saudi Arabia)",
    "تركيا (Turkey)",
  ]);
  const [newCountry, setNewCountry] = useState("");

  const [locations, setLocations] = useState<string[]>([
    "ميناء شنغهاي (Shanghai Port - CNSHA)",
    "ميناء الإسكندرية (Alexandria Port - EGALY)",
    "ميناء جبل علي (Jebel Ali - AEJEA)",
    "ميناء روتردام (Rotterdam - NLRTM)",
    "ميناء دمياط (Damietta - EGDAM)",
    "ميناء بورسعيد (Port Said - EGPSD)",
  ]);
  const [newLocation, setNewLocation] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleAddCountry(e: React.FormEvent) {
    e.preventDefault();
    if (!newCountry.trim()) return;
    if (!countries.includes(newCountry.trim())) {
      setCountries([...countries, newCountry.trim()]);
    }
    setNewCountry("");
  }

  function handleRemoveCountry(item: string) {
    setCountries(countries.filter((c) => c !== item));
  }

  function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!newLocation.trim()) return;
    if (!locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
    }
    setNewLocation("");
  }

  function handleRemoveLocation(item: string) {
    setLocations(locations.filter((l) => l !== item));
  }

  function handleSaveCapabilities() {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  }

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo',sans-serif]">
      {/* ── Top Header matching Screenshot 4 ── */}
      <div className="pb-2 border-b border-slate-100">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t("Capabilities and Verification", "الإمكانات والتحقق")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t(
            "These settings define the criteria for private RFQ requests you can receive.",
            "تحدد هذه الإعدادات المعايير طلبات RFQ الخاصة التي يمكنك استقبالها."
          )}
        </p>
      </div>

      {/* ── Hero Navy Banner matching Screenshot 4 ── */}
      <div className="bg-[#0B1F33] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {companyName || "SilkRoute Forwarding"}
          </h2>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
            <span>✓</span>
            <span>{t("Verified Shipping Partner · Freight Forwarder", "شريك شحن موثّق · وكيل شحن")}</span>
          </div>
        </div>

        {/* White "معتمد" (Approved) Badge on left matching screenshot */}
        <div className="shrink-0">
          <div className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-black text-sm shadow-xs flex items-center gap-2 border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{t("Approved", "معتمد")}</span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Scope of Operations and FCL Service Capabilities ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900">
            {t("Scope of Operations and FCL Service Capabilities", "نطاق العمليات وقدرات خدمة FCL")}
          </h3>
        </div>

        {/* Checkbox row */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          {/* Import */}
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800">
            <input
              type="checkbox"
              checked={scopeImport}
              onChange={(e) => setScopeImport(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>{t("Import", "استيراد")}</span>
          </label>

          {/* Export */}
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800">
            <input
              type="checkbox"
              checked={scopeExport}
              onChange={(e) => setScopeExport(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>{t("Export", "تصدير")}</span>
          </label>

          {/* Liner */}
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800">
            <input
              type="checkbox"
              checked={scopeLiner}
              onChange={(e) => setScopeLiner(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>{t("Liner", "Liner")}</span>
          </label>

          {/* NVOCC */}
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-800">
            <input
              type="checkbox"
              checked={scopeNvocc}
              onChange={(e) => setScopeNvocc(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>{t("NVOCC", "NVOCC")}</span>
          </label>
        </div>

        {/* Blue Callout Note matching Screenshot 4 */}
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed font-medium">
          {t(
            "FCL capacity treats an empty shipment as an unknown value rather than non-compliant, and changes remain pending until administrative approval.",
            "تعامل قدرة FCL الشحنة الفارغة كقيمة غير معروفة وليست غير متوافقة وتظل التغييرات قيد الانتظار حتى اعتماد الإدارة."
          )}
        </div>
      </div>

      {/* ── Section 2: Classification and Service Modes ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900">
            {t("Classification and Service Modes", "التصنيف ووسائل الخدمة")}
          </h3>
        </div>

        {/* Classification dropdown */}
        <div className="max-w-md">
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            {t("Activity Classification", "تصنيف النشاط")}
          </label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="freight_forwarder">{t("Freight Forwarder", "وكيل شحن")}</option>
            <option value="shipping_line">{t("Shipping Line", "خط ملاحي")}</option>
            <option value="customs_broker">{t("Customs Broker", "مخلص جمركي")}</option>
            <option value="trucking">{t("Road Trucking Carrier", "شركة نقل بري")}</option>
            <option value="3pl">{t("3PL Logistics Provider", "مزود خدمات لوجستية 3PL")}</option>
          </select>
        </div>

        {/* Modes checkboxes */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">
            {t("Supported Transport Modes", "وسائل الخدمة المعتمدة")}
          </label>
          <div className="flex flex-wrap items-center gap-6">
            {/* Sea */}
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
              <input
                type="checkbox"
                checked={modeSea}
                onChange={(e) => setModeSea(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>⚓ {t("Ocean Freight", "بحري")}</span>
            </label>

            {/* Air */}
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
              <input
                type="checkbox"
                checked={modeAir}
                onChange={(e) => setModeAir(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>✈ {t("Air Freight", "جوي")}</span>
            </label>

            {/* Road */}
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
              <input
                type="checkbox"
                checked={modeRoad}
                onChange={(e) => setModeRoad(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>🚛 {t("Road Freight", "بري")}</span>
            </label>

            {/* Multimodal */}
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
              <input
                type="checkbox"
                checked={modeMultimodal}
                onChange={(e) => setModeMultimodal(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>⇄ {t("Multimodal", "متعدد الوسائط")}</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Section 3: Geographic Coverage ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900">
            {t("Geographic Coverage", "التغطية الجغرافية")}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t(
              "All values come from the unified location registry.",
              "تأتي جميع القيم من السجل الموحد للمواقع."
            )}
          </p>
        </div>

        {/* Served Countries */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {t("Served Countries", "الدول المخدومة")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {countries.map((country) => (
              <span
                key={country}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200"
              >
                <span>{country}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCountry(country)}
                  className="w-4 h-4 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] cursor-pointer"
                  title={t("Remove", "حذف")}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Quick Add Country */}
          <form onSubmit={handleAddCountry} className="flex items-center gap-2 pt-1 max-w-sm">
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              placeholder={t("Add country e.g. Spain...", "أضف دولة...")}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <IconPlus size={14} /> {t("Add", "إضافة")}
            </button>
          </form>
        </div>

        {/* Served Locations / Ports */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            {t("From Locations / Ports", "من المواقع")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {locations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200"
              >
                <span>{loc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(loc)}
                  className="w-4 h-4 rounded-full hover:bg-blue-200 flex items-center justify-center text-blue-700 text-[10px] cursor-pointer"
                  title={t("Remove", "حذف")}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Quick Add Location */}
          <form onSubmit={handleAddLocation} className="flex items-center gap-2 pt-1 max-w-sm">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder={t("Add port/location...", "أضف ميناء أو موقع...")}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <IconPlus size={14} /> {t("Add", "إضافة")}
            </button>
          </form>
        </div>
      </div>

      {/* ── Save Button with Administrative Notice ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-400">
          {t(
            "Changes will be sent to the operations desk for compliance review.",
            "سيتم إرسال التغييرات إلى مكتب العمليات للمراجعة والاعتماد."
          )}
        </p>

        <button
          type="button"
          onClick={handleSaveCapabilities}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {savedSuccess ? (
            <>
              <IconCheck size={16} />
              <span>{t("Saved Successfully!", "تم حفظ التغييرات بنجاح!")}</span>
            </>
          ) : (
            <span>{t("Save Changes", "حفظ التغييرات")}</span>
          )}
        </button>
      </div>
    </div>
  );
}

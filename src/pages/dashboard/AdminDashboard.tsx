import {
  IconCommandCenter,
  IconAnalytics,
  IconPipeline,
  IconRegistrations,
  IconProviders,
  IconClients,
  IconLocations,
  IconDemo,
  IconSearch,
  IconPlus,
  IconCheck,
  IconClose,
  IconBell,
  IconGlobe,
  IconLogout,
  IconRefresh,
  IconFilter,
  IconChevronDown,
  IconArrowRight,
  IconArrowLeft,
  IconEdit,
  IconTrendingUp,
  IconShip,
  IconPlane,
  IconTruck,
  IconShield,
  IconPackage,
  IconCoins,
  IconSparkles,
  IconUsers,
  IconBuilding,
  IconFileText,
  IconClock,
  IconStar,
} from "../../components/ui/Icons";
/**
 * @file src/pages/dashboard/AdminDashboard.tsx
 * @description Super Admin Command Center matching https://ei-freight-prototype.pages.dev/
 *              - Backed by live Firebase Firestore real-time subscriptions and mutations
 *              - Full 8 Admin workspace tabs (Dashboard, Analytics, Requests, Registrations,
 *                Providers, Clients, Locations, Demo)
 *              - Exact 7-stage Lifecycle Workflow Pipeline
 *              - Interactive RFQ detail modal with commercial review and execution controls
 *              - Assisted RFQ Creation modal
 */

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import {
  subscribeToRfqs,
  subscribeToClients,
  subscribeToProviders,
  dispatchRfq,
  submitCarrierQuote,
  sendOffersToClient,
  awardQuote,
  startExecution,
  completeShipment,
  createAssistedRfq,
  updateAccountKycStatus,
  toggleClientLimit,
  seedFirestoreIfEmpty,
  resetRfq,
  addInternalOffer,
  startFinalCall,
  ClientProfile,
  ProviderProfile,
  MasterCountry,
  MasterLocation,
  DEFAULT_COUNTRIES,
  DEFAULT_LOCATIONS,
  subscribeToCountries,
  subscribeToLocations,
  addMasterCountry,
  addMasterLocation,
  updateMasterLocation,
  toggleMasterLocation,
  resetEntireDemo,
  resetAllClientLimits,
  resetClientLimit,
  INITIAL_SEEDED_RFQS,
} from "../../services/rfqService";
import { RfqRecord, RfqQuote, LifecycleStage, ShipmentMode, UserStatus } from "../../types/domain";
import { clsx } from "clsx";

export function AdminDashboard() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "dashboard";
  const initialStage = (searchParams.get("stage") as LifecycleStage | "all") || "all";

  // ── 1. Live Firestore Data State ──
  const [rfqs, setRfqs] = useState<RfqRecord[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // ── 2. Filters & Modal UI State ──
  const [pipelineStageFilter, setPipelineStageFilter] = useState<LifecycleStage | "all">(initialStage);
  const [rfqSearchQuery, setRfqSearchQuery] = useState("");
  const [rfqModeFilter, setRfqModeFilter] = useState<string>("");
  const [providerClassFilter, setProviderClassFilter] = useState<string>("");

  // Modals
  const [selectedRfq, setSelectedRfq] = useState<RfqRecord | null>(null);
  const [showAssistedModal, setShowAssistedModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Commercial Review inputs inside modal
  const [adminNote, setAdminNote] = useState(
    t("Best direct rates negotiated with vetted Egyptian carriers.", "تم التفاوض على أفضل أسعار مباشرة مع شركات نقل بحري معتمدة.")
  );
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [markupValues, setMarkupValues] = useState<Record<string, number>>({});

  // Assisted RFQ inputs
  const [assistedClient, setAssistedClient] = useState("client-atlas");
  const [assistedMode, setAssistedMode] = useState<ShipmentMode>("sea");
  const [assistedOrigin, setAssistedOrigin] = useState("ميناء بورسعيد الجاف، مصر");
  const [assistedDestination, setAssistedDestination] = useState("ميناء جبل علي، الإمارات");
  const [assistedCargo, setAssistedCargo] = useState("Commercial assisted cargo consignment");
  const [assistedWeight, setAssistedWeight] = useState("10,000 kg");
  const [assistedNotes, setAssistedNotes] = useState("");

  // ── Locations & Countries Master State ──
  const [countries, setCountries] = useState<MasterCountry[]>(DEFAULT_COUNTRIES);
  const [locations, setLocations] = useState<MasterLocation[]>(DEFAULT_LOCATIONS);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MasterLocation | null>(null);

  const [countryForm, setCountryForm] = useState({ id: "", nameEn: "", nameAr: "" });
  const [locationForm, setLocationForm] = useState<{
    id: string;
    nameEn: string;
    nameAr: string;
    countryId: string;
    type: "city" | "port" | "airport";
    code: string;
  }>({
    id: "",
    nameEn: "",
    nameAr: "",
    countryId: "EG",
    type: "city",
    code: "",
  });

  function countryFlag(countryId: string): string {
    const code = String(countryId || "").toUpperCase();
    return /^[A-Z]{2}$/.test(code)
      ? String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)))
      : "";
  }

  function countryLabel(countryId: string): string {
    const c = countries.find((x) => x.id === countryId);
    return c ? (isArabic ? c.nameAr : c.nameEn) : countryId || "—";
  }

  function locationTypeLabel(type: string): string {
    if (type === "city") return t("City", "مدينة");
    if (type === "port") return t("Port", "ميناء");
    if (type === "airport") return t("Airport", "مطار");
    return type;
  }

  const filteredLocations = useMemo(() => {
    const q = locationSearchQuery.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => {
      const cName = countryLabel(loc.countryId).toLowerCase();
      return (
        loc.id.toLowerCase().includes(q) ||
        loc.nameEn.toLowerCase().includes(q) ||
        loc.nameAr.toLowerCase().includes(q) ||
        loc.countryId.toLowerCase().includes(q) ||
        cName.includes(q) ||
        (loc.code && loc.code.toLowerCase().includes(q))
      );
    });
  }, [locations, locationSearchQuery, countries, isArabic]);

  // ── Demo Reset Confirmation Modal State ──
  const [confirmModal, setConfirmModal] = useState<{
    type: "entire" | "all-clients" | "client" | "rfq";
    id?: string;
    title: string;
    description: string;
  } | null>(null);

  async function handleConfirmReset() {
    if (!confirmModal) return;
    try {
      if (confirmModal.type === "entire") {
        await resetEntireDemo();
        setActionSuccessMsg(t("Demo reset completed", "تمت إعادة ضبط التجربة بالكامل بنجاح"));
      } else if (confirmModal.type === "all-clients") {
        await resetAllClientLimits();
        setActionSuccessMsg(t("All client limits reset", "تم تصفير حدود جميع العملاء بنجاح"));
      } else if (confirmModal.type === "client" && confirmModal.id) {
        await resetClientLimit(confirmModal.id);
        setActionSuccessMsg(t("Client limit reset", "تمت إعادة ضبط استخدام العميل"));
      } else if (confirmModal.type === "rfq" && confirmModal.id) {
        await resetRfq(confirmModal.id);
        setActionSuccessMsg(t("RFQ reset completed", `تمت إعادة ضبط الطلب ${confirmModal.id}`));
      }
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setConfirmModal(null);
    }
  }

  // RFQ Detail Workspace Interactive State
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([
    "provider-bluewave",
    "provider-falcon",
    "provider-silkroute",
    "provider-transmena",
  ]);
  const [showAddCarrierModal, setShowAddCarrierModal] = useState(false);
  const [showInternalOfferModal, setShowInternalOfferModal] = useState(false);
  const [showFinalCallModal, setShowFinalCallModal] = useState(false);

  const [internalOfferForm, setInternalOfferForm] = useState({
    freightPrice: 2100,
    currency: "USD",
    carrierName: "Hapag-Lloyd Direct",
    etd: "2026-11-05",
    transit: "16",
    freeTime: "14 days",
    validity: "2026-11-30",
    dischargeCost: 0,
    dischargeCurrency: "USD",
    notes: "Direct booking option negotiated by EI Freight",
  });

  const [finalCallForm, setFinalCallForm] = useState({
    minutes: 45,
    fields: ["lowestPrice", "transitTime", "validity"],
    note: "Please submit your best valid freight rate before countdown expiration.",
  });

  // ── Analytics Filters & Calculation State ──
  const [analyticsTimePreset, setAnalyticsTimePreset] = useState<string>("current_month");
  const [analyticsMonth, setAnalyticsMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [analyticsYear, setAnalyticsYear] = useState<number>(() => new Date().getFullYear());
  const [analyticsFromDate, setAnalyticsFromDate] = useState<string>("");
  const [analyticsToDate, setAnalyticsToDate] = useState<string>("");

  const { isDailyTrend, analyticsData } = useAdminAnalytics({
    rfqs,
    analyticsTimePreset,
    analyticsMonth,
    analyticsYear,
    analyticsFromDate,
    analyticsToDate,
    isArabic,
  });

  // ── 3. Firestore Subscriptions ──
  useEffect(() => {
    setLoading(true);
    const unsubRfqs = subscribeToRfqs((data) => {
      setRfqs(data);
      setLoading(false);
      // Keep selectedRfq updated with live snapshot
      setSelectedRfq((prev) => (prev ? data.find((r) => r.id === prev.id) || null : null));
    });

    const unsubClients = subscribeToClients((data) => {
      setClients(data);
    });

    const unsubProviders = subscribeToProviders((data) => {
      setProviders(data);
    });

    const unsubCountries = subscribeToCountries((data) => {
      setCountries(data);
    });

    const unsubLocations = subscribeToLocations((data) => {
      setLocations(data);
    });

    return () => {
      unsubRfqs();
      unsubClients();
      unsubProviders();
      unsubCountries();
      unsubLocations();
    };
  }, []);

  // Update URL search params helper
  function switchTab(tabId: string, stage?: LifecycleStage | "all") {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    if (stage) {
      params.set("stage", stage);
      setPipelineStageFilter(stage);
    } else {
      params.delete("stage");
    }
    setSearchParams(params);
  }

  // ── 4. Lifecycle Stage Counts ──
  const stageCounts = useMemo(() => {
    const counts: Record<LifecycleStage, number> = {
      request: 0,
      rfq: 0,
      offer: 0,
      quotation: 0,
      approved: 0,
      in_progress: 0,
      history: 0,
    };
    rfqs.forEach((r) => {
      if (counts[r.stage] !== undefined) {
        counts[r.stage]++;
      }
    });
    return counts;
  }, [rfqs]);

  // Clients & Providers counts
  const pendingClientsCount = clients.filter((c) => c.status === "pending_approval").length;
  const pendingProvidersCount = providers.filter((p) => p.status === "pending_approval").length;

  // Mode Icon Helper
  function getModeIcon(mode: string) {
    if (mode === "sea") return <IconShip size={18} className="text-cyan-600" />;
    if (mode === "air") return <IconPlane size={18} className="text-sky-600" />;
    if (mode === "road") return <IconTruck size={18} className="text-amber-600" />;
    return <IconPackage size={18} className="text-indigo-600" />;
  }

  // Status Badge Helper
  function getStatusBadge(rfq: RfqRecord) {
    if (rfq.status === "matching") {
      return { label: "Matching", cls: "bg-sky-100 text-sky-800 border-sky-300" };
    }
    if (rfq.status === "quotes_received" || rfq.stage === "offer") {
      return {
        label: rfq.quotes.length > 1 ? t("Quotes Ready", "العروض جاهزة") : t("Admin Review", "مراجعة الإدارة"),
        cls: rfq.quotes.length > 1 ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300",
      };
    }
    if (rfq.status === "dispatched" || rfq.stage === "rfq") {
      return { label: t("Admin Review", "مراجعة الإدارة"), cls: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    if (rfq.status === "offers_sent" || rfq.stage === "quotation") {
      return { label: t("Offers Ready", "العروض أرسلت"), cls: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
    if (rfq.status === "selected" || rfq.stage === "approved") {
      return { label: t("Approved", "معتمد"), cls: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
    if (rfq.status === "in_progress" || rfq.stage === "in_progress") {
      return { label: t("In Progress", "قيد التنفيذ"), cls: "bg-blue-100 text-blue-800 border-blue-300" };
    }
    if (rfq.status === "completed" || rfq.stage === "history") {
      return { label: t("History / Completed", "السجل / مكتمل"), cls: "bg-slate-100 text-slate-700 border-slate-300" };
    }
    return { label: rfq.status, cls: "bg-slate-100 text-slate-700 border-slate-300" };
  }

  // ── 5. Actions Handlers ──
  async function handleDispatch(rfqId: string) {
    try {
      await dispatchRfq(rfqId, ["provider-bluewave", "provider-silkroute", "provider-falcon"]);
      showToast(t("Dispatched to 3 Carriers.", "تم إرسال المناقصة لـ ٣ ناقلين بنجاح."));
    } catch {
      alert("Error dispatching RFQ");
    }
  }

  async function handleSimulateCarrierQuote(rfqId: string) {
    try {
      const sampleQuote: RfqQuote = {
        id: `q-${Date.now()}`,
        providerId: "provider-bluewave",
        providerCompany: "BlueWave Logistics",
        freightRate: 1950,
        originCharges: 180,
        destCharges: 140,
        totalPrice: 2270,
        sellingPrice: 2450,
        currency: "USD",
        transitDays: 14,
        routingType: "direct",
        validUntil: "2026-11-20",
        rating: 4.9,
        sentToClient: true,
        status: "active",
        submittedAt: new Date().toISOString(),
      };
      await submitCarrierQuote(rfqId, sampleQuote);
      showToast(t("Carrier quote submitted by BlueWave Logistics.", "تم استلام وتسجيل عرض سعر من شركة بلو ويف."));
    } catch {
      alert("Error submitting quote");
    }
  }

  async function handleSendOffers(rfqId: string) {
    try {
      const quoteIds = selectedQuoteIds.length > 0 ? selectedQuoteIds : selectedRfq?.quotes.map((q) => q.id) || [];
      await sendOffersToClient(rfqId, quoteIds, adminNote);
      showToast(t("Offers sent to Client for acceptance.", "تم إرسال باقة العروض للعميل بنجاح."));
    } catch {
      alert("Error sending offers");
    }
  }

  async function handleSimulateClientAward(rfqId: string, quoteId: string) {
    try {
      await awardQuote(rfqId, quoteId);
      showToast(t("Offer accepted by Client! Ready for execution.", "قام العميل باختيار وقبول العرض! جاهز لبدء التنفيذ."));
    } catch {
      alert("Error awarding quote");
    }
  }

  async function handleStartExecution(rfqId: string) {
    try {
      await startExecution(rfqId);
      showToast(t("Execution started. Shipment is In Progress.", "بدأ التنسيق والتنفيذ. الشحنة الآن قيد النقل."));
    } catch {
      alert("Error starting execution");
    }
  }

  async function handleCompleteShipment(rfqId: string) {
    if (!confirm(t("Complete this shipment and move it to History?", "هل تريد إنهاء هذه الشحنة ونقلها إلى السجل؟"))) return;
    try {
      await completeShipment(rfqId);
      showToast(t("Shipment completed and moved to History.", "اكتملت الشحنة بنجاح وتم نقلها إلى السجل."));
    } catch {
      alert("Error completing shipment");
    }
  }

  async function handleAssistedSubmit(e: React.FormEvent) {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === assistedClient);
    try {
      const newId = `RFQ-${Math.floor(1051 + Math.random() * 40)}`;
      await createAssistedRfq({
        id: newId,
        client: assistedClient,
        clientName: targetClient?.name || "Client",
        clientCompany: targetClient?.company || "Company",
        mode: assistedMode,
        origin: assistedOrigin,
        destination: assistedDestination,
        route: `${assistedOrigin} ➔ ${assistedDestination}`,
        cargo: assistedCargo,
        weight: assistedWeight,
        clientNotes: assistedNotes,
      });
      setShowAssistedModal(false);
      showToast(t("Assisted RFQ created successfully!", "تم إنشاء طلب الشحن المدعوم بنجاح!"));
    } catch {
      alert("Error creating assisted RFQ");
    }
  }

  async function handleKycAction(type: "clients" | "providers", id: string, newStatus: UserStatus) {
    try {
      await updateAccountKycStatus(type, id, newStatus);
      showToast(
        newStatus === "approved"
          ? t("Account approved successfully.", "تم اعتماد الحساب بنجاح.")
          : t("Account status updated.", "تم تحديث حالة الحساب.")
      );
    } catch {
      alert("Error updating KYC status");
    }
  }

  async function handleClientLimitToggle(clientId: string, currentEnabled: boolean) {
    try {
      await toggleClientLimit(clientId, !currentEnabled);
      showToast(
        !currentEnabled
          ? t("2-request monthly limit activated.", "تم تفعيل حد الطلبين الشهري.")
          : t("Monthly limit deactivated (Unlimited).", "تم إلغاء الحد (أصبح غير محدود).")
      );
    } catch {
      alert("Error toggling limit");
    }
  }

  async function handleResetRfq(rfqId: string) {
    try {
      await resetRfq(rfqId);
      showToast(t("RFQ reset to clean prototype state.", "تمت إعادة ضبط الطلب إلى حالته الأولية."));
    } catch {
      alert("Error resetting RFQ");
    }
  }

  async function handleDispatchSelected(rfqId: string) {
    try {
      await dispatchRfq(rfqId, selectedCarriers);
      showToast(t("Matches successfully dispatched to carriers!", "تم إرسال المناقصة بنجاح إلى مقدمي الخدمة المحددين!"));
    } catch {
      alert("Error dispatching RFQ");
    }
  }

  async function handleAddInternalOfferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRfq) return;
    try {
      await addInternalOffer(selectedRfq.id, {
        freightPrice: Number(internalOfferForm.freightPrice),
        currency: internalOfferForm.currency,
        carrierName: internalOfferForm.carrierName,
        etd: internalOfferForm.etd,
        transit: internalOfferForm.transit,
        freeTime: internalOfferForm.freeTime,
        validity: internalOfferForm.validity,
        dischargeCost: Number(internalOfferForm.dischargeCost),
        dischargeCurrency: internalOfferForm.dischargeCurrency,
        notes: internalOfferForm.notes,
      });
      setShowInternalOfferModal(false);
      showToast(t("Internal offer added successfully.", "تمت إضافة العرض التجاري الداخلي بنجاح."));
    } catch {
      alert("Error adding internal offer");
    }
  }

  async function handleStartFinalCallSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRfq) return;
    try {
      await startFinalCall(
        selectedRfq.id,
        Number(finalCallForm.minutes),
        finalCallForm.fields,
        finalCallForm.note
      );
      setShowFinalCallModal(false);
      showToast(t("Final Call round started!", "تم بدء جولة الأخذ النهائي لمقدمي الخدمة بنجاح!"));
    } catch {
      alert("Error starting final call");
    }
  }

  function showToast(msg: string) {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  }

  // Filtered RFQs for Pipeline view
  const filteredRfqs = useMemo(() => {
    return rfqs.filter((r) => {
      const matchStage = pipelineStageFilter === "all" || r.stage === pipelineStageFilter;
      const matchMode = !rfqModeFilter || r.mode === rfqModeFilter;
      const query = rfqSearchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.clientCompany.toLowerCase().includes(query) ||
        r.cargo.toLowerCase().includes(query) ||
        r.route.toLowerCase().includes(query);
      return matchStage && matchMode && matchQuery;
    });
  }, [rfqs, pipelineStageFilter, rfqModeFilter, rfqSearchQuery]);

  // ── 6. Dedicated RFQ Detail Workspace (Exact Prototype Detail View on فتح ←) ──
  function renderRfqDetailWorkspace(rfq: RfqRecord) {
    const isPersonal = rfq.id.startsWith("REQ-P-") || (rfq.cargo && rfq.cargo.includes("vdlldfvcxfdfcf"));

    // Step index
    let stepIdx = 1;
    if (["draft", "admin_review"].includes(rfq.status)) stepIdx = 0;
    else if (["matching", "request", "dispatched", "rfq", "collecting_quotes"].includes(rfq.status) || rfq.stage === "request" || rfq.stage === "rfq") stepIdx = 1;
    else if (["quotes_received", "offer"].includes(rfq.status) || rfq.stage === "offer") stepIdx = 2;
    else if (["commercial_review", "review", "offers_sent", "quotation"].includes(rfq.status) || rfq.stage === "quotation") stepIdx = 3;
    else if (["selected", "awarded", "approved", "in_progress", "completed", "history"].includes(rfq.status)) stepIdx = 4;

    const steps = [
      t("Created", "تم الإنشاء"),
      t("RFQ", "طلب سعر"),
      t("Offers", "العروض"),
      t("Reviewed", "المراجعة"),
      t("Client decision", "قرار العميل"),
    ];

    return (
      <div className="space-y-6">
        {/* Back to queue button */}
        <div>
          <button
            type="button"
            onClick={() => setSelectedRfq(null)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-xs font-bold text-slate-700 transition shadow-xs cursor-pointer active:scale-95"
          >
            <IconArrowLeft size={15} className="rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition duration-200 text-blue-600" />
            <span>{isArabic ? "العودة إلى القائمة" : "Back to queue"}</span>
          </button>
        </div>

        {/* Timeline Stepper */}
        <div className="timeline">
          {steps.map((s, i) => (
            <div
              key={i}
              className={clsx(
                "step",
                i <= stepIdx && "done",
                i === stepIdx && "current"
              )}
            >
              <i>
                {i < stepIdx ? <IconCheck size={11} strokeWidth={3} className="text-white" /> : null}
              </i>
              {s}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              {rfq.id}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {rfq.route}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isPersonal
                ? `${t("Actual Mode", "الوسيلة")}: ${t("Sea freight", "شحن بحري")} · ${t("Record", "سجل")}: ${rfq.id}`
                : `${t("Mode", "الوسيلة")}: ${t("Sea freight", "شحن بحري")} · ${t("Record", "سجل")}: ${rfq.id}`}
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#e0eff7] text-[#176184] uppercase tracking-wide">
              {rfq.status === "matching" ? "Matching" : rfq.status === "dispatched" ? "Dispatched" : rfq.status === "quotes_received" ? "Quoted" : rfq.status}
            </span>
          </div>
        </div>

        {/* 3-metric summary grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="detail-grid">
            <div>
              <small>{t("Goods", "البضاعة")}</small>
              <b className="truncate block">{rfq.cargo}</b>
            </div>
            <div>
              <small>{t("Weight", "الوزن")}</small>
              <b>{rfq.weight}</b>
            </div>
            <div>
              <small>{t("Lifecycle Stage", "مرحلة دورة العمل")}</small>
              <b>{t("RFQ", "طلب سعر")}</b>
            </div>
          </div>
        </div>

        {/* Personal Shipment Details Card (or Commercial) */}
        {isPersonal ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                {t("Personal Shipment Details", "تفاصيل الشحنة الشخصية")}
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e0eff7] text-[#176184]">
                {t("Required Mode: Sea", "الوسيلة المطلوبة: بحري")}
              </span>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  {t("Goods & Measurements", "البضاعة والقياسات")}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Goods Description", "وصف البضاعة")}</span>
                    <span className="font-bold text-slate-800 mt-1 block truncate">Vdlldfvcxfdfcf, Dffdldlkdl</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Dimensions", "الأبعاد")}</span>
                    <span className="font-bold text-slate-800 mt-1 block">Cm 32 × 32 × 32</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Weight", "الوزن")}</span>
                    <span className="font-bold text-slate-800 mt-1 block">Kg 32</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Stackable", "قابلة للتكديس")}</span>
                    <span className="font-bold text-slate-800 mt-1 block">{t("Yes", "نعم")}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  {t("Pickup & Delivery", "الاستلام والتسليم")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Pickup Location", "موقع الاستلام")}</span>
                    <span className="font-bold text-slate-800 mt-1 block">فرانكفورت / Gfzgfzg</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Delivery Location", "موقع التسليم")}</span>
                    <span className="font-bold text-slate-800 mt-1 block">فرانكفورت / Dfgdfgdfgfd</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  {t("Handling Requirements", "متطلبات المناولة")}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Hazardous Goods", "مواد خطرة")}</span>
                    <span className="font-bold text-slate-800 mt-1 block">{t("No", "لا")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Refrigerated", "تبريد")}</span>
                    <span className="font-bold text-slate-800 mt-1 block">{t("No", "لا")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                {t("Commercial Shipment Specifications", "مواصفات الشحنة التجارية")}
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e0eff7] text-[#176184]">
                {rfq.shipmentType || "FCL — حاوية كاملة"}
              </span>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Container Type", "نوع الحاوية")}</span>
                <span className="font-bold text-slate-800 mt-1 block">{rfq.containerType || "40' High Cube (HC)"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Cargo Weight", "وزن البضاعة")}</span>
                <span className="font-bold text-slate-800 mt-1 block">{rfq.weight}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Incoterms", "شروط الشحن")}</span>
                <span className="font-bold text-slate-800 mt-1 block">FOB Loading Port</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Packaging", "نوع التعبئة")}</span>
                <span className="font-bold text-slate-800 mt-1 block">Palletized Euro Crates</span>
              </div>
            </div>
          </div>
        )}

        {/* Ownership & Audit Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {t("Ownership & Audit", "الملكية والتدقيق")}
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e0eff7] text-[#176184]">
              {t("Internal only", "للإستخدام الداخلي فقط")}
            </span>
          </div>
          <div className="p-5">
            <div className="detail-grid">
              <div>
                <small>{t("Client owner", "العميل المالك")}</small>
                <b>{rfq.clientCompany || "Atlas Homeware"}</b>
              </div>
              <div>
                <small>{t("Created by", "أنشأه")}</small>
                <b>{rfq.clientName ? `${rfq.clientName} - ${t("Client", "العميل")}` : "Nour Hassan - العميل"}</b>
              </div>
              <div>
                <small>{t("Creator account", "حساب العميل")}</small>
                <b>{rfq.client === "client-atlas" ? "clientA" : rfq.client}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Client & Controls | Provider Matching & Dispatch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Client & Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">
                  {t("Client & controls", "العميل وأدوات التحكم")}
                </h2>
              </div>
              <div className="pt-4 space-y-3">
                <div>
                  <b className="text-sm text-slate-900 block">{rfq.clientCompany || "Atlas Homeware"}</b>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t(
                      "Visible only to EI Freight; providers see “Client identity protected”.",
                      "مرئي فقط لـ EI Freight؛ ويظهر لمقدمي الخدمة أن هوية العميل محمية."
                    )}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500 block">
                    {t("Request allowance impact", "أثر الحصة الشهرية للطلبات")}
                  </span>
                  <b className="text-sm font-bold text-slate-900 block mt-1">
                    2 / 2 {t("used this month", "مستخدم هذا الشهر")}
                  </b>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => handleResetRfq(rfq.id)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
              >
                {t("Reset this RFQ", "إعادة ضبط هذا الطلب")}
              </button>
            </div>
          </div>

          {/* Provider Matching & Dispatch (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {t("Provider matching & dispatch", "مطابقة وإرسال مقدمي الخدمة")}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e0eff7] text-[#176184]">
                  4 {t("eligible matches", "مطابقات متوافقة")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCarrierModal(true)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                + {t("Add Provider", "إضافة مقدم خدمة")}
              </button>
            </div>

            <div className="pt-4 space-y-3">
              {[
                {
                  id: "provider-bluewave",
                  name: "BlueWave Logistics",
                  cov: t("Full international coverage", "تغطية دولية كاملة"),
                  match: t("Exact match · 100", "مطابق تماماً"),
                  note: t("Offered sea freight in the same geographic region...", "وفّر شحن بحري في نفس المنطقة الجغرافية وحاصل على ترخيص خط ملاحي كامل"),
                },
                {
                  id: "provider-falcon",
                  name: "Falcon Air Cargo",
                  cov: t("Full international coverage", "تغطية دولية كاملة"),
                  match: t("Exact match · 100", "مطابق تماماً"),
                },
                {
                  id: "provider-silkroute",
                  name: "SilkRoute Forwarding",
                  cov: t("Full international coverage", "تغطية دولية كاملة"),
                  match: t("Exact match · 100", "مطابق تماماً"),
                },
                {
                  id: "provider-transmena",
                  name: "TransMENA Road Freight",
                  cov: t("Full international coverage", "تغطية دولية كاملة"),
                  match: t("Exact match · 100", "مطابق تماماً"),
                },
              ].map((p) => {
                const isChecked = selectedCarriers.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={clsx(
                      "p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition",
                      isChecked ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50 opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCarriers((prev) => [...prev, p.id]);
                        } else {
                          setSelectedCarriers((prev) => prev.filter((id) => id !== p.id));
                        }
                      }}
                      className="w-4 h-4 rounded text-blue-600 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <b className="text-xs text-slate-900">{p.name}</b>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {p.match}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.cov}</p>
                      {p.note && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{p.note}</p>}
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ {t("Auto Matched", "مطابق تلقائيًا")}
                        </span>
                        {rfq.dispatchedProviders?.includes(p.id) && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            {t("Invited", "تمت الدعوة")}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleDispatchSelected(rfq.id)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B1F33] hover:bg-[#1E3A5F] transition shadow-xs"
                >
                  {t("Dispatch selected matches", "إرسال المطابقات المختارة")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Internal Offers (العروض الداخلية) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-black uppercase text-blue-600">
                {t("Admin commercial source", "مصدر تجاري إداري")}
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                {t("Internal Offers", "العروض الداخلية")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  "Create independent commercial options without a Provider identity.",
                  "أنشئ خيارات تجارية مستقلة دون الحاجة إلى هوية مقدم خدمة."
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInternalOfferModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              + {t("Add Internal Offer", "إضافة عرض داخلي")}
            </button>
          </div>

          <div className="pt-4">
            {rfq.quotes.filter((q) => q.providerId === "internal").length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 space-y-1">
                <b className="text-xs text-slate-800 block">
                  {t("No Internal Offers yet", "لا توجد عروض داخلية بعد")}
                </b>
                <p className="text-xs text-slate-500">
                  {t(
                    "Add as many independent options as the Request needs.",
                    "أضف العدد المطلوب من الخيارات المختلفة للطلب."
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rfq.quotes
                  .filter((q) => q.providerId === "internal")
                  .map((q) => (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                          {t("Internal Offer", "عرض داخلي")}
                        </span>
                        <div className="text-sm font-black text-slate-900 mt-1">
                          ${(q.sellingPrice ?? q.totalPrice ?? 0).toLocaleString()} {q.currency}
                        </div>
                        <p className="text-xs text-slate-500">{q.transitDays} {t("days transit", "أيام")} · {q.validUntil}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Card: Provider final call */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Provider final call
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              A configurable quick-bid round at any point in the sourcing process.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFinalCallModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1F33] hover:bg-[#1E3A5F] transition"
          >
            {t("Send Final Call", "إرسال أخذ نهائي")}
          </button>
        </div>

        {/* Commercial Review & Quotations (when quotes exist) */}
        {rfq.quotes && rfq.quotes.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-[10px] font-black uppercase text-blue-600">
                  {t("Commercial review", "المراجعة التجارية")}
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {t("Offers", "العروض")} ({rfq.quotes.length})
                </h2>
              </div>
              <div className="text-xs text-slate-500">
                {rfq.quotes.length} {t("Offers", "عرض سعر")} · {new Set(rfq.quotes.map(q => q.providerId)).size} {t("Providers", "مقدمي خدمة")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rfq.quotes.map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <b className="text-slate-900">{q.providerCompany}</b>
                    <span className="text-amber-500 font-bold">★ {q.rating || 4.8}</span>
                  </div>
                  <div className="text-lg font-black text-blue-600">
                    ${(q.sellingPrice ?? q.totalPrice ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">{q.currency}</span>
                  </div>
                  <div className="text-slate-500 space-y-0.5 text-[11px]">
                    <p>{t("Transit:", "المدة:")} {q.transitDays} {t("Days", "أيام")}</p>
                    <p>{t("Valid until:", "صالح حتى:")} {q.validUntil}</p>
                  </div>
                  <label className="flex items-center gap-2 pt-2 border-t border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={q.sentToClient !== false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuoteIds((prev) => [...prev, q.id]);
                        } else {
                          setSelectedQuoteIds((prev) => prev.filter((id) => id !== q.id));
                        }
                      }}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">{t("Select for client", "اختيار للعميل")}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={t("Commercial note for client…", "ملاحظة تجارية موجهة للعميل…")}
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => handleSendOffers(rfq.id)}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs whitespace-nowrap"
              >
                {t("Send selected offers to client ➔", "إرسال العروض المحددة للعميل ←")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 rtl:right-auto rtl:left-6 z-50 bg-slate-900/95 text-white border border-emerald-500/40 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold toast-luxury">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30">
            ✓
          </div>
          <span className="tracking-wide text-slate-100">{actionSuccessMsg}</span>
        </div>
      )}

      {selectedRfq && renderRfqDetailWorkspace(selectedRfq)}

      {/* ═════════════════════════════════════════════════════
          TAB 1: مركز التحكم (COMMAND CENTER / DASHBOARD)
          Exact replication of the user's prototype screenshot!
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "dashboard" && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("Admin workspace", "مساحة عمل الإدارة")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t(
                  "Move directly into the current freight and account workflows.",
                  "انتقل مباشرة إلى مسارات الشحن والحسابات الحالية."
                )}
              </p>
            </div>

            <button
              onClick={() => setShowAssistedModal(true)}
              className="btn-shine px-5 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <IconPlus size={16} />
              <span>{t("Create Request", "إنشاء طلب عرض سعر")}</span>
            </button>
          </div>

          {/* Section: مسار العمل (7-Stage Workflow Pipeline) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t("Operational pipeline", "مسار العمل")}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { stage: "request" as const, en: "Request", ar: "طلب", count: stageCounts.request, subEn: "New requests", subAr: "طلبات جديدة", Icon: IconPipeline, color: "text-blue-600", bg: "bg-blue-50 group-hover:bg-blue-100" },
                { stage: "rfq" as const, en: "RFQ", ar: "RFQ", count: stageCounts.rfq, subEn: "Dispatched", subAr: "طلبات أرسلت للتسعير", Icon: IconRefresh, color: "text-indigo-600", bg: "bg-indigo-50 group-hover:bg-indigo-100" },
                { stage: "offer" as const, en: "Offer", ar: "عرض", count: stageCounts.offer, subEn: "Quotes submitted", subAr: "عروض مقدمة", Icon: IconCoins, color: "text-amber-600", bg: "bg-amber-50 group-hover:bg-amber-100" },
                { stage: "quotation" as const, en: "Quotation", ar: "عرض سعر", count: stageCounts.quotation, subEn: "Sent to client", subAr: "عروض أرسلت للعميل", Icon: IconPackage, color: "text-purple-600", bg: "bg-purple-50 group-hover:bg-purple-100" },
                { stage: "approved" as const, en: "Approved", ar: "معتمد", count: stageCounts.approved, subEn: "Offers awarded", subAr: "عروض تم اختيارها", Icon: IconCheck, color: "text-emerald-600", bg: "bg-emerald-50 group-hover:bg-emerald-100" },
                { stage: "in_progress" as const, en: "In Progress", ar: "قيد التنفيذ", count: stageCounts.in_progress, subEn: "Coordination active", subAr: "تنسيق جارٍ", Icon: IconTrendingUp, color: "text-sky-600", bg: "bg-sky-50 group-hover:bg-sky-100" },
                { stage: "history" as const, en: "History", ar: "السجل", count: stageCounts.history, subEn: "Closed records", subAr: "سجلات مغلقة", Icon: IconCommandCenter, color: "text-slate-600", bg: "bg-slate-100 group-hover:bg-slate-200" },
              ].map((item) => (
                <button
                  key={item.stage}
                  type="button"
                  onClick={() => switchTab("requests", item.stage)}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 text-center hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center transition-colors duration-200`}>
                      <item.Icon size={15} className={`${item.color} transition-transform duration-200 group-hover:scale-110`} />
                    </div>
                    <span>{t(item.en, item.ar)}</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.count}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {t(item.subEn, item.subAr)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Two Summary Cards (العملاء & مقدمو الخدمة) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: مقدمو الخدمة */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between gap-4 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                    <IconBuilding size={20} />
                  </div>
                  <h2 className="text-base font-black text-slate-900">{t("Service Providers", "مقدمو الخدمة")}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{t("Carriers, Forwarders & Agents", "ناقلون، وكلاء شحن ومخلصون")}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {providers.length} {t("Registered", "مسجل")}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-2xl font-black text-amber-600">{pendingProvidersCount}</span>
                    <span className="block text-[11px] font-medium text-slate-400">{t("Waiting Approval", "بانتظار الاعتماد")}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div>
                    <span className="text-2xl font-black text-slate-900">{providers.filter((p) => p.status === "approved").length}</span>
                    <span className="block text-[11px] font-medium text-slate-400">{t("Active Carriers", "نشطون")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => switchTab("providers")}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold text-slate-700 border border-slate-200/80 hover:border-indigo-200 transition-all cursor-pointer active:scale-95"
                >
                  <span>{isArabic ? "إدارة المزودين" : "Manage Providers"}</span>
                  <IconArrowRight size={13} className="rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 2: العملاء */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between gap-4 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                    <IconUsers size={20} />
                  </div>
                  <h2 className="text-base font-black text-slate-900">{t("Clients", "العملاء")}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{t("Shippers, Importers & Exporters", "مستوردون ومصدرون وشركات تجارية")}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {clients.length} {t("Total", "إجمالي")}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-2xl font-black text-amber-600">{pendingClientsCount}</span>
                    <span className="block text-[11px] font-medium text-slate-400">{t("Waiting Approval", "بانتظار الاعتماد")}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div>
                    <span className="text-2xl font-black text-slate-900">{clients.filter((c) => c.status === "approved").length}</span>
                    <span className="block text-[11px] font-medium text-slate-400">{t("Active Shippers", "نشطون")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => switchTab("clients")}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold text-slate-700 border border-slate-200/80 hover:border-blue-200 transition-all cursor-pointer active:scale-95"
                >
                  <span>{isArabic ? "إدارة العملاء" : "Manage Clients"}</span>
                  <IconArrowRight size={13} className="rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Section: أحدث سجلات العمل */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {t("Recent workflow records", "أحدث سجلات العمل")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("Canonical lifecycle stage shown for each record.", "تظهر مرحلة دورة العمل المعتمدة لكل سجل.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchTab("requests", "all")}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                <span>{t("View pipeline", "عرض كامل المسار")}</span>
                <IconArrowRight size={13} className="rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {rfqs.slice(0, 5).map((rfq) => {
                const badge = getStatusBadge(rfq);
                return (
                  <div
                    key={rfq.id}
                    className="p-5 hover:bg-blue-50/30 transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-blue-200 transition-all duration-200">
                        {getModeIcon(rfq.mode)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">{rfq.id}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-800">{rfq.clientCompany}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">{rfq.created}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 truncate mt-1 group-hover:text-blue-600 transition-colors">
                          {rfq.route}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{rfq.cargo} · {rfq.weight}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <span className={clsx("text-xs font-bold px-3 py-1 rounded-full border shadow-2xs", badge.cls)}>
                        {badge.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedRfq(rfq)}
                        className="group/btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-xs font-bold text-slate-700 transition duration-200 cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>{isArabic ? "فتح" : "Open"}</span>
                        <IconArrowRight size={13} className="text-slate-400 group-hover/btn:text-blue-600 rtl:rotate-180 transition-transform duration-200 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═════════════════════════════════════════════════════
          TAB 2: الإحصائيات (ANALYTICS)
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "analytics" && (
        <div className="analytics-page">
          {/* Header */}
          <div className="heading">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t("Business intelligence", "ذكاء الأعمال")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {t("Analytics", "الإحصائيات")}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t("Commercial performance from selected business records only.", "الأداء التجاري من سجلات الأعمال المختارة فقط.")}
              </p>
            </div>
          </div>

          {/* Top Filter Bar */}
          <div className="analytics-global-filter" aria-label={t("Analytics date filter", "فلتر تاريخ الإحصائيات")}>
            <div className="operational-filter-control">
              <label htmlFor="analytics-period-admin">{t("Time Period", "الفترة الزمنية")}</label>
              <select
                id="analytics-period-admin"
                value={analyticsTimePreset}
                onChange={(e) => setAnalyticsTimePreset(e.target.value)}
              >
                <option value="current_month">{t("Current Month", "الشهر الحالي")}</option>
                <option value="previous_month">{t("Previous Month", "الشهر السابق")}</option>
                <option value="current_year">{t("Current Year", "السنة الحالية")}</option>
                <option value="previous_year">{t("Previous Year", "السنة السابقة")}</option>
                <option value="specific_month">{t("Specific Month", "شهر محدد")}</option>
                <option value="specific_year">{t("Specific Year", "سنة محددة")}</option>
                <option value="custom_range">{t("Custom Range", "نطاق مخصص")}</option>
                <option value="all">{t("All Time", "كل الوقت")}</option>
              </select>
            </div>

            {analyticsTimePreset === "specific_month" && (
              <div className="operational-filter-control">
                <label htmlFor="analytics-month-admin">{t("Month and Year", "الشهر والسنة")}</label>
                <input
                  id="analytics-month-admin"
                  type="month"
                  value={analyticsMonth}
                  onChange={(e) => setAnalyticsMonth(e.target.value)}
                />
              </div>
            )}

            {analyticsTimePreset === "specific_year" && (
              <div className="operational-filter-control">
                <label htmlFor="analytics-year-admin">{t("Year", "السنة")}</label>
                <input
                  id="analytics-year-admin"
                  type="number"
                  min="2000"
                  max="2100"
                  value={analyticsYear}
                  onChange={(e) => setAnalyticsYear(Number(e.target.value))}
                  placeholder="2026"
                />
              </div>
            )}

            {analyticsTimePreset === "custom_range" && (
              <div className="operational-time-fields">
                <div className="operational-filter-control">
                  <label htmlFor="analytics-from-admin">{t("From Date", "من تاريخ")}</label>
                  <input
                    id="analytics-from-admin"
                    type="date"
                    value={analyticsFromDate}
                    onChange={(e) => setAnalyticsFromDate(e.target.value)}
                  />
                </div>
                <div className="operational-filter-control">
                  <label htmlFor="analytics-to-admin">{t("To Date", "إلى تاريخ")}</label>
                  <input
                    id="analytics-to-admin"
                    type="date"
                    value={analyticsToDate}
                    onChange={(e) => setAnalyticsToDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <span className="analytics-filter-context">
              {t("All metrics below use this period.", "تستخدم جميع المؤشرات أدناه هذه الفترة.")}
            </span>
          </div>

          {/* 6-KPI Row */}
          <section className="analytics-kpis shadow-xs">
            {/* KPI 1: Business Volume */}
            <article className="analytics-kpi group">
              <div className="flex items-center justify-between mb-1">
                <small>{t("Business Volume", "حجم الأعمال")}</small>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                  <IconCoins size={14} />
                </div>
              </div>
              <strong>
                {Object.keys(analyticsData.volume).length === 0 ? (
                  t("Unavailable", "غير متاح")
                ) : (
                  <span className="currency-lines">
                    {Object.entries(analyticsData.volume).map(([curr, val]) => (
                      <span key={curr}>
                        {curr} {Math.round(val).toLocaleString()}
                      </span>
                    ))}
                  </span>
                )}
              </strong>
              <span className="meta">{t("Final Client freight price", "سعر شحن العميل النهائي")}</span>
            </article>

            {/* KPI 2: Shipments */}
            <article className="analytics-kpi group">
              <div className="flex items-center justify-between mb-1">
                <small>{t("Shipments", "الشحنات")}</small>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                  <IconPackage size={14} />
                </div>
              </div>
              <strong>{analyticsData.shipments}</strong>
              <span className="meta">{t("One selected transaction each", "معاملة مختارة واحدة لكل شحنة")}</span>
            </article>

            {/* KPI 3: Total Profit */}
            <article className="analytics-kpi group">
              <div className="flex items-center justify-between mb-1">
                <small>{t("Total Profit", "إجمالي الربح")}</small>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-110 transition-transform">
                  <IconTrendingUp size={14} />
                </div>
              </div>
              <strong>
                {Object.keys(analyticsData.profit).length === 0 ? (
                  t("Unavailable", "غير متاح")
                ) : (
                  <span className="currency-lines">
                    {Object.entries(analyticsData.profit).map(([curr, val]) => (
                      <span key={curr}>
                        {curr} {Math.round(val).toLocaleString()}
                      </span>
                    ))}
                  </span>
                )}
              </strong>
              <span className="meta">{t("Excludes discharge and unknown cost", "لا يشمل التفريغ أو التكلفة المجهولة")}</span>
            </article>

            {/* KPI 4: Completed */}
            <article className="analytics-kpi group">
              <div className="flex items-center justify-between mb-1">
                <small>{t("Completed", "المكتملة")}</small>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-110 transition-transform">
                  <IconCheck size={14} strokeWidth={2.5} />
                </div>
              </div>
              <strong>{analyticsData.completed}</strong>
              <span className="meta">{t("Finished lifecycles", "دورات مكتملة")}</span>
            </article>

            {/* KPI 5: In Progress */}
            <article className="analytics-kpi group">
              <div className="flex items-center justify-between mb-1">
                <small>{t("In Progress", "قيد التنفيذ")}</small>
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 group-hover:scale-110 transition-transform">
                  <IconClock size={14} />
                </div>
              </div>
              <strong>{analyticsData.inProgress}</strong>
              <span className="meta">{t("Active freight operations", "عمليات شحن نشطة")}</span>
            </article>

            {/* KPI 6: Clients in Period */}
            <article className="analytics-kpi group">
              <div className="flex items-center justify-between mb-1">
                <small>{t("Clients in Period", "العملاء خلال الفترة")}</small>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
                  <IconUsers size={14} />
                </div>
              </div>
              <strong>{analyticsData.clients.length}</strong>
              <span className="meta">{t("Active accounts", "حسابات متفاعلة")}</span>
            </article>
          </section>

          {/* 2-Column Section Grid */}
          <section className="analytics-section-grid">
            {/* Card 1: Shipment Activity */}
            <article className="card analytics-card">
              <div className="card-head">
                <div>
                  <h2>{t("Shipment Activity", "نشاط الشحنات")}</h2>
                  <div className="meta">{t("Selected business records by period", "سجلات الأعمال المختارة حسب الفترة")}</div>
                </div>
              </div>
              <div className="card-body">
                {analyticsData.trendPoints.length === 0 ? (
                  <div className="analytics-empty">
                    {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
                  </div>
                ) : (
                  <div className="native-trend">
                    {(() => {
                      const maxVal = Math.max(1, ...analyticsData.trendPoints.map((p) => p.value));
                      return analyticsData.trendPoints.map((point) => (
                        <div key={point.key} className="trend-column">
                          <div className="trend-bars">
                            <i
                              className="trend-bar"
                              title={String(point.value)}
                              style={{ height: `${Math.max(3, (point.value / maxVal) * 100)}%` }}
                            />
                          </div>
                          <small>{point.label}</small>
                        </div>
                      ));
                    })()}
                  </div>
                )}
                <div className="chart-legend">
                  <span>{t("Shipments", "الشحنات")}</span>
                </div>
              </div>
            </article>

            {/* Card 2: Mode Mix */}
            <article className="card analytics-card">
              <div className="card-head">
                <div>
                  <h2>{t("Mode Mix", "توزيع وسائل الشحن")}</h2>
                  <div className="meta">{t("Selected shipments only", "الشحنات المختارة فقط")}</div>
                </div>
              </div>
              <div className="card-body">
                {(() => {
                  const entries = Object.entries(analyticsData.modes).filter(([, val]) => val > 0);
                  if (entries.length === 0) {
                    return (
                      <div className="analytics-empty">
                        {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
                      </div>
                    );
                  }
                  const maxVal = Math.max(...entries.map(([, val]) => val));
                  const total = entries.reduce((s, [, v]) => s + v, 0);
                  const modeName = (m: string) => {
                    if (m === "sea") return t("Sea", "بحري");
                    if (m === "air") return t("Air", "جوي");
                    if (m === "road") return t("Road", "بري");
                    return m;
                  };
                  return (
                    <div className="insight-bars">
                      {entries.map(([mode, count]) => (
                        <div key={mode} className="insight-row">
                          <span className="insight-row-label" title={modeName(mode)}>
                            {modeName(mode)}
                          </span>
                          <span className="insight-track">
                            <i style={{ width: `${(count / maxVal) * 100}%` }} />
                          </span>
                          <span className="insight-row-value">
                            {count} · {Math.round((count / total) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </article>

            {/* Card 3: Top Clients */}
            <article className="card analytics-card">
              <div className="card-head">
                <div>
                  <h2>{t("Top Clients", "أهم العملاء")}</h2>
                  <div className="meta">
                    {t(
                      "Ranked by shipment count; volume remains currency-grouped.",
                      "الترتيب حسب عدد الشحنات مع فصل حجم الأعمال حسب العملة."
                    )}
                  </div>
                </div>
              </div>
              <div className="card-body">
                {analyticsData.clients.length === 0 ? (
                  <div className="analytics-empty">
                    {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
                  </div>
                ) : (
                  <table className="analytics-ranking">
                    <thead>
                      <tr>
                        <th>{t("Client", "العميل")}</th>
                        <th>{t("Shipments", "الشحنات")}</th>
                        <th>{t("Business Volume", "حجم الأعمال")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.clients.slice(0, 6).map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.shipments}</td>
                          <td>
                            {Object.keys(item.volume).length === 0 ? (
                              t("Unavailable", "غير متاح")
                            ) : (
                              <span className="currency-lines">
                                {Object.entries(item.volume).map(([curr, val]) => (
                                  <span key={curr}>
                                    {curr} {Math.round(val).toLocaleString()}
                                  </span>
                                ))}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </article>

            {/* Card 4: Top Service Providers */}
            <article className="card analytics-card">
              <div className="card-head">
                <div>
                  <h2>{t("Top Service Providers", "أهم مقدمي الخدمة")}</h2>
                  <div className="meta">{t("Selected Provider offers only", "عروض مقدمي الخدمة المختارة فقط")}</div>
                </div>
              </div>
              <div className="card-body">
                {analyticsData.providers.length === 0 ? (
                  <div className="analytics-empty">
                    {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
                  </div>
                ) : (
                  <table className="analytics-ranking">
                    <thead>
                      <tr>
                        <th>{t("Provider", "مقدم الخدمة")}</th>
                        <th>{t("Won", "فاز")}</th>
                        <th>{t("Completed", "مكتمل")}</th>
                        <th>{t("Provider Volume", "حجم أعمال المقدم")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.providers.slice(0, 6).map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.won}</td>
                          <td>{item.completed}</td>
                          <td>
                            {Object.keys(item.volume).length === 0 ? (
                              t("Unavailable", "غير متاح")
                            ) : (
                              <span className="currency-lines">
                                {Object.entries(item.volume).map(([curr, val]) => (
                                  <span key={curr}>
                                    {curr} {Math.round(val).toLocaleString()}
                                  </span>
                                ))}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </article>

            {/* Card 5: Category Mix */}
            <article className="card analytics-card">
              <div className="card-head">
                <div>
                  <h2>{t("Category Mix", "توزيع الفئات")}</h2>
                  <div className="meta">{t("Existing stored categories only", "الفئات المخزنة الحالية فقط")}</div>
                </div>
              </div>
              <div className="card-body">
                {(() => {
                  const entries = Object.entries(analyticsData.categories).filter(([, val]) => val > 0);
                  if (entries.length === 0) {
                    return (
                      <div className="analytics-empty">
                        {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
                      </div>
                    );
                  }
                  const maxVal = Math.max(...entries.map(([, val]) => val));
                  const total = entries.reduce((s, [, v]) => s + v, 0);
                  const catLabel = (val: string) => {
                    const map: Record<string, string> = {
                      industrial: t("Industrial", "صناعي"),
                      agricultural: t("Agricultural", "زراعي"),
                      commercial: t("Commercial", "تجاري"),
                      medical: t("Medical", "طبي"),
                      other: t("Other", "أخرى"),
                    };
                    return map[val] || val;
                  };
                  return (
                    <div className="insight-bars">
                      {entries.map(([cat, count]) => (
                        <div key={cat} className="insight-row">
                          <span className="insight-row-label" title={catLabel(cat)}>
                            {catLabel(cat)}
                          </span>
                          <span className="insight-track">
                            <i style={{ width: `${(count / maxVal) * 100}%` }} />
                          </span>
                          <span className="insight-row-value">
                            {count} · {Math.round((count / total) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </article>

            {/* Card 6: Top Routes */}
            <article className="card analytics-card">
              <div className="card-head">
                <div>
                  <h2>{t("Top Routes", "أهم المسارات")}</h2>
                  <div className="meta">{t("Origin to destination country", "من دولة المنشأ إلى دولة الوجهة")}</div>
                </div>
              </div>
              <div className="card-body">
                {(() => {
                  const entries = Object.entries(analyticsData.routes).filter(([, val]) => val > 0);
                  if (entries.length === 0) {
                    return (
                      <div className="analytics-empty">
                        {t("Not enough data in this period.", "لا توجد بيانات كافية في هذه الفترة.")}
                      </div>
                    );
                  }
                  const maxVal = Math.max(...entries.map(([, val]) => val));
                  const total = entries.reduce((s, [, v]) => s + v, 0);
                  const countries: Record<string, { en: string; ar: string }> = {
                    EG: { en: "Egypt", ar: "مصر" },
                    CN: { en: "China", ar: "الصين" },
                    AE: { en: "United Arab Emirates", ar: "الإمارات" },
                    SA: { en: "Saudi Arabia", ar: "السعودية" },
                    DE: { en: "Germany", ar: "ألمانيا" },
                    TR: { en: "Türkiye", ar: "تركيا" },
                    IN: { en: "India", ar: "الهند" },
                    JO: { en: "Jordan", ar: "الأردن" },
                    US: { en: "United States", ar: "أمريكا" },
                    NL: { en: "Netherlands", ar: "هولندا" },
                  };
                  const routeLabel = (key: string) => {
                    const [orig, dest] = key.split("|");
                    const origName = countries[orig] ? (isArabic ? countries[orig].ar : countries[orig].en) : orig;
                    const destName = countries[dest] ? (isArabic ? countries[dest].ar : countries[dest].en) : dest;
                    return orig && dest ? `${origName} → ${destName}` : t("Route unavailable", "المسار غير متاح");
                  };
                  return (
                    <div className="insight-bars">
                      {entries.map(([rt, count]) => (
                        <div key={rt} className="insight-row">
                          <span className="insight-row-label" title={routeLabel(rt)}>
                            {routeLabel(rt)}
                          </span>
                          <span className="insight-track">
                            <i style={{ width: `${(count / maxVal) * 100}%` }} />
                          </span>
                          <span className="insight-row-value">
                            {count} · {Math.round((count / total) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </article>

            {/* Card 7: Current Network */}
            <article className="card analytics-card">
              <div className="card-head">
                <div>
                  <h2>{t("Current Network", "الشبكة الحالية")}</h2>
                  <div className="meta">
                    {t("Current account snapshot; not period-filtered.", "لقطة الحسابات الحالية؛ لا تتأثر بفلتر الفترة.")}
                  </div>
                </div>
              </div>
              <div className="card-body analytics-network">
                <div className="analytics-network-item">
                  <b>{clients.length}</b>
                  <small>{t("Total Clients", "إجمالي العملاء")}</small>
                </div>
                <div className="analytics-network-item">
                  <b>{clients.filter((c) => c.status === "approved").length}</b>
                  <small>{t("Active Clients", "العملاء النشطون")}</small>
                </div>
                <div className="analytics-network-item">
                  <b>{providers.length}</b>
                  <small>{t("Total Service Providers", "إجمالي مقدمي الخدمة")}</small>
                </div>
                <div className="analytics-network-item">
                  <b>{providers.filter((p) => p.status === "approved").length}</b>
                  <small>{t("Active Service Providers", "مقدمو الخدمة النشطون")}</small>
                </div>
              </div>
            </article>
          </section>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          TAB 3: مسار طلبات الأسعار (RFQ PIPELINE)
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "requests" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                {t("Quote Operations", "عمليات عروض الأسعار")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {t("RFQ Pipeline", "مسار طلبات الأسعار")}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  `${filteredRfqs.length} canonical records available.`,
                  `${filteredRfqs.length} سجل متاح في هذا المسار.`
                )}
              </p>
            </div>

            <button
              onClick={() => setShowAssistedModal(true)}
              className="btn-shine px-5 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <IconPlus size={16} />
              <span>{t("Create Request", "إنشاء طلب عرض سعر")}</span>
            </button>
          </div>

          {/* Stage Switcher Buttons Strip */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            {[
              { stage: "all" as const, label: t("All stages", "كل المراحل"), count: rfqs.length },
              { stage: "request" as const, label: t("Request", "طلب"), count: stageCounts.request },
              { stage: "rfq" as const, label: t("RFQ", "RFQ"), count: stageCounts.rfq },
              { stage: "offer" as const, label: t("Offer", "عرض"), count: stageCounts.offer },
              { stage: "quotation" as const, label: t("Quotation", "عرض سعر"), count: stageCounts.quotation },
              { stage: "approved" as const, label: t("Approved", "معتمد"), count: stageCounts.approved },
              { stage: "in_progress" as const, label: t("In Progress", "قيد التنفيذ"), count: stageCounts.in_progress },
              { stage: "history" as const, label: t("History", "السجل"), count: stageCounts.history },
            ].map((st) => (
              <button
                key={st.stage}
                type="button"
                onClick={() => setPipelineStageFilter(st.stage)}
                className={clsx(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer",
                  pipelineStageFilter === st.stage
                    ? "bg-white text-blue-600 shadow-xs border border-slate-200/80 scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                <span>{st.label}</span>
                <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-full font-bold", pipelineStageFilter === st.stage ? "bg-blue-50 text-blue-600" : "bg-slate-200/80 text-slate-600")}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="search-wrapper flex-1 w-full">
              <IconSearch size={16} />
              <input
                type="text"
                placeholder={t("Search by RFQ, route, or cargo…", "ابحث برقم الطلب أو المسار أو الشحنة…")}
                value={rfqSearchQuery}
                onChange={(e) => setRfqSearchQuery(e.target.value)}
                className="search w-full"
              />
            </div>
            <select
              value={rfqModeFilter}
              onChange={(e) => setRfqModeFilter(e.target.value)}
              className="w-full sm:w-48 rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">{t("All modes", "كل الوسائل")}</option>
              <option value="sea">{t("Sea Freight", "شحن بحري")}</option>
              <option value="air">{t("Air Cargo", "شحن جوي")}</option>
              <option value="road">{t("Road Trucking", "شحن بري")}</option>
              <option value="multimodal">{t("Multimodal", "متعدد الوسائط")}</option>
            </select>
          </div>

          {/* List of RFQs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {filteredRfqs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                {t("No records match this stage or filter.", "لا توجد سجلات مطابقة لهذه المرحلة أو الفلتر.")}
              </div>
            ) : (
              filteredRfqs.map((rfq) => {
                const badge = getStatusBadge(rfq);
                return (
                  <div
                    key={rfq.id}
                    className="p-5 hover:bg-blue-50/30 transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-blue-200 transition-all duration-200">
                        {getModeIcon(rfq.mode)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">{rfq.id}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-800">{rfq.clientCompany}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">{rfq.created}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 truncate mt-1 group-hover:text-blue-600 transition-colors">
                          {rfq.route}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{rfq.cargo} · {rfq.weight}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <span className={clsx("text-xs font-bold px-3 py-1 rounded-full border shadow-2xs", badge.cls)}>
                        {badge.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedRfq(rfq)}
                        className="group/btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-xs font-bold text-slate-700 transition duration-200 cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>{isArabic ? "فتح" : "Open"}</span>
                        <IconArrowRight size={13} className="text-slate-400 group-hover/btn:text-blue-600 rtl:rotate-180 transition-transform duration-200 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          TAB 4: طلبات التسجيل (REGISTRATION REQUESTS / KYC)
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "registrations" && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">
              {t("KYC Verification", "اعتماد الحسابات")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {t("Registration Requests", "طلبات التسجيل وتدقيق السجلات")}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                "Review onboarding documents and tax certificates before granting commercial access.",
                "مراجعة السجلات التجارية والبطاقات الضريبية والتراخيص قبل منح صلاحيات التسعير."
              )}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {/* Pending Clients */}
            {clients
              .filter((c) => c.status === "pending_approval")
              .map((c) => (
                <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                      <IconBuilding size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{c.company}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {t("Client Business", "عميل شركات")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{c.name} · {c.email} · {c.phone}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">Commercial Reg. Attached · Tax Card #482910</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleKycAction("clients", c.id, "blocked")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer active:scale-95"
                    >
                      <IconClose size={13} />
                      <span>{t("Reject", "رفض")}</span>
                    </button>
                    <button
                      onClick={() => handleKycAction("clients", c.id, "approved")}
                      className="btn-shine inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      <IconCheck size={14} strokeWidth={3} />
                      <span>{t("Approve Account", "اعتماد الحساب")}</span>
                    </button>
                  </div>
                </div>
              ))}

            {/* Pending Providers */}
            {providers
              .filter((p) => p.status === "pending_approval")
              .map((p) => (
                <div key={p.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                      <IconShield size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{p.company}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t("Carrier / Provider", "ناقل / مزود خدمة")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{p.name} · {p.email} · {p.phone}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{p.docs}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleKycAction("providers", p.id, "blocked")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer active:scale-95"
                    >
                      <IconClose size={13} />
                      <span>{t("Reject", "رفض")}</span>
                    </button>
                    <button
                      onClick={() => handleKycAction("providers", p.id, "approved")}
                      className="btn-shine inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      <IconCheck size={14} strokeWidth={3} />
                      <span>{t("Approve Account", "اعتماد الحساب")}</span>
                    </button>
                  </div>
                </div>
              ))}

            {pendingClientsCount === 0 && pendingProvidersCount === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                {t("No pending registration requests. All accounts are approved.", "لا توجد طلبات تسجيل معلقة. جميع الحسابات معتمدة.")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          TAB 5: مقدمو الخدمات (SERVICE PROVIDERS DIRECTORY)
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "providers" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                {t("Network", "الشبكة")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {t("Service Providers", "مقدمو الخدمة")}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t("Review provider profiles, registration status, and approved capabilities.", "راجع ملفات مقدمي الخدمة وحالة التسجيل والقدرات المعتمدة.")}
              </p>
            </div>

            <select
              value={providerClassFilter}
              onChange={(e) => setProviderClassFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white font-semibold text-slate-700"
            >
              <option value="">{t("All classifications", "كل التصنيفات")}</option>
              <option value="carrier">{t("Carrier", "ناقل")}</option>
              <option value="freight_forwarder">{t("Freight Forwarder", "وكيل شحن")}</option>
              <option value="agent">{t("Booking Agent", "وكيل حجز")}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers
              .filter((p) => !providerClassFilter || p.classification === providerClassFilter)
              .map((p) => (
                <div key={p.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between gap-4 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{p.company}</h3>
                        <span className="text-xs text-slate-400 capitalize">{p.classification} · {p.name}</span>
                      </div>
                      <span className={clsx("text-[10px] px-2.5 py-0.5 rounded-full font-bold border", p.status === "approved" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300")}>
                        {p.status === "approved" ? t("Approved", "معتمد") : t("Pending", "بانتظار الاعتماد")}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">{t("Approved capabilities", "القدرات المعتمدة")}</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {p.modes.map((m) => (
                            <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold text-[11px]">
                              {getModeIcon(m)}
                              <span>{m}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">{t("Coverage countries", "دول التغطية")}</span>
                        <span className="font-semibold text-slate-700">{p.countries.join(" · ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <IconStar size={14} className="text-amber-400 fill-amber-400" />
                      <span>{p.rating} / 5.0</span>
                    </span>
                    <button
                      onClick={() => handleKycAction("providers", p.id, p.status === "approved" ? "suspended" : "approved")}
                      className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer",
                        p.status === "approved"
                          ? "text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                          : "text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                      )}
                    >
                      {p.status === "approved" ? t("Suspend Account", "إيقاف مؤقت") : t("Approve", "اعتماد")}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          TAB 6: العملاء (CLIENT COMPANIES DIRECTORY)
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "clients" && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              {t("Accounts", "الحسابات")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {t("Client Companies", "شركات العملاء")}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t("Monthly usage, account status, and conversion controls.", "الاستخدام الشهري وحالة الحساب وأدوات التحكم في الحصص.")}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">{t("Company", "الشركة")}</th>
                  <th className="p-4">{t("Contact", "جهة الاتصال")}</th>
                  <th className="p-4">{t("Email", "البريد الإلكتروني")}</th>
                  <th className="p-4">{t("Monthly Use", "الاستخدام الشهري")}</th>
                  <th className="p-4">{t("Status", "الحالة")}</th>
                  <th className="p-4">{t("Limit Control", "التحكم في الحد")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                          {c.company.charAt(0)}
                        </div>
                        <span>{c.company}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{c.name}</td>
                    <td className="p-4 text-slate-500 font-mono">{c.email}</td>
                    <td className="p-4 font-semibold text-slate-700">
                      {c.limitEnabled ? `${c.used} / ${c.limit}` : t("Unlimited", "غير محدود")}
                    </td>
                    <td className="p-4">
                      <span className={clsx("px-2.5 py-0.5 rounded-full font-bold border text-[11px]", c.status === "approved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200")}>
                        {c.status === "approved" ? t("Active", "نشط") : t("Pending", "بانتظار الاعتماد")}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleClientLimitToggle(c.id, c.limitEnabled)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer active:scale-95 text-xs shadow-2xs"
                      >
                        {c.limitEnabled ? t("Deactivate limit", "إلغاء الحد") : t("Activate limit", "تفعيل الحد")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          TAB 7: المواقع والدول (LOCATIONS & COUNTRIES)
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "locations" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="heading flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t("Master data", "البيانات الرئيسية")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {t("Locations & Countries", "المواقع والدول")}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {t(
                  "One bilingual source of truth for requests, provider coverage, Admin workflows, and matching.",
                  "مصدر ثنائي اللغة للطلبات وتغطية مقدمي الخدمة ومسارات الإدارة والمطابقة."
                )}
              </p>
            </div>
            <div className="chips">
              <button
                type="button"
                className="btn ghost px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition flex items-center gap-1.5"
                onClick={() => {
                  setCountryForm({ id: "", nameEn: "", nameAr: "" });
                  setShowAddCountryModal(true);
                }}
              >
                <IconPlus size={14} />
                <span>{t("Add Country", "إضافة دولة")}</span>
              </button>
              <button
                type="button"
                className="btn-shine btn primary px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                onClick={() => {
                  setEditingLocation(null);
                  setLocationForm({
                    id: "",
                    nameEn: "",
                    nameAr: "",
                    countryId: countries[0]?.id || "EG",
                    type: "city",
                    code: "",
                  });
                  setShowLocationModal(true);
                }}
              >
                <IconPlus size={14} />
                <span>{t("Add Location", "إضافة موقع")}</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid stats">
            <div className="stat">
              <div className="lab">{t("Countries", "الدول")}</div>
              <div className="num">{countries.length}</div>
              <div className="sub">
                {countries.filter((x) => x.active).length} {t("active", "نشطة")}
              </div>
            </div>
            <div className="stat">
              <div className="lab">{t("Locations", "المواقع")}</div>
              <div className="num">{locations.length}</div>
              <div className="sub">{t("Stable internal IDs", "معرّفات داخلية ثابتة")}</div>
            </div>
            <div className="stat">
              <div className="lab">{t("Ports", "الموانئ")}</div>
              <div className="num">{locations.filter((x) => x.type === "port").length}</div>
              <div className="sub">{t("Mode-aware ordering", "ترتيب حسب وسيلة الشحن")}</div>
            </div>
            <div className="stat">
              <div className="lab">{t("Airports", "المطارات")}</div>
              <div className="num">{locations.filter((x) => x.type === "airport").length}</div>
              <div className="sub">{t("Arabic + English labels", "أسماء عربية وإنجليزية")}</div>
            </div>
          </div>

          {/* Country Directory Card */}
          <section className="card country-directory">
            <div className="card-head">
              <div>
                <h2>{t("Countries", "الدول")}</h2>
                <div className="meta">
                  {t(
                    "Canonical country IDs used throughout the platform.",
                    "معرّفات الدول المعتمدة والمستخدمة في جميع أجزاء المنصة."
                  )}
                </div>
              </div>
            </div>
            <div className="country-roster">
              {countries.map((country) => (
                <span key={country.id} className="country-roster-item">
                  <span className="country-flag" aria-hidden="true">
                    {countryFlag(country.id)}
                  </span>
                  <b>{isArabic ? country.nameAr : country.nameEn}</b>
                  <small>{country.id}</small>
                </span>
              ))}
            </div>
          </section>

          {/* Shared Location Records Card */}
          <div className="card location-records">
            <div className="card-head">
              <h2>{t("Shared location records", "سجلات المواقع المشتركة")}</h2>
              <div className="search-wrapper max-w-md">
                <IconSearch size={16} />
                <input
                  className="search w-full"
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder={t(
                    "Search ID, Arabic, English, country, or code…",
                    "ابحث بالمعرّف أو الاسم العربي أو الإنجليزي أو الدولة أو الرمز…"
                  )}
                />
              </div>
            </div>
            <div className="table-scroll overflow-x-auto">
              <table className="metric-table location-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>English</th>
                    <th>العربية</th>
                    <th>{t("Country", "الدولة")}</th>
                    <th>{t("Type", "النوع")}</th>
                    <th>{t("Code", "الرمز")}</th>
                    <th>{t("Status", "الحالة")}</th>
                    <th className="text-end">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((x) => (
                    <tr key={x.id}>
                      <td>
                        <b className="technical-id">{x.id}</b>
                      </td>
                      <td>{x.nameEn}</td>
                      <td dir="rtl">{x.nameAr}</td>
                      <td>
                        <span className="country-inline">
                          <span className="country-flag" aria-hidden="true">
                            {countryFlag(x.countryId)}
                          </span>
                          <span>{countryLabel(x.countryId)}</span>
                          <small>{x.countryId}</small>
                        </span>
                      </td>
                      <td>
                        <span className="type-pill">{locationTypeLabel(x.type)}</span>
                      </td>
                      <td>
                        <span className="technical-id">{x.code || "—"}</span>
                      </td>
                      <td>
                        <span className="master-status">
                          <i className={`master-dot ${x.active ? "" : "off"}`} />
                          {x.active ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                            onClick={() => {
                              setEditingLocation(x);
                              setLocationForm({
                                id: x.id,
                                nameEn: x.nameEn,
                                nameAr: x.nameAr,
                                countryId: x.countryId,
                                type: x.type,
                                code: x.code || "",
                              });
                              setShowLocationModal(true);
                            }}
                          >
                            <span className="flex items-center gap-1">
                              <IconEdit size={12} className="text-blue-600" />
                              <span>{t("Edit", "تعديل")}</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                            onClick={async () => {
                              try {
                                await toggleMasterLocation(x.id, x.active);
                              } catch (err) {
                                console.error("Toggle location error:", err);
                              }
                            }}
                          >
                            {x.active ? t("Deactivate", "إيقاف") : t("Activate", "تفعيل")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLocations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                        {t("No locations match your search query.", "لا توجد مواقع مطابقة لبحثك.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Country Modal */}
          {showAddCountryModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {t("Add Country", "إضافة دولة")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddCountryModal(false)}
                    className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
                  >
                    <IconClose size={18} />
                  </button>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!countryForm.id.trim() || !countryForm.nameEn.trim() || !countryForm.nameAr.trim()) return;
                    try {
                      await addMasterCountry({
                        id: countryForm.id.trim().toUpperCase(),
                        nameEn: countryForm.nameEn.trim(),
                        nameAr: countryForm.nameAr.trim(),
                        active: true,
                      });
                      setShowAddCountryModal(false);
                      setActionSuccessMsg(t("Country added successfully", "تمت إضافة الدولة بنجاح"));
                      setTimeout(() => setActionSuccessMsg(null), 3000);
                    } catch (err) {
                      console.error("Add country error:", err);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Country ID", "رمز الدولة (ISO)")} *
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      value={countryForm.id}
                      onChange={(e) => setCountryForm({ ...countryForm, id: e.target.value.toUpperCase() })}
                      placeholder="e.g. IT"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl uppercase font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("English Name", "الاسم بالإنجليزية")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={countryForm.nameEn}
                      onChange={(e) => setCountryForm({ ...countryForm, nameEn: e.target.value })}
                      placeholder="e.g. Italy"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Arabic Name", "الاسم بالعربية")} *
                    </label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      value={countryForm.nameAr}
                      onChange={(e) => setCountryForm({ ...countryForm, nameAr: e.target.value })}
                      placeholder="مثال: إيطاليا"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-right"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddCountryModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      {t("Cancel", "إلغاء")}
                    </button>
                    <button
                      type="submit"
                      className="btn-shine px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl cursor-pointer shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                    >
                      <IconPlus size={14} />
                      <span>{t("Add country", "إضافة دولة")}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add / Edit Location Modal */}
          {showLocationModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingLocation ? t("Edit Location", "تعديل الموقع") : t("Add Location", "إضافة موقع")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(false)}
                    className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
                  >
                    <IconClose size={18} />
                  </button>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!locationForm.id.trim() || !locationForm.nameEn.trim() || !locationForm.nameAr.trim()) return;
                    try {
                      if (editingLocation) {
                        await updateMasterLocation({
                          ...editingLocation,
                          nameEn: locationForm.nameEn.trim(),
                          nameAr: locationForm.nameAr.trim(),
                          countryId: locationForm.countryId,
                          type: locationForm.type,
                          code: locationForm.code.trim().toUpperCase() || "",
                        });
                        setActionSuccessMsg(t("Location updated successfully", "تم تحديث الموقع بنجاح"));
                      } else {
                        await addMasterLocation({
                          id: locationForm.id.trim().toUpperCase(),
                          nameEn: locationForm.nameEn.trim(),
                          nameAr: locationForm.nameAr.trim(),
                          countryId: locationForm.countryId,
                          type: locationForm.type,
                          code: locationForm.code.trim().toUpperCase() || "",
                          active: true,
                        });
                        setActionSuccessMsg(t("Location added successfully", "تمت إضافة الموقع بنجاح"));
                      }
                      setShowLocationModal(false);
                      setTimeout(() => setActionSuccessMsg(null), 3000);
                    } catch (err) {
                      console.error("Save location error:", err);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Stable Location ID", "معرّف الموقع الثابت")} *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingLocation}
                      value={locationForm.id}
                      onChange={(e) => setLocationForm({ ...locationForm, id: e.target.value.toUpperCase() })}
                      placeholder="e.g. IT-MIL"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl uppercase font-mono font-bold disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t("English name", "الاسم بالإنجليزية")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={locationForm.nameEn}
                        onChange={(e) => setLocationForm({ ...locationForm, nameEn: e.target.value })}
                        placeholder="e.g. Milan"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t("Arabic name", "الاسم بالعربية")} *
                      </label>
                      <input
                        type="text"
                        required
                        dir="rtl"
                        value={locationForm.nameAr}
                        onChange={(e) => setLocationForm({ ...locationForm, nameAr: e.target.value })}
                        placeholder="مثال: ميلانو"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t("Country", "الدولة")} *
                      </label>
                      <select
                        required
                        value={locationForm.countryId}
                        onChange={(e) => setLocationForm({ ...locationForm, countryId: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>
                            {countryFlag(c.id)} {isArabic ? c.nameAr : c.nameEn} ({c.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t("Location Type", "نوع الموقع")} *
                      </label>
                      <select
                        required
                        value={locationForm.type}
                        onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="city">{t("City", "مدينة")}</option>
                        <option value="port">{t("Port", "ميناء")}</option>
                        <option value="airport">{t("Airport", "مطار")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t("Optional code", "رمز اختياري")}
                    </label>
                    <input
                      type="text"
                      value={locationForm.code}
                      onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value.toUpperCase() })}
                      placeholder="UN/LOCODE or IATA, e.g. MIL"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl uppercase font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      {t("Cancel", "إلغاء")}
                    </button>
                    <button
                      type="submit"
                      className="btn-shine px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl cursor-pointer shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                    >
                      <IconCheck size={14} strokeWidth={2.5} />
                      <span>{t("Save Location", "حفظ الموقع")}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          TAB 8: أدوات بيانات العرض (DEMO CONTROLS)
      ═════════════════════════════════════════════════════ */}
      {!selectedRfq && activeTab === "demo" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="heading">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {t("Demo data tools", "أدوات بيانات العرض")}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  "Restore repeatable test scenarios without changing the current viewport.",
                  "استعد سيناريوهات الاختبار دون تغيير حجم الشاشة الحالي."
                )}
              </p>
            </div>
          </div>

          {/* Yellow Info Notice */}
          <div className="notice flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <IconSparkles size={18} />
            </div>
            <div>
              {t(
                "Every reset asks for confirmation and explains the exact records it will change.",
                "كل إعادة ضبط تطلب تأكيداً وتوضح البيانات التي ستتغير."
              )}
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Card 1: Application reset (إعادة ضبط التطبيق) */}
            <div className="card bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="card-head p-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  {t("Application reset", "إعادة ضبط التطبيق")}
                </h2>
              </div>
              <div className="card-body p-5 space-y-4">
                <div>
                  <b className="block text-sm font-bold text-slate-900">
                    {t("Reset Entire Demo", "إعادة ضبط التجربة بالكامل")}
                  </b>
                  <p className="meta text-xs text-slate-500 mt-1">
                    {t(
                      "Restore seeded clients, providers, RFQs, quotations, selections, usage counters, statuses, and settings.",
                      "استعادة العملاء ومقدمي الخدمة والطلبات والعروض والاختيارات والعدادات والحالات والإعدادات الأصلية."
                    )}
                  </p>
                  <button
                    type="button"
                    className="btn-shine btn primary mt-3 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-md shadow-blue-500/25 flex items-center gap-2"
                    onClick={() =>
                      setConfirmModal({
                        type: "entire",
                        title: t("Reset entire demo?", "إعادة ضبط التجربة بالكامل؟"),
                        description: t(
                          "All clients, providers, RFQs, quotations, selections, monthly usage, account statuses, capabilities, and demo settings will return to the original seeded state.",
                          "استعادة العملاء ومقدمي الخدمة والطلبات والعروض والاختيارات والعدادات والحالات والإعدادات الأصلية بالكامل."
                        ),
                      })
                    }
                  >
                    {t("Reset entire demo", "إعادة ضبط التجربة بالكامل")}
                  </button>
                </div>

                <div className="divider" />

                <div>
                  <b className="block text-sm font-bold text-slate-900">
                    {t("Reset All Client Limits", "إعادة ضبط حدود كل العملاء")}
                  </b>
                  <p className="meta text-xs text-slate-500 mt-1">
                    {t(
                      "Set monthly usage to zero for all clients. All other records remain unchanged.",
                      "تصفير الاستخدام الشهري لكل العملاء مع إبقاء كل البيانات الأخرى دون تغيير."
                    )}
                  </p>
                  <button
                    type="button"
                    className="btn ghost mt-3 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl font-bold text-xs cursor-pointer transition"
                    onClick={() =>
                      setConfirmModal({
                        type: "all-clients",
                        title: t("Reset all client limits?", "إعادة ضبط حدود كل العملاء؟"),
                        description: t(
                          "Monthly usage will be set to 0 for every client. RFQs, quotations, profiles, statuses, and all other data will remain unchanged.",
                          "تصفير الاستخدام الشهري لكل العملاء مع إبقاء كل البيانات الأخرى دون تغيير."
                        ),
                      })
                    }
                  >
                    {t("Reset all client limits", "إعادة ضبط حدود كل العملاء")}
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Client monthly usage (الاستخدام الشهري للعملاء) */}
            <div className="card bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="card-head p-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  {t("Client monthly usage", "الاستخدام الشهري للعملاء")}
                </h2>
              </div>
              <div className="card-body p-5 space-y-3">
                {clients.map((c) => (
                  <div key={c.id} className="provider-card">
                    <span>
                      <b>{c.company || c.name}</b>
                      <span className="meta">
                        {isArabic
                          ? `${c.used} من ${c.limit} مستخدم`
                          : `${c.used} of ${c.limit} used`}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="btn ghost small px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition"
                      onClick={() =>
                        setConfirmModal({
                          type: "client",
                          id: c.id,
                          title: isArabic
                            ? `إعادة ضبط استخدام ${c.company || c.name}؟`
                            : `Reset ${c.company || c.name} usage?`,
                          description: t(
                            "This client’s monthly non-converted request usage will be set to 0. Their RFQs, account status, verification, and allowance limit will remain unchanged.",
                            "تصفير الاستخدام الشهري لهذا العميل مع إبقاء حسابه وطلباته دون تغيير."
                          ),
                        })
                      }
                    >
                      {t("Reset", "إعادة ضبط")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 (Bottom): Reset a seeded RFQ (إعادة ضبط طلب تجريبي) */}
          <div className="card bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="card-head p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {t("Reset a seeded RFQ", "إعادة ضبط طلب تجريبي")}
                </h2>
                <span className="meta text-xs text-slate-500">
                  {t(
                    "Restore status, dispatch, quotations, markup, and selection",
                    "استعادة الحالة والإرسال والعروض والهامش والاختيار"
                  )}
                </span>
              </div>
            </div>
            <div className="card-body p-5 space-y-3">
              {[
                {
                  id: "RFQ-1048",
                  route: "Shanghai Port, CN → Alexandria Port, EG",
                  seedStatus: "offers_sent",
                },
                {
                  id: "RFQ-1049",
                  route: "Frankfurt Airport, DE → Cairo International Airport, EG",
                  seedStatus: "quotes_received",
                },
                {
                  id: "RFQ-1050",
                  route: "Dubai, AE → Riyadh, SA",
                  seedStatus: "admin_review",
                },
                {
                  id: "RFQ-1051",
                  route: "Shenzhen, CN → Giza, EG",
                  seedStatus: "draft",
                },
              ].map((seed) => {
                const current = rfqs.find((r) => r.id === seed.id);
                const getStatusText = (st?: string) => {
                  const map: Record<string, { en: string; ar: string }> = {
                    offers_sent: { en: "Offers Sent", ar: "تم إرسال العروض" },
                    quotes_received: { en: "Quotes Received", ar: "تم استلام العروض" },
                    admin_review: { en: "Admin Review", ar: "مراجعة الإدارة" },
                    draft: { en: "Draft", ar: "مسودة" },
                    matching: { en: "Matching", ar: "جاري المطابقة" },
                    dispatched: { en: "Dispatched", ar: "تم الإرسال للناقلين" },
                    selected: { en: "Selected", ar: "تم الاختيار" },
                    in_progress: { en: "In Progress", ar: "قيد التنفيذ" },
                    completed: { en: "Completed", ar: "مكتمل" },
                  };
                  return map[st || ""] ? (isArabic ? map[st!].ar : map[st!].en) : st || "—";
                };

                const currentText = current ? getStatusText(current.status) : t("Missing", "مفقود");
                const seedText = getStatusText(seed.seedStatus);

                return (
                  <div key={seed.id} className="provider-card">
                    <div>
                      <b>{seed.id} · {seed.route}</b>
                      <span className="meta">
                        {t("Current: ", "الحالي: ")}
                        {currentText} · {t("Seed: ", "الأساسي: ")}
                        {seedText}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn ghost small px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition whitespace-nowrap"
                      onClick={() =>
                        setConfirmModal({
                          type: "rfq",
                          id: seed.id,
                          title: isArabic
                            ? `إعادة ضبط الطلب-${seed.id.replace("RFQ-", "")}؟`
                            : `Reset ${seed.id}?`,
                          description: `This RFQ’s seeded status, provider dispatches, quotations, markup values, sent offers, and client selection will be restored. Other RFQs and account counters will remain unchanged.`,
                        })
                      }
                    >
                      {t("Reset RFQ", "إعادة ضبط الطلب")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmation Modal */}
          {confirmModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    {confirmModal.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
                  >
                    <IconClose size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="notice">
                    <b className="block mb-1">
                      {t("This action changes demo data.", "هذا الإجراء يغير بيانات العرض.")}
                    </b>
                    <div className="text-xs leading-relaxed opacity-90">
                      {confirmModal.description}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t(
                      "This cannot be undone except by resetting the entire seeded demo.",
                      "لا يمكن التراجع عن هذا الإجراء إلا بإعادة ضبط التجربة بالكامل."
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    {t("Cancel", "إلغاء")}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="btn-shine px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl cursor-pointer shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                  >
                    <IconRefresh size={14} />
                    <span>{t("Confirm reset", "تأكيد إعادة الضبط")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAssistedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {t("Internal Workflow", "إجراء داخلي للإدارة")}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {t("Create RFQ for a Client", "إنشاء طلب عرض سعر لعميل")}
                </h3>
              </div>
              <button
                onClick={() => setShowAssistedModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition"
              >
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleAssistedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Select Client Account *", "اختر حساب العميل *")}
                </label>
                <select
                  value={assistedClient}
                  onChange={(e) => setAssistedClient(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white font-semibold"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name}) · {c.clientType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("Transport Mode *", "وسيلة النقل *")}
                  </label>
                  <select
                    value={assistedMode}
                    onChange={(e) => setAssistedMode(e.target.value as ShipmentMode)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white font-semibold"
                  >
                    <option value="sea">{t("Sea Freight", "شحن بحري")}</option>
                    <option value="air">{t("Air Cargo", "شحن جوي")}</option>
                    <option value="road">{t("Road Freight", "شحن بري")}</option>
                    <option value="multimodal">{t("Multimodal", "متعدد الوسائط")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("Cargo Weight *", "الوزن الإجمالي *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={assistedWeight}
                    onChange={(e) => setAssistedWeight(e.target.value)}
                    placeholder="e.g. 10,000 kg"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Origin (Pick-up) *", "مكان التحرك / الاستلام *")}
                </label>
                <input
                  type="text"
                  required
                  value={assistedOrigin}
                  onChange={(e) => setAssistedOrigin(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Destination (Delivery) *", "مكان الوصول / التسليم *")}
                </label>
                <input
                  type="text"
                  required
                  value={assistedDestination}
                  onChange={(e) => setAssistedDestination(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("Cargo Description *", "وصف البضاعة *")}
                </label>
                <input
                  type="text"
                  required
                  value={assistedCargo}
                  onChange={(e) => setAssistedCargo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssistedModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t("Cancel", "إلغاء")}
                </button>
                <button
                  type="submit"
                  className="btn-shine px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <IconSparkles size={15} />
                  <span>{t("Submit Assisted Request", "إنشاء وتأكيد الطلب")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

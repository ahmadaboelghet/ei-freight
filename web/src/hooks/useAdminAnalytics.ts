import { useMemo } from "react";
import { RfqRecord } from "../types/domain";

export interface AnalyticsRecordEntry {
  r: RfqRecord;
  date: Date;
}

export interface AnalyticsClientEntry {
  id: string;
  name: string;
  shipments: number;
  volume: Record<string, number>;
}

export interface AnalyticsProviderEntry {
  id: string;
  name: string;
  won: number;
  completed: number;
  volume: Record<string, number>;
}

export interface AnalyticsTrendPoint {
  key: string;
  label: string;
  value: number;
}

export interface AdminAnalyticsData {
  selectedRecords: AnalyticsRecordEntry[];
  volume: Record<string, number>;
  profit: Record<string, number>;
  shipments: number;
  completed: number;
  inProgress: number;
  clients: AnalyticsClientEntry[];
  providers: AnalyticsProviderEntry[];
  categories: Record<string, number>;
  modes: Record<string, number>;
  routes: Record<string, number>;
  trendPoints: AnalyticsTrendPoint[];
}

interface UseAdminAnalyticsOptions {
  rfqs: RfqRecord[];
  analyticsTimePreset: string;
  analyticsMonth: string;
  analyticsYear: number;
  analyticsFromDate: string;
  analyticsToDate: string;
  isArabic: boolean;
}

export function useAdminAnalytics({
  rfqs,
  analyticsTimePreset,
  analyticsMonth,
  analyticsYear,
  analyticsFromDate,
  analyticsToDate,
  isArabic,
}: UseAdminAnalyticsOptions): {
  isDailyTrend: boolean;
  analyticsData: AdminAnalyticsData;
} {
  const isDailyTrend = useMemo(() => {
    if (["current_month", "previous_month", "specific_month"].includes(analyticsTimePreset)) {
      return true;
    }
    if (analyticsTimePreset === "custom_range" && analyticsFromDate && analyticsToDate) {
      const diffDays =
        (new Date(analyticsToDate).getTime() - new Date(analyticsFromDate).getTime()) / 86400000;
      return diffDays <= 62;
    }
    return false;
  }, [analyticsTimePreset, analyticsFromDate, analyticsToDate]);

  const analyticsData = useMemo(() => {
    const isSelected = (r: RfqRecord) => {
      return (
        r.selectedQuoteId !== undefined ||
        r.selectedQuote !== undefined ||
        ["selected", "awarded", "in_progress", "completed", "history"].includes(r.status) ||
        ["approved", "in_progress", "history"].includes(r.stage)
      );
    };

    const matchesFilter = (date: Date | null) => {
      if (analyticsTimePreset === "all") return true;
      if (!date || isNaN(date.getTime())) return false;
      const now = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();

      if (analyticsTimePreset === "current_month") {
        return year === now.getFullYear() && month === now.getMonth();
      }
      if (analyticsTimePreset === "previous_month") {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return year === prev.getFullYear() && month === prev.getMonth();
      }
      if (analyticsTimePreset === "current_year") {
        return year === now.getFullYear();
      }
      if (analyticsTimePreset === "previous_year") {
        return year === now.getFullYear() - 1;
      }
      if (analyticsTimePreset === "specific_month") {
        if (!analyticsMonth) return true;
        const [tYear, tMonth] = analyticsMonth.split("-").map(Number);
        return year === tYear && month === tMonth - 1;
      }
      if (analyticsTimePreset === "specific_year") {
        return !analyticsYear || year === analyticsYear;
      }
      if (analyticsTimePreset === "custom_range") {
        const from = analyticsFromDate ? new Date(`${analyticsFromDate}T00:00:00`) : null;
        const to = analyticsToDate ? new Date(`${analyticsToDate}T23:59:59.999`) : null;
        return (!from || date >= from) && (!to || date <= to);
      }
      return true;
    };

    const selectedRecords: { r: RfqRecord; date: Date }[] = [];
    rfqs.forEach((r) => {
      if (!isSelected(r)) return;
      const d = r.completedAt
        ? new Date(r.completedAt)
        : r.createdAt
        ? new Date(r.createdAt)
        : r.created
        ? new Date(r.created)
        : null;
      if (matchesFilter(d)) {
        selectedRecords.push({ r, date: d || new Date() });
      }
    });

    const volume: Record<string, number> = {};
    const profit: Record<string, number> = {};
    const clientMap = new Map<
      string,
      { id: string; name: string; shipments: number; volume: Record<string, number> }
    >();
    const providerMap = new Map<
      string,
      { id: string; name: string; won: number; completed: number; volume: Record<string, number> }
    >();
    const categories: Record<string, number> = {};
    const modes: Record<string, number> = {};
    const routes: Record<string, number> = {};
    let completedCount = 0;
    let inProgressCount = 0;

    selectedRecords.forEach(({ r }) => {
      const stage =
        r.stage ||
        (r.status === "completed"
          ? "history"
          : r.status === "in_progress"
          ? "in_progress"
          : "approved");
      if (stage === "history") completedCount++;
      if (stage === "in_progress") inProgressCount++;

      const quote =
        r.selectedQuote ||
        (r.quotes || []).find((q) => q.id === r.selectedQuoteId || q.status === "selected") ||
        null;
      const sellingPrice = quote?.sellingPrice ?? quote?.totalPrice ?? null;
      const carrierCost = quote?.totalPrice ?? null;
      const currency = quote?.currency || "USD";

      const clientId = r.client || r.clientCompany || r.clientName || "Client";
      const clientName = r.clientCompany || r.clientName || clientId;
      const cEntry =
        clientMap.get(clientId) || { id: clientId, name: clientName, shipments: 0, volume: {} };
      cEntry.shipments++;
      if (sellingPrice !== null) {
        cEntry.volume[currency] = (cEntry.volume[currency] || 0) + sellingPrice;
        volume[currency] = (volume[currency] || 0) + sellingPrice;
      }
      clientMap.set(clientId, cEntry);

      if (sellingPrice !== null && carrierCost !== null && quote?.providerId) {
        const pDiff = sellingPrice - carrierCost;
        profit[currency] = (profit[currency] || 0) + pDiff;
      }

      const m = (r.actualTransportMode || r.mode || "sea").toLowerCase();
      modes[m] = (modes[m] || 0) + 1;

      const cat = (r.cargo || "commercial").toLowerCase();
      const normCat = cat.includes("medic")
        ? "medical"
        : cat.includes("agri") || cat.includes("food")
        ? "agricultural"
        : cat.includes("indus")
        ? "industrial"
        : "commercial";
      categories[normCat] = (categories[normCat] || 0) + 1;

      const origCode = (r.originCode || "EG").slice(0, 2).toUpperCase();
      const destCode = (r.destinationCode || "AE").slice(0, 2).toUpperCase();
      const routeKey = `${origCode}|${destCode}`;
      routes[routeKey] = (routes[routeKey] || 0) + 1;

      if (quote?.providerId) {
        const provId = quote.providerId;
        const provName = quote.providerCompany || quote.providerName || provId;
        const pEntry =
          providerMap.get(provId) || { id: provId, name: provName, won: 0, completed: 0, volume: {} };
        pEntry.won++;
        if (stage === "history") pEntry.completed++;
        if (carrierCost !== null) {
          pEntry.volume[currency] = (pEntry.volume[currency] || 0) + carrierCost;
        }
        providerMap.set(provId, pEntry);
      }
    });

    const trendBuckets: Record<string, number> = {};
    selectedRecords.forEach(({ date }) => {
      const key = isDailyTrend
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
            date.getDate()
          ).padStart(2, "0")}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      trendBuckets[key] = (trendBuckets[key] || 0) + 1;
    });

    const trendPoints = Object.entries(trendBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const parts = key.split("-").map(Number);
        const d = new Date(parts[0], parts[1] - 1, isDailyTrend ? parts[2] : 1);
        const label = new Intl.DateTimeFormat(
          isArabic ? "ar-EG" : "en-GB",
          isDailyTrend ? { day: "numeric", month: "short" } : { month: "short", year: "2-digit" }
        ).format(d);
        return { key, label, value };
      });

    return {
      selectedRecords,
      volume,
      profit,
      shipments: selectedRecords.length,
      completed: completedCount,
      inProgress: inProgressCount,
      clients: Array.from(clientMap.values()).sort((a, b) => b.shipments - a.shipments),
      providers: Array.from(providerMap.values()).sort((a, b) => b.won - a.won),
      categories,
      modes,
      routes,
      trendPoints,
    };
  }, [
    rfqs,
    analyticsTimePreset,
    analyticsMonth,
    analyticsYear,
    analyticsFromDate,
    analyticsToDate,
    isDailyTrend,
    isArabic,
  ]);

  return { isDailyTrend, analyticsData };
}

/**
 * @file src/components/forms/rfq/RfqCargoModeDetailsSection.tsx
 * @description Step 1.7: Comprehensive Cargo Information & Mode-Specific Specifications
 *              (Sea FCL/LCL, Air, Road FTL/LTL, Multimodal legs, DG/MSDS, Refrigerated/Temperature).
 */

import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  CanonicalShipmentCommon,
  CanonicalShipmentSpecific,
  DimensionSet,
  FclContainerRow,
  CanonicalMsds,
} from "../../../types/domain";
import {
  FCL_CONTAINER_CATALOG,
  calculateAirWeights,
  stableDimensionId,
} from "./rfqLogic";
import { IconPlus, IconShip, IconPlane, IconTruck } from "../../ui/Icons";

interface RfqCargoModeDetailsSectionProps {
  common: CanonicalShipmentCommon;
  specific: CanonicalShipmentSpecific;
  mode: string;
  msdsList: CanonicalMsds[];
  onChangeCommon: (updates: Partial<CanonicalShipmentCommon>) => void;
  onChangeSpecific: (updates: Partial<CanonicalShipmentSpecific>) => void;
  onUpdateMsds: (files: FileList | null) => void;
  onRemoveMsds: (id: string) => void;
}

export function RfqCargoModeDetailsSection({
  common,
  specific,
  mode,
  msdsList,
  onChangeCommon,
  onChangeSpecific,
  onUpdateMsds,
  onRemoveMsds,
}: RfqCargoModeDetailsSectionProps) {
  const { t, isArabic } = useLanguage();

  const isSea = mode === "sea";
  const isSeaFcl = isSea && specific.shipmentType === "fcl";
  const isSeaLcl = isSea && specific.shipmentType === "lcl";
  const isAir = mode === "air";
  const isRoad = mode === "road";
  const isRoadFtl = isRoad && specific.shipmentType === "ftl";
  const isRoadLtl = isRoad && specific.shipmentType === "ltl";

  const todayStr = new Date().toISOString().split("T")[0];

  // ── Dimension Set Handlers ──
  function handleAddDimension(containerIndex?: number) {
    const newDim: DimensionSet = {
      id: stableDimensionId(),
      length: "",
      width: "",
      height: "",
      unit: "cm",
    };

    if (containerIndex !== undefined && specific.containers) {
      const updated = [...specific.containers];
      const row = { ...updated[containerIndex] };
      row.dimensions = [...(row.dimensions || []), newDim];
      updated[containerIndex] = row;
      onChangeSpecific({ containers: updated });
    } else {
      const current = specific.dimensions || [];
      onChangeSpecific({ dimensions: [...current, newDim] });
    }
  }

  function handleRemoveDimension(dimId: string, containerIndex?: number) {
    if (containerIndex !== undefined && specific.containers) {
      const updated = [...specific.containers];
      const row = { ...updated[containerIndex] };
      row.dimensions = (row.dimensions || []).filter((d) => d.id !== dimId);
      updated[containerIndex] = row;
      onChangeSpecific({ containers: updated });
    } else {
      const updated = (specific.dimensions || []).filter((d) => d.id !== dimId);
      onChangeSpecific({ dimensions: updated });
    }
  }

  function handleChangeDimension(
    dimId: string,
    field: keyof DimensionSet,
    val: string,
    containerIndex?: number
  ) {
    if (containerIndex !== undefined && specific.containers) {
      const updated = [...specific.containers];
      const row = { ...updated[containerIndex] };
      row.dimensions = (row.dimensions || []).map((d) =>
        d.id === dimId ? { ...d, [field]: val } : d
      );
      updated[containerIndex] = row;
      onChangeSpecific({ containers: updated });
    } else {
      const updated = (specific.dimensions || []).map((d) =>
        d.id === dimId ? { ...d, [field]: val } : d
      );
      onChangeSpecific({ dimensions: updated });
    }
  }

  // ── Container Row Handlers (Sea FCL) ──
  function handleAddContainerRow() {
    const current = specific.containers || [];
    const usedTypes = current.map((c) => c.type);
    const nextType = FCL_CONTAINER_CATALOG.find((t) => !usedTypes.includes(t)) || "Other";
    const newRow: FclContainerRow = {
      containerLineId: `CONTAINER-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type: nextType,
      quantity: 1,
      otherType: "",
      dimensions: [{ id: stableDimensionId(), length: "", width: "", height: "", unit: "cm" }],
    };
    onChangeSpecific({ containers: [...current, newRow] });
  }

  function handleRemoveContainerRow(index: number) {
    const current = specific.containers || [];
    if (current.length <= 1) return;
    onChangeSpecific({ containers: current.filter((_, i) => i !== index) });
  }

  function handleChangeContainerRow(index: number, updates: Partial<FclContainerRow>) {
    const current = specific.containers || [];
    const updated = current.map((c, i) => (i === index ? { ...c, ...updates } : c));
    onChangeSpecific({ containers: updated });
  }

  // Air Weights
  const airWeights = isAir
    ? calculateAirWeights(specific.grossWeight || "", specific.dimensions || [])
    : null;

  return (
    <section className="space-y-6 pt-4 border-t border-slate-100">
      {/* ── 1.7 Cargo Information Header ── */}
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
          7
        </span>
        <div>
          <h3 className="text-sm font-black text-slate-900">
            {t("Cargo Information & Specifications", "بيانات ومواصفات البضاعة")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("Describe the shipment and handling requirements", "وصف البضاعة وطبيعتها وشروط مناولتها")}
          </p>
        </div>
      </div>

      {/* Common Cargo Description, HS Code, Ready Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("Commodity / Cargo Description *", "وصف البضاعة / نوع الشحنة *")}
          </label>
          <input
            type="text"
            required
            value={common.cargo || ""}
            onChange={(e) => onChangeCommon({ cargo: e.target.value })}
            placeholder={t("e.g. Industrial machinery parts, cotton garments…", "مثال: قطع غيار معدات صناعية، منسوجات قطنية…")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("HS Code (Optional)", "بند التعريفة الجمركية HS Code (اختياري)")}
          </label>
          <input
            type="text"
            value={common.hsCode || ""}
            onChange={(e) => onChangeCommon({ hsCode: e.target.value })}
            placeholder="e.g. 8471.30"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      <div className="max-w-xs">
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {t("Cargo Ready Date *", "تاريخ جاهزية البضاعة للشحن *")}
        </label>
        <input
          type="date"
          required
          min={todayStr}
          value={common.ready || ""}
          onChange={(e) => onChangeCommon({ ready: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ── Primary Cargo Conditions (DG & Refrigerated) ── */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          {t("Cargo Conditions", "حالة البضاعة وشروط الحفظ")}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dangerous Goods (DG) */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              {t("Dangerous Goods (DG)? *", "هل الشحنة تحتوي على مواد خطرة (DG)؟ *")}
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="dangerousGoods"
                  checked={specific.dangerousGoods !== "yes"}
                  onChange={() => onChangeSpecific({ dangerousGoods: "no" })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{t("No", "لا")}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="dangerousGoods"
                  checked={specific.dangerousGoods === "yes"}
                  onChange={() => onChangeSpecific({ dangerousGoods: "yes" })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-rose-600 font-bold">{t("Yes (DG)", "نعم (مواد خطرة)")}</span>
              </label>
            </div>

            {/* Revealed MSDS Upload Area */}
            {specific.dangerousGoods === "yes" && (
              <div className="pt-2 border-t border-slate-100 space-y-2 animate-fade-in">
                <label className="block text-[11px] font-bold text-rose-700">
                  {t("MSDS Documents (Mandatory for DG) *", "صحيفة بيانات سلامة المواد MSDS (إلزامية) *")}
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer">
                    <span>＋ {t("Upload MSDS File", "إرفاق ملف MSDS")}</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => onUpdateMsds(e.target.files)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG &le; 10MB</span>
                </div>

                {msdsList.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {msdsList.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 border border-rose-100 text-xs"
                      >
                        <span className="font-semibold text-rose-900 truncate max-w-[200px]">
                          📄 {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveMsds(file.id)}
                          className="text-rose-600 hover:text-rose-900 font-bold text-[11px] ms-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Refrigerated Cargo */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              {t("Refrigerated Cargo? *", "هل الشحنة تحتاج إلى تبريد؟ *")}
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="refrigeratedCargo"
                  checked={specific.refrigeratedCargo !== "yes"}
                  onChange={() => onChangeSpecific({ refrigeratedCargo: "no", requiredTemperature: "" })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{t("No", "لا")}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="refrigeratedCargo"
                  checked={specific.refrigeratedCargo === "yes"}
                  onChange={() => onChangeSpecific({ refrigeratedCargo: "yes" })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-cyan-700 font-bold">{t("Yes (Refrigerated)", "نعم (مبردة)")}</span>
              </label>
            </div>

            {/* Revealed Temperature text */}
            {specific.refrigeratedCargo === "yes" && (
              <div className="pt-2 border-t border-slate-100 animate-fade-in">
                <label className="block text-[11px] font-bold text-cyan-800 mb-1">
                  {t("Required Temperature (e.g. 2-8 C, -18 C) *", "درجة الحرارة المطلوبة (مثال: 2-8 مئوية أو -18) *")}
                </label>
                <input
                  type="text"
                  required
                  value={specific.requiredTemperature || ""}
                  onChange={(e) => onChangeSpecific({ requiredTemperature: e.target.value })}
                  placeholder="e.g. 2-8 C, -18 C"
                  className="w-full px-3 py-1.5 rounded-lg border border-cyan-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODE SPECIFIC SECTIONS
      ───────────────────────────────────────────────────────────── */}

      {/* ── 1.7.A SEA FCL DETAILS ── */}
      {isSeaFcl && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚓</span> {t("Sea FCL Container Specifications", "تفاصيل حاويات الشحن البحري FCL")}
            </h4>
            <button
              type="button"
              onClick={handleAddContainerRow}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition flex items-center gap-1 cursor-pointer"
            >
              <IconPlus size={14} /> {t("Add Container Row", "إضافة حاوية أخرى")}
            </button>
          </div>

          {/* Container rows */}
          <div className="space-y-3">
            {(specific.containers || []).map((row, idx) => (
              <div
                key={row.containerLineId || idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {t("Container Line", "بند الحاوية")} #{idx + 1}
                    </span>
                  </div>

                  {(specific.containers || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContainerRow(idx)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                    >
                      ✕ {t("Remove Row", "حذف البند")}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {t("Container Type *", "نوع الحاوية *")}
                    </label>
                    <select
                      value={row.type}
                      onChange={(e) => handleChangeContainerRow(idx, { type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FCL_CONTAINER_CATALOG.map((cType) => (
                        <option key={cType} value={cType}>
                          {cType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {t("Quantity *", "العدد *")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={row.quantity}
                      onChange={(e) =>
                        handleChangeContainerRow(idx, {
                          quantity: parseInt(e.target.value, 10) || "",
                        })
                      }
                      placeholder="1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {row.type === "Other" && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {t("Specify Other Type *", "تحديد نوع الحاوية *")}
                      </label>
                      <input
                        type="text"
                        required
                        value={row.otherType || ""}
                        onChange={(e) => handleChangeContainerRow(idx, { otherType: e.target.value })}
                        placeholder="e.g. 45' High Cube Pallet Wide"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Dimensions for RORO */}
                {row.type === "RORO" && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {t("Dimensions for RORO (Mandatory) *", "الأبعاد لمعدات RORO (إلزامية) *")}
                    </span>
                    {(row.dimensions || []).map((dim, dIdx) => (
                      <div key={dim.id || dIdx} className="grid grid-cols-4 gap-2">
                        <input
                          type="number"
                          placeholder={t("Length", "الطول")}
                          value={dim.length}
                          onChange={(e) => handleChangeDimension(dim.id, "length", e.target.value, idx)}
                          className="px-2 py-1.5 rounded-lg border text-xs"
                        />
                        <input
                          type="number"
                          placeholder={t("Width", "العرض")}
                          value={dim.width}
                          onChange={(e) => handleChangeDimension(dim.id, "width", e.target.value, idx)}
                          className="px-2 py-1.5 rounded-lg border text-xs"
                        />
                        <input
                          type="number"
                          placeholder={t("Height", "الارتفاع")}
                          value={dim.height}
                          onChange={(e) => handleChangeDimension(dim.id, "height", e.target.value, idx)}
                          className="px-2 py-1.5 rounded-lg border text-xs"
                        />
                        <select
                          value={dim.unit}
                          onChange={(e) => handleChangeDimension(dim.id, "unit", e.target.value, idx)}
                          className="px-2 py-1.5 rounded-lg border text-xs bg-white"
                        >
                          <option value="cm">cm</option>
                          <option value="m">m</option>
                          <option value="mm">mm</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overweight status & Weight input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t("Overweight Status *", "حالة الوزن الزائد *")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeSpecific({ overweightStatus: "no_overweight" })}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                    specific.overweightStatus === "no_overweight"
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {t("No Overweight", "لا يوجد وزن زائد")}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeSpecific({ overweightStatus: "overweight" })}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                    specific.overweightStatus === "overweight"
                      ? "border-amber-600 bg-amber-50 text-amber-900 font-extrabold"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {t("Overweight", "وزن زائد")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t("Cargo Weight (kg)", "وزن البضاعة (كجم)")}
                {(specific.containers || []).some((r) => r.type === "20' GP") && (
                  <span className="text-amber-600 font-bold ms-1">
                    * ({t("Mandatory for 20' GP", "إلزامي لحاويات 20 قدم")})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={specific.cargoWeight || ""}
                onChange={(e) => onChangeSpecific({ cargoWeight: e.target.value })}
                placeholder="e.g. 18500"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* FCL Service Preference: Liner, NVOCC, Both */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t("FCL Service Preference *", "تفضيل خدمة الحاويات *")}
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-md">
              {[
                { id: "liner", labelAr: "خط ملاحي (Liner)", labelEn: "Liner" },
                { id: "nvocc", labelAr: "وكيل شحن (NVOCC)", labelEn: "NVOCC" },
                { id: "both", labelAr: "كلاهما (Both)", labelEn: "Both" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChangeSpecific({ fclServicePreference: p.id as any })}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                    specific.fclServicePreference === p.id
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {isArabic ? p.labelAr : p.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 1.7.B SEA LCL DETAILS ── */}
      {isSeaLcl && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🚢</span> {t("Sea LCL Consolidated Cargo Details", "تفاصيل الشحنة المجزأة LCL")}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Total Cargo Weight (kg) *", "الوزن الإجمالي للبضاعة (كجم) *")}
              </label>
              <input
                type="number"
                required
                min={1}
                value={specific.cargoWeight || ""}
                onChange={(e) => onChangeSpecific({ cargoWeight: e.target.value })}
                placeholder="e.g. 2400"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Cargo Volume (CBM) *", "حجم البضاعة بالمتر المكعب (CBM) *")}
              </label>
              <input
                type="number"
                required
                min={0.01}
                step="any"
                value={specific.cargoVolume || ""}
                onChange={(e) => onChangeSpecific({ cargoVolume: e.target.value })}
                placeholder="e.g. 6.5"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dimensions Repeater */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {t("Cargo Dimensions (At least 1 set required) *", "أبعاد الطرود (مجموعة واحدة على الأقل مطلوبة) *")}
              </label>
              <button
                type="button"
                onClick={() => handleAddDimension()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <IconPlus size={13} /> {t("Add Dimensions Set", "إضافة أبعاد أخرى")}
              </button>
            </div>

            {(specific.dimensions || [{ id: "dim-1", length: "", width: "", height: "", unit: "cm" }]).map(
              (dim, dIdx) => (
                <div key={dim.id || dIdx} className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    min={0.01}
                    placeholder={t("Length", "الطول")}
                    value={dim.length}
                    onChange={(e) => handleChangeDimension(dim.id, "length", e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  />
                  <input
                    type="number"
                    min={0.01}
                    placeholder={t("Width", "العرض")}
                    value={dim.width}
                    onChange={(e) => handleChangeDimension(dim.id, "width", e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  />
                  <input
                    type="number"
                    min={0.01}
                    placeholder={t("Height", "الارتفاع")}
                    value={dim.height}
                    onChange={(e) => handleChangeDimension(dim.id, "height", e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <select
                      value={dim.unit}
                      onChange={(e) => handleChangeDimension(dim.id, "unit", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border text-xs bg-white"
                    >
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="mm">mm</option>
                    </select>
                    {dIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDimension(dim.id)}
                        className="text-rose-600 text-xs px-1.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Packaging and Stackable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Packaging Type *", "نوع التعبئة *")}
              </label>
              <select
                value={specific.packageType || ""}
                onChange={(e) => onChangeSpecific({ packageType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("Select packaging type", "اختر نوع التعبئة")}</option>
                <option value="pallets">{t("Pallets", "طبالي")}</option>
                <option value="cartons">{t("Cartons", "كراتين")}</option>
                <option value="crates">{t("Crates / Boxes", "صناديق")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Stackable? *", "قابلة للتكديس؟ *")}
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                  <input
                    type="radio"
                    name="stackable"
                    checked={specific.stackable === true}
                    onChange={() => onChangeSpecific({ stackable: true })}
                    className="text-blue-600"
                  />
                  <span>{t("Yes", "نعم")}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                  <input
                    type="radio"
                    name="stackable"
                    checked={specific.stackable === false}
                    onChange={() => onChangeSpecific({ stackable: false })}
                    className="text-blue-600"
                  />
                  <span>{t("No", "لا")}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 1.7.C AIR CARGO DETAILS ── */}
      {isAir && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>✈</span> {t("Air Freight Cargo & Priority", "مواصفات الشحن الجوي والأولوية")}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Gross Weight (kg) *", "الوزن الإجمالي الفعلي (كجم) *")}
              </label>
              <input
                type="number"
                required
                min={0.1}
                step="any"
                value={specific.grossWeight || ""}
                onChange={(e) => onChangeSpecific({ grossWeight: e.target.value })}
                placeholder="e.g. 450"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Air Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Air Freight Priority *", "أولوية الشحن الجوي *")}
              </label>
              <select
                value={specific.priority || ""}
                onChange={(e) => {
                  const prio = e.target.value as "high" | "medium" | "low";
                  onChangeSpecific({ priority: prio });
                  if (prio === "high" || prio === "medium") {
                    onChangeCommon({ routingPreference: "direct" });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("Select Priority", "اختر مستوى الأولوية")}</option>
                <option value="high">{t("High — Express (Direct Flight)", "عالية — شحن سريع مباشر")}</option>
                <option value="medium">{t("Medium — Standard", "متوسطة — شحن قياسي")}</option>
                <option value="low">{t("Low — Deferred (Transit Allowed)", "منخفضة — شحن اقتصادي مؤجل")}</option>
              </select>
            </div>
          </div>

          {/* Dimensions Repeater with Live Volumetric Weight calculation */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {t("Cargo Dimensions *", "أبعاد الطرود *")}
              </label>
              <button
                type="button"
                onClick={() => handleAddDimension()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <IconPlus size={13} /> {t("Add Dimensions Set", "إضافة أبعاد أخرى")}
              </button>
            </div>

            {(specific.dimensions || [{ id: "dim-1", length: "", width: "", height: "", unit: "cm" }]).map(
              (dim, dIdx) => (
                <div key={dim.id || dIdx} className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder={t("Length", "الطول")}
                    value={dim.length}
                    onChange={(e) => handleChangeDimension(dim.id, "length", e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  />
                  <input
                    type="number"
                    placeholder={t("Width", "العرض")}
                    value={dim.width}
                    onChange={(e) => handleChangeDimension(dim.id, "width", e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  />
                  <input
                    type="number"
                    placeholder={t("Height", "الارتفاع")}
                    value={dim.height}
                    onChange={(e) => handleChangeDimension(dim.id, "height", e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <select
                      value={dim.unit}
                      onChange={(e) => handleChangeDimension(dim.id, "unit", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border text-xs bg-white"
                    >
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="mm">mm</option>
                    </select>
                    {dIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDimension(dim.id)}
                        className="text-rose-600 text-xs px-1.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Live Calculation Strip */}
            {airWeights && airWeights.chargeableWeight !== null && (
              <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-cyan-900 font-semibold">
                  {t("Volumetric Weight:", "الوزن الحجمي:")}{" "}
                  <strong className="font-mono">{airWeights.volumetricWeight} kg</strong>
                </span>
                <span className="text-cyan-950 font-black">
                  {t("Estimated Chargeable Weight:", "الوزن المحاسبي التقديري:")}{" "}
                  <strong className="font-mono text-sm text-cyan-700">
                    {airWeights.chargeableWeight} kg
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Packaging and Stackable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Packaging Type *", "نوع التعبئة *")}
              </label>
              <select
                value={specific.packageType || ""}
                onChange={(e) => onChangeSpecific({ packageType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("Select packaging type", "اختر نوع التعبئة")}</option>
                <option value="pallets">{t("Pallets", "طبالي")}</option>
                <option value="cartons">{t("Cartons", "كراتين")}</option>
                <option value="crates">{t("Crates / Boxes", "صناديق")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Stackable? *", "قابلة للتكديس؟ *")}
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                  <input
                    type="radio"
                    name="stackableAir"
                    checked={specific.stackable === true}
                    onChange={() => onChangeSpecific({ stackable: true })}
                    className="text-blue-600"
                  />
                  <span>{t("Yes", "نعم")}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                  <input
                    type="radio"
                    name="stackableAir"
                    checked={specific.stackable === false}
                    onChange={() => onChangeSpecific({ stackable: false })}
                    className="text-blue-600"
                  />
                  <span>{t("No", "لا")}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 1.7.D ROAD CARGO DETAILS (FTL / LTL) ── */}
      {isRoad && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🚛</span> {t("Road Freight Specifications", "مواصفات النقل البري")}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRoadFtl
                  ? t("Truck Type *", "نوع الشاحنة *")
                  : t("Preferred Service Level *", "مستوى الخدمة المفضل *")}
              </label>
              <input
                type="text"
                required
                value={isRoadFtl ? specific.truckType || "" : specific.preferredServiceLevel || ""}
                onChange={(e) =>
                  isRoadFtl
                    ? onChangeSpecific({ truckType: e.target.value })
                    : onChangeSpecific({ preferredServiceLevel: e.target.value })
                }
                placeholder={isRoadFtl ? "e.g. 13.6m Curtainside, Reefer Truck" : "e.g. Express Land, Standard"}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("Pickup Date *", "تاريخ الاستلام *")}
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={specific.pickupDate || ""}
                onChange={(e) => onChangeSpecific({ pickupDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Routing Preference (For Non-Air or Air Low) ── */}
      {(!isAir || specific.priority === "low") && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-900">
            {t("Routing Preference", "تفضيل مسار النقل")}
            <span className="text-slate-400 font-normal ms-2">
              ({t("Controls eligible quote variants; never filters providers", "يحدد خيارات العروض المتاحة ولا يستبعد مقدمي الخدمة")})
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2 max-w-sm">
            {[
              { id: "direct", labelAr: "مباشر", labelEn: "Direct" },
              { id: "transit", labelAr: "ترانزيت", labelEn: "Transit" },
              { id: "both", labelAr: "كلاهما", labelEn: "Both" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeCommon({ routingPreference: opt.id as any })}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                  (common.routingPreference || "both") === opt.id
                    ? "border-blue-600 bg-white text-blue-900 shadow-2xs font-extrabold"
                    : "border-slate-200 bg-white/70 text-slate-700"
                }`}
              >
                {isArabic ? opt.labelAr : opt.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Notes (Hidden for Air per Section 7) */}
      {!isAir && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("Special Requirements / Notes (Optional)", "ملاحظات أو تعليمات خاصة إضافية (اختياري)")}
          </label>
          <textarea
            rows={2}
            value={common.notes || ""}
            onChange={(e) => onChangeCommon({ notes: e.target.value })}
            placeholder={t(
              "Customs instructions, document copies, specific handling preferences…",
              "تعليمات جمركية، مستندات خاصة، تفضيلات مناولة…"
            )}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </section>
  );
}

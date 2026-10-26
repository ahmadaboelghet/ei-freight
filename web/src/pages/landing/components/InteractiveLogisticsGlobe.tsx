/**
 * @file src/pages/landing/components/InteractiveLogisticsGlobe.tsx
 * @description Ultra-premium interactive 3D logistics globe with:
 *              - Luminous spherical Earth with atmospheric cyan glow & rotating meridians
 *              - 3D orbiting supersonic cargo airplanes with light trails (passing in front and behind)
 *              - Cargo container ships navigating active oceanic trade corridors with wave wakes
 *              - Great-circle flight paths (Shanghai ➔ Cairo, Alexandria ➔ Rotterdam, Jebel Ali ➔ Hamburg)
 *              - Pulsing radar port beacons (Shanghai, Alexandria, Jebel Ali, Rotterdam, New York)
 *              - Live Telemetry HUD cards (Flight EI-902, Vessel SilkRoute Pioneer, RFQ-1048)
 *              - Mouse parallax tilt & Mode filter tabs (All, Ocean, Air, Live)
 */

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { IconPlane, IconShip, IconShield, IconSparkles } from "../../../components/ui/Icons";

type LogisticsFilter = "all" | "air" | "sea" | "live";

export function InteractiveLogisticsGlobe() {
  const { t, isArabic } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<LogisticsFilter>("all");
  const [selectedHub, setSelectedHub] = useState<string>("alexandria");
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax 3D Tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Pre-configured Global Logistics Hubs
  const hubs = [
    {
      id: "shanghai",
      nameAr: "ميناء شنغهاي، الصين",
      nameEn: "Port of Shanghai (CNSHA)",
      code: "CNSHA",
      type: "sea_air",
      cx: 320,
      cy: 165,
      departures: "142 رحلة وحاوية اليوم",
      status: "تشغيل نشط 24/7",
      color: "#38bdf8", // cyan
    },
    {
      id: "alexandria",
      nameAr: "ميناء الإسكندرية، مصر",
      nameEn: "Alexandria Port (EGALY)",
      code: "EGALY",
      type: "sea_customs",
      cx: 215,
      cy: 185,
      departures: "بوابة التجارة الإقليمية",
      status: "تخليص جمركي معتمد",
      color: "#10b981", // emerald
    },
    {
      id: "jebel_ali",
      nameAr: "ميناء جبل علي، الإمارات",
      nameEn: "Jebel Ali Port (AEJEA)",
      code: "AEJEA",
      type: "hub",
      cx: 255,
      cy: 195,
      departures: "مركز الترانزيت العالمي",
      status: "ربط متعدد الوسائط",
      color: "#f59e0b", // amber
    },
    {
      id: "rotterdam",
      nameAr: "ميناء روتردام، هولندا",
      nameEn: "Port of Rotterdam (NLRTM)",
      code: "NLRTM",
      type: "sea",
      cx: 180,
      cy: 140,
      departures: "بوابة أوروبا اللوجستية",
      status: "محطة حاويات آلية",
      color: "#a855f7", // purple
    },
    {
      id: "new_york",
      nameAr: "ميناء نيويورك، أمريكا",
      nameEn: "Port of New York (USNYC)",
      code: "USNYC",
      type: "sea_air",
      cx: 105,
      cy: 155,
      departures: "الممر الأطلسي",
      status: "توزيع شرق أمريكا",
      color: "#f43f5e", // rose
    },
  ];

  const activeHubData = hubs.find((h) => h.id === selectedHub) || hubs[1];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-5xl mx-auto py-8 sm:py-12 select-none font-['Cairo',sans-serif]"
    >
      {/* ── Background Glow Aura ── */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/25 via-cyan-500/20 to-indigo-500/10 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute w-[360px] h-[360px] bg-cyan-400/15 rounded-full blur-[90px]" />
      </div>

      {/* ── Mode Filter Buttons ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 z-20 relative">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            activeFilter === "all"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/40 scale-105"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <span>🌐</span>
          <span>{t("All Global Logistics", "الشبكة العالمية المتكاملة")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("air")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            activeFilter === "air"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40 scale-105"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <span>✈️</span>
          <span>{t("Cargo Air Corridors", "الممرات الجوية للشحن")}</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping ms-1" />
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("sea")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            activeFilter === "sea"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/40 scale-105"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <span>🚢</span>
          <span>{t("Ocean Container Routes", "مسارات الشحن البحري FCL")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("live")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            activeFilter === "live"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30 border border-amber-400/40 scale-105"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <span>⚡</span>
          <span>{t("Live Vessel & Flight Radar", "الرادار الحي للشحنات")}</span>
        </button>
      </div>

      {/* ── Main Stage: 3D Globe & Floating HUD Telemetry Cards ── */}
      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 min-h-[500px]">
        {/* Floating Telemetry Card 1 (Left / Top-Left): Vessel SilkRoute */}
        <div
          className={`lg:absolute lg:top-8 lg:start-0 z-30 w-full lg:w-72 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 shadow-2xl shadow-slate-950/80 ${
            activeFilter === "air" ? "opacity-30 pointer-events-none" : "opacity-100"
          }`}
          style={{
            transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * -15}px, 0)`,
          }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <IconShip size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">SilkRoute Pioneer</h4>
                <p className="text-[10px] text-slate-400">Ultra Large Container Vessel</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("Cruising", "مبحر")}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{t("Route:", "المسار:")}</span>
              <span className="font-semibold text-white">شنغهاي ➔ الإسكندرية</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{t("Capacity:", "الحمولة:")}</span>
              <span className="font-mono font-bold text-emerald-400">18,400 TEU</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{t("Current Speed:", "السرعة:")}</span>
              <span className="font-mono text-slate-200">19.4 knots</span>
            </div>
          </div>

          {/* Voyage progress bar */}
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>{t("Suez Canal Transit", "عبر قناة السويس")}</span>
              <span className="font-mono font-bold text-white">78%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full animate-pulse"
                style={{ width: "78%" }}
              />
            </div>
          </div>
        </div>

        {/* ── Central Animated 3D Globe with Airplanes & Ships ── */}
        <div
          className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] flex items-center justify-center"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * -12}deg) rotateY(${
              mousePos.x * 15
            }deg)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Outer Orbital Ring 1: Continuous 3D Air Orbit */}
          <div
            className={`absolute inset-[-40px] rounded-full border border-dashed border-cyan-400/25 pointer-events-none transition-opacity duration-500 ${
              activeFilter === "sea" ? "opacity-20" : "opacity-100"
            }`}
            style={{
              transform: "rotateX(72deg) rotateY(-25deg)",
              animation: "spinSlow 24s linear infinite",
            }}
          >
            {/* Supersonic Cargo Airplane 1 orbiting in 3D */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
              style={{
                animation: "orbitFlight 14s linear infinite",
              }}
            >
              <div className="relative group cursor-pointer pointer-events-auto">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/60 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-cyan-300 transform -rotate-45">
                  <IconPlane size={18} className="text-white drop-shadow-[0_0_8px_#38bdf8]" />
                </div>
                {/* Airplane Light Jet Beam */}
                <div className="absolute top-1/2 start-full w-10 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent -translate-y-1/2 blur-[1px]" />
              </div>
            </div>
          </div>

          {/* Outer Orbital Ring 2: Polar Cargo Jet Orbit */}
          <div
            className={`absolute inset-[-25px] rounded-full border border-cyan-500/20 pointer-events-none transition-opacity duration-500 ${
              activeFilter === "sea" ? "opacity-20" : "opacity-100"
            }`}
            style={{
              transform: "rotateX(62deg) rotateY(45deg)",
              animation: "spinSlowReverse 18s linear infinite",
            }}
          >
            {/* Supersonic Cargo Airplane 2 orbiting opposite */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
              style={{
                animation: "orbitFlightReverse 16s linear infinite",
              }}
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/60 shadow-lg shadow-blue-500/50 flex items-center justify-center text-blue-300 transform rotate-135">
                <IconPlane size={16} className="text-white drop-shadow-[0_0_6px_#60a5fa]" />
              </div>
            </div>
          </div>

          {/* ── The 3D Spherical Earth Body ── */}
          <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full overflow-hidden shadow-[0_0_80px_rgba(56,189,248,0.25),inset_0_0_50px_rgba(56,189,248,0.35)] border border-cyan-400/30 bg-[#071322]">
            {/* Realistic Sphere Shading (Radial Gradient Lighting) */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, rgba(56, 189, 248, 0.28) 0%, rgba(14, 34, 61, 0.4) 45%, rgba(3, 7, 18, 0.95) 85%)",
              }}
            />

            {/* Atmosphere Blue Rim Edge */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 shadow-[inset_0_0_30px_rgba(56,189,248,0.4)] pointer-events-none z-20" />

            {/* SVG Globe Surface with Rotating Continents & Trade Lanes */}
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 0 4px rgba(56, 189, 248, 0.3))" }}
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="flightArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="seaLaneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Spherical Grid Rings (Latitude & Longitude) */}
              <g stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" fill="none">
                {/* Equator */}
                <ellipse cx="200" cy="200" rx="190" ry="60" />
                {/* Latitude 30 N */}
                <ellipse cx="200" cy="150" rx="170" ry="50" />
                {/* Latitude 30 S */}
                <ellipse cx="200" cy="250" rx="170" ry="50" />
                {/* Central Meridian */}
                <ellipse cx="200" cy="200" rx="70" ry="190" />
                {/* Diagonal Meridian */}
                <ellipse cx="200" cy="200" rx="140" ry="190" />
              </g>

              {/* Stylized Continents Dot Matrix (Eurasia, Africa, Americas) */}
              <g fill="#1e3a5f" opacity="0.6">
                {/* Mediterranean / Europe cluster */}
                <circle cx="180" cy="140" r="16" />
                <circle cx="205" cy="135" r="12" />
                <circle cx="165" cy="160" r="14" />
                {/* Africa continent body */}
                <path
                  d="M190,165 Q220,175 210,230 Q200,280 185,270 Q165,220 180,180 Z"
                  fill="#132b47"
                  opacity="0.8"
                />
                {/* Arabian Peninsula */}
                <path d="M235,175 Q260,185 245,215 Q230,210 235,175 Z" fill="#173559" />
                {/* Asia / East Asia */}
                <path
                  d="M250,140 Q310,120 335,160 Q340,210 300,220 Q270,180 250,140 Z"
                  fill="#142c4c"
                  opacity="0.8"
                />
                {/* Americas coastline (West) */}
                <path
                  d="M90,120 Q120,130 110,180 Q80,220 60,190 Q70,140 90,120 Z"
                  fill="#132942"
                  opacity="0.7"
                />
              </g>

              {/* ── Active Ocean Shipping Lanes (Cruising Ships) ── */}
              <g className={`transition-opacity duration-300 ${activeFilter === "air" ? "opacity-20" : "opacity-100"}`}>
                {/* Sea Lane 1: Shanghai ➔ Alexandria (Suez Route) */}
                <path
                  d="M320,165 Q270,225 255,195 Q235,190 215,185"
                  fill="none"
                  stroke="url(#seaLaneGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-seaLane"
                />

                {/* Animated Cargo Vessel 1: Cruising on Sea Lane */}
                <g className="cursor-pointer">
                  <animateMotion
                    path="M320,165 Q270,225 255,195 Q235,190 215,185"
                    dur="12s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  {/* Container Ship Icon & Wake */}
                  <circle cx="0" cy="0" r="6" fill="#10b981" filter="url(#glow)" />
                  <polygon points="-8,-4 8,0 -8,4 -5,0" fill="#34d399" />
                  {/* Water Ripple Wake */}
                  <circle cx="-10" cy="0" r="4" fill="none" stroke="#6ee7b7" strokeWidth="1" opacity="0.6">
                    <animate attributeName="r" values="3;9" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </g>

                {/* Sea Lane 2: Alexandria ➔ Rotterdam */}
                <path
                  d="M215,185 Q190,165 180,140"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* Animated Cargo Vessel 2 on Mediterranean */}
                <g>
                  <animateMotion
                    path="M215,185 Q190,165 180,140"
                    dur="9s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  <circle cx="0" cy="0" r="5" fill="#06b6d4" />
                  <polygon points="-6,-3 6,0 -6,3" fill="#22d3ee" />
                </g>
              </g>

              {/* ── Active Flight Arcs (Supersonic Cargo Airplanes) ── */}
              <g className={`transition-opacity duration-300 ${activeFilter === "sea" ? "opacity-20" : "opacity-100"}`}>
                {/* Great Circle Flight Arc: Shanghai (CNSHA) ➔ Cairo / Alexandria (EGALY) */}
                <path
                  d="M320,165 Q260,110 215,185"
                  fill="none"
                  stroke="url(#flightArcGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  className="animate-flightArc"
                />

                {/* Animated Cargo Airplane 3 flying on Great Circle Arc */}
                <g className="cursor-pointer">
                  <animateMotion
                    path="M320,165 Q260,110 215,185"
                    dur="7s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  {/* Supersonic Jet Shape */}
                  <circle cx="0" cy="0" r="5" fill="#38bdf8" filter="url(#glow)" />
                  <polygon points="-9,-5 9,0 -9,5 -6,0" fill="#ffffff" />
                  {/* Jet Exhaust Flame */}
                  <line x1="-9" y1="0" x2="-18" y2="0" stroke="#38bdf8" strokeWidth="2.5" opacity="0.9" />
                </g>

                {/* Flight Arc 2: Jebel Ali ➔ Rotterdam Express */}
                <path
                  d="M255,195 Q210,120 180,140"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />

                {/* Animated Cargo Jet on Corridor 2 */}
                <g>
                  <animateMotion
                    path="M255,195 Q210,120 180,140"
                    dur="8.5s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  <circle cx="0" cy="0" r="4" fill="#60a5fa" />
                  <polygon points="-7,-4 7,0 -7,4" fill="#93c5fd" />
                </g>
              </g>

              {/* ── Pulsing Logistics Hub Beacons (Ports & Air Hubs) ── */}
              {hubs.map((hub) => {
                const isSelected = selectedHub === hub.id;
                return (
                  <g
                    key={hub.id}
                    onClick={() => setSelectedHub(hub.id)}
                    className="cursor-pointer group"
                  >
                    {/* Radar Pulse Ripple */}
                    <circle
                      cx={hub.cx}
                      cy={hub.cy}
                      r="12"
                      fill={hub.color}
                      opacity="0.2"
                    >
                      <animate
                        attributeName="r"
                        values="5;18"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Central Beacon Pin */}
                    <circle
                      cx={hub.cx}
                      cy={hub.cy}
                      r={isSelected ? 6 : 4.5}
                      fill={hub.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-200 group-hover:scale-125"
                    />

                    {/* Hub Monospace Code Label */}
                    <text
                      x={hub.cx}
                      y={hub.cy - 10}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    >
                      {hub.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Floating Telemetry Card 2 (Right / Bottom-Right): Cargo Flight EI-902 */}
        <div
          className={`lg:absolute lg:bottom-4 lg:end-0 z-30 w-full lg:w-72 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 shadow-2xl shadow-slate-950/80 ${
            activeFilter === "sea" ? "opacity-30 pointer-events-none" : "opacity-100"
          }`}
          style={{
            transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0)`,
          }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <IconPlane size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Flight EI-902</h4>
                <p className="text-[10px] text-slate-400">Boeing 777-200F Cargo</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              {t("In Air", "في الجو")}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{t("Altitude:", "الارتفاع:")}</span>
              <span className="font-mono text-cyan-400 font-bold">36,000 ft</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{t("Ground Speed:", "السرعة:")}</span>
              <span className="font-mono text-white">880 km/h</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{t("Active Corridor:", "الممر الجوي:")}</span>
              <span className="font-semibold text-white">شنغهاي ➔ القاهرة</span>
            </div>
          </div>

          {/* Time to landing */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{t("Estimated Arrival:", "الوصول المتوقع:")}</span>
            <span className="font-mono font-bold text-cyan-300">
              {t("In 3h 45m", "خلال ٣ ساعات و٤٥ د")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Active Hub Interactive Details Strip ── */}
      <div className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: activeHubData.color }}
          />
          <div>
            <span className="font-black text-white text-sm">
              {isArabic ? activeHubData.nameAr : activeHubData.nameEn}
            </span>
            <span className="text-slate-400 ms-2 font-mono">({activeHubData.code})</span>
            <p className="text-[11px] text-slate-400 mt-0.5">{activeHubData.departures}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold">
            {activeHubData.status}
          </span>
          <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
            <IconSparkles size={13} />
            <span>{t("Verified Port", "ميناء معتمد")}</span>
          </span>
        </div>
      </div>

      {/* ── Component CSS Keyframes for Super-Smooth Animation ── */}
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotateX(72deg) rotateY(-25deg) rotateZ(0deg); }
          100% { transform: rotateX(72deg) rotateY(-25deg) rotateZ(360deg); }
        }
        @keyframes spinSlowReverse {
          0% { transform: rotateX(62deg) rotateY(45deg) rotateZ(360deg); }
          100% { transform: rotateX(62deg) rotateY(45deg) rotateZ(0deg); }
        }
        @keyframes orbitFlight {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes orbitFlightReverse {
          0% { transform: translate(-50%, 50%) rotate(360deg); }
          100% { transform: translate(-50%, 50%) rotate(0deg); }
        }
        .animate-flightArc {
          animation: flightArcDash 3s linear infinite;
        }
        @keyframes flightArcDash {
          to { stroke-dashoffset: -32; }
        }
        .animate-seaLane {
          animation: seaLaneDash 4s linear infinite;
        }
        @keyframes seaLaneDash {
          to { stroke-dashoffset: -40; }
        }
      `}</style>
    </div>
  );
}

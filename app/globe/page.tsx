"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Satellite,
  Activity,
  Zap,
  RefreshCw,
  Info,
  X,
} from "lucide-react";
import { useMissionNarration } from "@/lib/hooks/useMissionNarration";

// ─── Satellite TLE data (real representative TLEs) ───────────────────────────
const SAMPLE_TLES = [
  // ISS
  {
    name: "ISS (ZARYA)",
    color: "#60a5fa",
    tle1: "1 25544U 98067A   24001.50000000  .00021395  00000-0  38669-3 0  9995",
    tle2: "2 25544  51.6413 158.5013 0002108  37.5988 322.5348 15.49615924432898",
  },
  // Starlink-1007
  {
    name: "STARLINK-1007",
    color: "#34d399",
    tle1: "1 44713U 19074A   24001.50000000  .00003456  00000-0  22345-3 0  9993",
    tle2: "2 44713  53.0541  89.3421 0001204  99.7654 260.3410 15.06399684234560",
  },
  // GPS BIIR-2
  {
    name: "GPS BIIR-2",
    color: "#f59e0b",
    tle1: "1 24876U 97035A   24001.50000000 -.00000023  00000-0  00000+0 0  9993",
    tle2: "2 24876  55.4823  58.2349 0046543 123.4321 236.9876  2.00562498191238",
  },
  // Hubble Space Telescope
  {
    name: "HST",
    color: "#a78bfa",
    tle1: "1 20580U 90037B   24001.50000000  .00001234  00000-0  61234-4 0  9991",
    tle2: "2 20580  28.4699 144.5432 0002345 123.9876 236.1234 15.09124567890123",
  },
  // Sentinel-2A
  {
    name: "SENTINEL-2A",
    color: "#f472b6",
    tle1: "1 40697U 15028A   24001.50000000  .00000123  00000-0  36789-4 0  9999",
    tle2: "2 40697  98.5702  23.4567 0001234  87.6543 272.4789 14.30819345678901",
  },
];

interface SatellitePoint {
  name: string;
  color: string;
  lat: number;
  lon: number;
  alt: number;
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  visible: boolean;
  trail: { x: number; y: number }[];
}

function latLonToXYZ(
  lat: number,
  lon: number,
  radius: number
): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function project(
  x: number,
  y: number,
  z: number,
  rotX: number,
  rotY: number,
  cx: number,
  cy: number,
  fov: number
): [number, number, number] {
  // Rotate around Y axis
  const cosY = Math.cos(rotY),
    sinY = Math.sin(rotY);
  let rx = x * cosY + z * sinY;
  const ry = y;
  let rz = -x * sinY + z * cosY;

  // Rotate around X axis
  const cosX = Math.cos(rotX),
    sinX = Math.sin(rotX);
  const fy = ry * cosX - rz * sinX;
  const fz = ry * sinX + rz * cosX;
  rx = rx;

  const scale = fov / (fov + fz);
  return [cx + rx * scale, cy + fy * scale, fz];
}

// Simulate satellite positions based on time (simplified circular orbit approximation)
function getSatellitePosition(
  index: number,
  time: number
): { lat: number; lon: number; alt: number } {
  // Different orbital parameters for each satellite
  const orbitParams = [
    { inc: 51.6, period: 92.6, lon0: 0, alt: 408 }, // ISS
    { inc: 53, period: 97.6, lon0: 60, alt: 550 }, // Starlink
    { inc: 55.5, period: 718, lon0: 120, alt: 20200 }, // GPS
    { inc: 28.5, period: 96.7, lon0: 180, alt: 547 }, // HST
    { inc: 98.5, period: 100.6, lon0: 240, alt: 786 }, // Sentinel
  ];

  const p = orbitParams[index % orbitParams.length];
  const t = time / 60000; // minutes
  const angle = ((t / p.period) * 360 * Math.PI) / 180;

  // Simplified: circular orbit projected onto lat/lon
  const lat = p.inc * Math.sin(angle);
  const lon =
    ((((p.lon0 + (t / p.period) * 360) % 360) + 360) % 360) - 180;

  return { lat, lon, alt: p.alt };
}

export default function GlobePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotYRef = useRef(0.3);
  const rotXRef = useRef(0.15);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotate = useRef(true);
  const startTime = useRef(Date.now());
  const [satellites, setSatellites] = useState<SatellitePoint[]>([]);
  const [selectedSat, setSelectedSat] = useState<SatellitePoint | null>(null);
  const [stats, setStats] = useState({
    tracked: 27419,
    online: 5,
    fps: 60,
  });

  const missionNarration = useMissionNarration();

  useEffect(() => {
    // Hardcoded KP-Index is 4 in the UI telemetry panel
    missionNarration.narrateSpaceWeather(4);
    missionNarration.playIntroSequence();
  }, [missionNarration]);

  const drawGlobe = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.35;
    const fov = 900;

    ctx.clearRect(0, 0, W, H);

    const rotY = rotYRef.current;
    const rotX = rotXRef.current;

    // ── Draw outer glow ──────────────────────────────────────────────────────
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.4);
    glow.addColorStop(0, "rgba(59, 130, 246, 0.08)");
    glow.addColorStop(0.5, "rgba(99, 102, 241, 0.04)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ── Draw atmosphere ──────────────────────────────────────────────────────
    const atmo = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.08);
    atmo.addColorStop(0, "rgba(96, 165, 250, 0.12)");
    atmo.addColorStop(0.5, "rgba(99, 102, 241, 0.06)");
    atmo.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
    ctx.fillStyle = atmo;
    ctx.fill();

    // ── Draw globe base ──────────────────────────────────────────────────────
    const globeGrad = ctx.createRadialGradient(
      cx - radius * 0.3,
      cy - radius * 0.3,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    globeGrad.addColorStop(0, "#1a2a4a");
    globeGrad.addColorStop(0.4, "#0d1b3e");
    globeGrad.addColorStop(0.7, "#071228");
    globeGrad.addColorStop(1, "#030812");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = globeGrad;
    ctx.fill();

    // ── Draw latitude/longitude grid ─────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = "rgba(96, 165, 250, 0.08)";
    ctx.lineWidth = 0.5;

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 180; lon += 4) {
        const [x, y, z] = latLonToXYZ(lat, lon, radius);
        const [sx, sy, sz] = project(x, y, z, rotX, rotY, cx, cy, fov);
        if (sz < 0) {
          if (first) {
            ctx.moveTo(sx, sy);
            first = false;
          } else {
            ctx.lineTo(sx, sy);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // Longitude lines
    for (let lon = -180; lon < 180; lon += 20) {
      ctx.beginPath();
      let first = true;
      for (let lat = -90; lat <= 90; lat += 3) {
        const [x, y, z] = latLonToXYZ(lat, lon, radius);
        const [sx, sy, sz] = project(x, y, z, rotX, rotY, cx, cy, fov);
        if (sz < 0) {
          if (first) {
            ctx.moveTo(sx, sy);
            first = false;
          } else {
            ctx.lineTo(sx, sy);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }
    ctx.restore();

    // ── Draw continent outlines (simplified dot-map) ──────────────────────────
    const continentDots: [number, number][] = [];
    // North America
    for (let lat = 25; lat < 70; lat += 3) {
      for (let lon = -130; lon < -60; lon += 3) {
        if (Math.random() < 0.4) continentDots.push([lat, lon]);
      }
    }
    // Europe
    for (let lat = 35; lat < 70; lat += 3) {
      for (let lon = -10; lon < 40; lon += 3) {
        if (Math.random() < 0.5) continentDots.push([lat, lon]);
      }
    }
    // Asia
    for (let lat = 10; lat < 70; lat += 3) {
      for (let lon = 40; lon < 140; lon += 3) {
        if (Math.random() < 0.4) continentDots.push([lat, lon]);
      }
    }
    // Africa
    for (let lat = -35; lat < 35; lat += 3) {
      for (let lon = -18; lon < 52; lon += 3) {
        if (Math.random() < 0.45) continentDots.push([lat, lon]);
      }
    }
    // South America
    for (let lat = -55; lat < 12; lat += 3) {
      for (let lon = -80; lon < -35; lon += 3) {
        if (Math.random() < 0.4) continentDots.push([lat, lon]);
      }
    }
    // Australia
    for (let lat = -40; lat < -10; lat += 3) {
      for (let lon = 114; lon < 154; lon += 3) {
        if (Math.random() < 0.5) continentDots.push([lat, lon]);
      }
    }

    ctx.save();
    continentDots.forEach(([lat, lon]) => {
      const [x, y, z] = latLonToXYZ(lat, lon, radius);
      const [sx, sy, sz] = project(x, y, z, rotX, rotY, cx, cy, fov);
      if (sz < 0) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(96, 165, 250, 0.25)";
        ctx.fill();
      }
    });
    ctx.restore();

    // ── Draw globe specular highlight ────────────────────────────────────────
    const specGrad = ctx.createRadialGradient(
      cx - radius * 0.4,
      cy - radius * 0.4,
      0,
      cx - radius * 0.2,
      cy - radius * 0.2,
      radius * 0.6
    );
    specGrad.addColorStop(0, "rgba(255,255,255,0.04)");
    specGrad.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = specGrad;
    ctx.fill();

    // ── Globe border ────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(96, 165, 250, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── Compute and draw satellites ──────────────────────────────────────────
    const now = Date.now();
    const elapsed = now - startTime.current;
    const newSatellites: SatellitePoint[] = [];

    SAMPLE_TLES.forEach((tle, i) => {
      const pos = getSatellitePosition(i, elapsed);
      const orbitRadius = radius * (1 + pos.alt / (6371 * 0.9));
      const [x, y, z] = latLonToXYZ(pos.lat, pos.lon, orbitRadius);
      const [sx, sy, sz] = project(x, y, z, rotX, rotY, cx, cy, fov);
      const visible = sz < 0;

      // Draw orbital ring
      if (i < 3) {
        ctx.save();
        ctx.strokeStyle = `${tle.color}18`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        const orbitInc = [51.6, 53, 55.5, 28.5, 98.5][i] * (Math.PI / 180);
        const steps = 120;
        let firstOrbit = true;
        for (let s = 0; s <= steps; s++) {
          const a = (s / steps) * Math.PI * 2;
          const olat = Math.asin(Math.sin(orbitInc) * Math.sin(a)) * (180 / Math.PI);
          const olon = (Math.atan2(Math.cos(orbitInc) * Math.sin(a), Math.cos(a)) * 180) / Math.PI + (elapsed / 60000 / [92.6, 97.6, 718, 96.7, 100.6][i]) * 360;
          const [ox, oy, oz] = latLonToXYZ(olat, olon, orbitRadius);
          const [osx, osy, osz] = project(ox, oy, oz, rotX, rotY, cx, cy, fov);
          if (osz < 0) {
            if (firstOrbit) { ctx.moveTo(osx, osy); firstOrbit = false; }
            else ctx.lineTo(osx, osy);
          } else {
            firstOrbit = true;
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      if (visible) {
        // Draw satellite glow
        const satGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
        satGlow.addColorStop(0, `${tle.color}80`);
        satGlow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fillStyle = satGlow;
        ctx.fill();

        // Draw satellite dot
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = tle.color;
        ctx.fill();

        // Draw satellite label
        ctx.save();
        ctx.font = "10px monospace";
        ctx.fillStyle = `${tle.color}cc`;
        ctx.fillText(tle.name, sx + 8, sy - 4);
        ctx.restore();
      }

      newSatellites.push({
        name: tle.name,
        color: tle.color,
        lat: pos.lat,
        lon: pos.lon,
        alt: pos.alt,
        x,
        y,
        z,
        screenX: sx,
        screenY: sy,
        visible,
        trail: [],
      });
    });

    setSatellites(newSatellites);

    // ── Draw equator highlight ────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = "rgba(251, 191, 36, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    let firstEq = true;
    for (let lon = -180; lon <= 180; lon += 2) {
      const [x, y, z] = latLonToXYZ(0, lon, radius);
      const [sx, sy, sz] = project(x, y, z, rotX, rotY, cx, cy, fov);
      if (sz < 0) {
        if (firstEq) { ctx.moveTo(sx, sy); firstEq = false; }
        else ctx.lineTo(sx, sy);
      } else firstEq = true;
    }
    ctx.stroke();
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    let frameCount = 0;
    let lastFpsTime = Date.now();

    const loop = () => {
      if (autoRotate.current) {
        rotYRef.current += 0.003;
      }

      drawGlobe();

      frameCount++;
      const now = Date.now();
      if (now - lastFpsTime > 1000) {
        setStats((s) => ({ ...s, fps: frameCount }));
        frameCount = 0;
        lastFpsTime = now;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [drawGlobe]);

  // Mouse/touch controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    autoRotate.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    rotYRef.current += dx * 0.005;
    rotXRef.current += dy * 0.005;
    rotXRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotXRef.current));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setTimeout(() => { autoRotate.current = true; }, 3000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      autoRotate.current = false;
      const touch = e.touches[0];
      lastMouse.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - lastMouse.current.x;
    const dy = touch.clientY - lastMouse.current.y;
    rotYRef.current += dx * 0.005;
    rotXRef.current += dy * 0.005;
    rotXRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotXRef.current));
    lastMouse.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    setTimeout(() => { autoRotate.current = true; }, 3000);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const mx = (e.clientX - rect.left) * window.devicePixelRatio;
    const my = (e.clientY - rect.top) * window.devicePixelRatio;
    const clicked = satellites.find(
      (s) => s.visible && Math.hypot(s.screenX - mx, s.screenY - my) < 20
    );
    setSelectedSat(clicked || null);
    if (clicked) {
      missionNarration.narrateSatellite(clicked);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      {/* Background stars */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5 + "px",
              height: Math.random() * 2 + 0.5 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.6 + 0.1,
              animation: `pulse ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>

      {/* Header nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#030014]/80 backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs text-blue-400">
          <Globe className="h-4 w-4 animate-spin" style={{ animationDuration: "8s" }} />
          LIVE ORBITAL GLOBE
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <span>{stats.fps} FPS</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex min-h-screen pt-16">
        {/* Left sidebar */}
        <motion.aside
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-black/30 backdrop-blur-md p-4 gap-4 pt-6"
        >
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
            Tracked Objects
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Objects", value: stats.tracked.toLocaleString(), color: "text-blue-400" },
              { label: "In View", value: satellites.filter((s) => s.visible).length.toString(), color: "text-emerald-400" },
              { label: "Debris", value: "19,583", color: "text-red-400" },
              { label: "Active Sats", value: "7,836", color: "text-purple-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-4">
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
              Satellites Visible
            </div>
            <div className="space-y-2">
              {SAMPLE_TLES.map((tle, i) => {
                const sat = satellites[i];
                return (
                  <motion.div
                    key={tle.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5 cursor-pointer hover:bg-white/8 transition-colors"
                    onClick={() => sat && setSelectedSat(sat)}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tle.color, boxShadow: `0 0 6px ${tle.color}80` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-white truncate">{tle.name}</div>
                      {sat && (
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {sat.lat.toFixed(1)}°N {sat.lon.toFixed(1)}°E · {sat.alt}km
                        </div>
                      )}
                    </div>
                    {sat?.visible && (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        VIS
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Controls hint */}
          <div className="mt-auto border-t border-white/5 pt-4 space-y-1.5 text-[10px] text-zinc-600 font-mono">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">Drag</span>
              <span>Rotate globe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">Click</span>
              <span>Select satellite</span>
            </div>
          </div>
        </motion.aside>

        {/* Globe canvas */}
        <main className="flex-1 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full relative"
            style={{ minHeight: "calc(100vh - 4rem)" }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              style={{ minHeight: "calc(100vh - 4rem)" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleCanvasClick}
            />

            {/* Center title overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <div className="font-mono text-[10px] text-zinc-600 tracking-widest">
                DRAG TO ROTATE · CLICK TO INSPECT
              </div>
            </div>

            {/* Top-right legend */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-2"
            >
              {[
                { label: "LEO Satellites", color: "#60a5fa" },
                { label: "MEO / GPS", color: "#f59e0b" },
                { label: "Scientific", color: "#a78bfa" },
                { label: "Orbital Path", color: "rgba(255,255,255,0.2)" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </main>

        {/* Right panel */}
        <motion.aside
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden xl:flex flex-col w-64 border-l border-white/5 bg-black/30 backdrop-blur-md p-4 gap-4 pt-6"
        >
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
            Telemetry Feed
          </div>
          <div className="space-y-2 text-[11px] font-mono">
            {[
              { label: "UTC TIME", value: new Date().toUTCString().slice(17, 25) },
              { label: "EPOCH", value: new Date().getFullYear() + " DOY " + Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000) },
              { label: "SOLAR WIND", value: "412 km/s" },
              { label: "KP-INDEX", value: "4 (Active)" },
              { label: "TLE AGE", value: "0.5 days" },
              { label: "DATA SRC", value: "CelesTrak" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2 py-1.5 border-b border-white/5">
                <span className="text-zinc-600">{label}</span>
                <span className="text-zinc-300">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
              Active Constellations
            </div>
            <div className="space-y-2">
              {[
                { name: "Starlink", count: 6120, color: "#34d399" },
                { name: "OneWeb", count: 634, color: "#60a5fa" },
                { name: "GPS", count: 31, color: "#f59e0b" },
                { name: "Galileo", count: 28, color: "#a78bfa" },
              ].map(({ name, count, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-zinc-400 flex-1">{name}</span>
                  <span className="text-xs font-mono" style={{ color }}>{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 p-2 rounded-lg bg-white/3 border border-white/5">
              <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Live propagation active</span>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Satellite detail popup */}
      <AnimatePresence>
        {selectedSat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-80 bg-black/80 backdrop-blur-xl border rounded-2xl p-5 shadow-2xl"
            style={{ borderColor: `${selectedSat.color}40` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedSat.color, boxShadow: `0 0 8px ${selectedSat.color}` }}
                />
                <div className="font-mono font-bold text-white">{selectedSat.name}</div>
              </div>
              <button
                onClick={() => setSelectedSat(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { label: "LATITUDE", value: `${selectedSat.lat.toFixed(4)}°` },
                { label: "LONGITUDE", value: `${selectedSat.lon.toFixed(4)}°` },
                { label: "ALTITUDE", value: `${selectedSat.alt} km` },
                { label: "STATUS", value: selectedSat.visible ? "IN VIEW" : "BELOW HORIZON" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-lg p-2">
                  <div className="text-zinc-500 text-[9px]">{label}</div>
                  <div className="text-white mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

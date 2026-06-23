"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as satellite from "satellite.js";
import { CelesTrakTle } from "@/types/clients";

// ── Types ────────────────────────────────────────────────────────────────────
export interface ParsedSatellite {
  name: string;
  noradId: string;
  satrec: satellite.SatRec;
  lat: number;
  lon: number;
  altKm: number;
  color: string;
  orbitType: "LEO" | "MEO" | "GEO" | "HEO";
  screenX: number;
  screenY: number;
  visible: boolean;
}

interface OrbitalGlobeProps {
  tles: CelesTrakTle[];
  onSatelliteClick?: (sat: ParsedSatellite) => void;
  onSatelliteHover?: (sat: ParsedSatellite | null) => void;
  trackedSatId?: string | null;
  userLat?: number | null;
  userLon?: number | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getOrbitType(altKm: number): "LEO" | "MEO" | "GEO" | "HEO" {
  if (altKm < 2000) return "LEO";
  if (altKm < 20000) return "MEO";
  if (altKm < 36500) return "HEO";
  return "GEO";
}

function getOrbitColor(type: string, name: string): string {
  if (name.includes("ISS") || name.includes("ZARYA")) return "#60a5fa";
  if (name.includes("STARLINK")) return "#34d399";
  if (name.includes("GPS") || name.includes("NAVSTAR")) return "#f59e0b";
  if (name.includes("GOES") || name.includes("METEOSAT")) return "#c084fc";
  if (name.includes("HUBBLE") || name.includes("HST")) return "#f472b6";
  if (type === "GEO") return "#818cf8";
  if (type === "MEO") return "#fb923c";
  return "#38bdf8";
}

function latLonToXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

function project(
  x: number, y: number, z: number,
  rotX: number, rotY: number,
  cx: number, cy: number, fov: number
): [number, number, number] {
  const cy_ = Math.cos(rotY), sy_ = Math.sin(rotY);
  const rx = x * cy_ + z * sy_;
  const ry_base = y;
  const rz = -x * sy_ + z * cy_;
  const cx_ = Math.cos(rotX), sx_ = Math.sin(rotX);
  const fy = ry_base * cx_ - rz * sx_;
  const fz = ry_base * sx_ + rz * cx_;
  const scale = fov / (fov + fz);
  return [cx + rx * scale, cy + fy * scale, fz];
}

// Sun direction for day/night
function getSunDirection(date: Date): [number, number, number] {
  const d = date.getTime() / 86400000 - 10957;
  const g = (357.529 + 0.98560028 * d) * (Math.PI / 180);
  const q = (280.459 + 0.98564736 * d) * (Math.PI / 180);
  const l = q + 1.915 * Math.sin(g) * (Math.PI / 180) + 0.0199 * Math.sin(2 * g) * (Math.PI / 180);
  const e = 23.439 * (Math.PI / 180);
  return [Math.cos(l), Math.sin(l) * Math.cos(e), Math.sin(l) * Math.sin(e)];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OrbitalGlobe({
  tles,
  onSatelliteClick,
  onSatelliteHover,
  trackedSatId,
  userLat,
  userLon,
}: OrbitalGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotYRef = useRef(0.5);
  const rotXRef = useRef(0.15);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotate = useRef(true);
  const autoRotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parsedSatsRef = useRef<ParsedSatellite[]>([]);
  const hoveredRef = useRef<string | null>(null);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  // Parse TLEs once
  useEffect(() => {
    const sats: ParsedSatellite[] = [];
    for (const tle of tles) {
      try {
        const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        sats.push({
          name: tle.name.trim(),
          noradId: tle.line1.slice(2, 7).trim(),
          satrec,
          lat: 0, lon: 0, altKm: 0,
          color: "#38bdf8",
          orbitType: "LEO",
          screenX: 0, screenY: 0,
          visible: false,
        });
      } catch {}
    }
    parsedSatsRef.current = sats;
  }, [tles]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.38;
    const fov = 1000;
    const rotX = rotXRef.current;
    const rotY = rotYRef.current;
    const now = new Date();

    ctx.clearRect(0, 0, W, H);

    // ── Outer glow ────────────────────────────────────────────────────────────
    const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.6);
    outerGlow.addColorStop(0, "rgba(59,130,246,0.07)");
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, W, H);

    // ── Atmosphere ring ───────────────────────────────────────────────────────
    const atmo = ctx.createRadialGradient(cx, cy, radius * 0.93, cx, cy, radius * 1.1);
    atmo.addColorStop(0, "rgba(96,165,250,0.18)");
    atmo.addColorStop(0.5, "rgba(99,102,241,0.07)");
    atmo.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = atmo;
    ctx.fill();

    // ── Globe base ────────────────────────────────────────────────────────────
    const globeGrad = ctx.createRadialGradient(
      cx - radius * 0.35, cy - radius * 0.35, 0,
      cx, cy, radius
    );
    globeGrad.addColorStop(0, "#1e3a5f");
    globeGrad.addColorStop(0.35, "#0f2440");
    globeGrad.addColorStop(0.7, "#071828");
    globeGrad.addColorStop(1, "#030b14");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = globeGrad;
    ctx.fill();

    // ── Day/night terminator ──────────────────────────────────────────────────
    const [sx, sy, sz] = getSunDirection(now);
    // Darken the night side using an overlay
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    const nightGrad = ctx.createRadialGradient(
      cx - sx * radius * 0.9, cy - sy * radius * 0.9, 0,
      cx, cy, radius * 1.4
    );
    nightGrad.addColorStop(0, "transparent");
    nightGrad.addColorStop(0.5, "rgba(0,0,20,0.2)");
    nightGrad.addColorStop(1, "rgba(0,0,10,0.55)");
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // ── Grid lines ────────────────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = "rgba(96,165,250,0.07)";
    ctx.lineWidth = 0.5;
    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 181; lon += 3) {
        const [x, y, z] = latLonToXYZ(lat, lon, radius);
        const [px, py, pz] = project(x, y, z, rotX, rotY, cx, cy, fov);
        if (pz < 0) { first ? ctx.moveTo(px, py) : ctx.lineTo(px, py); first = false; }
        else first = true;
      }
      ctx.stroke();
    }
    for (let lon = -180; lon < 180; lon += 20) {
      ctx.beginPath();
      let first = true;
      for (let lat = -90; lat <= 90; lat += 2) {
        const [x, y, z] = latLonToXYZ(lat, lon, radius);
        const [px, py, pz] = project(x, y, z, rotX, rotY, cx, cy, fov);
        if (pz < 0) { first ? ctx.moveTo(px, py) : ctx.lineTo(px, py); first = false; }
        else first = true;
      }
      ctx.stroke();
    }
    ctx.restore();

    // ── Continent dot map ─────────────────────────────────────────────────────
    const continents: [number, number, number][] = [
      // North America
      [60,-135,0.45],[55,-110,0.45],[50,-95,0.45],[45,-90,0.45],[40,-90,0.45],[35,-85,0.45],
      [30,-90,0.45],[25,-80,0.45],[45,-75,0.45],[50,-65,0.45],[55,-60,0.45],[40,-75,0.45],
      [35,-105,0.45],[45,-120,0.45],[50,-125,0.45],[60,-120,0.45],[65,-130,0.45],[70,-140,0.45],
      // South America
      [5,-75,0.45],[0,-60,0.45],[-5,-50,0.45],[-10,-50,0.45],[-15,-48,0.45],[-20,-45,0.45],
      [-25,-50,0.45],[-30,-55,0.45],[-35,-58,0.45],[-40,-63,0.45],[-45,-67,0.45],[-50,-68,0.45],
      // Europe
      [60,10,0.5],[55,10,0.5],[50,10,0.5],[50,15,0.5],[50,20,0.5],[55,20,0.5],[60,25,0.5],
      [55,25,0.5],[45,15,0.5],[45,20,0.5],[40,15,0.5],[40,20,0.5],[45,10,0.5],[50,5,0.5],
      [55,5,0.5],[60,5,0.5],[65,15,0.5],[65,25,0.5],[70,25,0.5],[48,2,0.5],[52,0,0.5],
      // Africa
      [35,5,0.45],[30,10,0.45],[25,15,0.45],[20,20,0.45],[15,20,0.45],[10,20,0.45],[5,20,0.45],
      [0,20,0.45],[-5,25,0.45],[-10,25,0.45],[-15,25,0.45],[-20,25,0.45],[-25,28,0.45],
      [-30,28,0.45],[-35,25,0.45],[35,15,0.45],[30,25,0.45],[25,30,0.45],[20,35,0.45],
      [15,35,0.45],[10,35,0.45],[0,35,0.45],[-5,35,0.45],[15,10,0.45],[10,10,0.45],
      // Asia
      [60,80,0.45],[55,80,0.45],[50,80,0.45],[50,70,0.45],[55,70,0.45],[60,70,0.45],
      [65,75,0.45],[70,80,0.45],[60,90,0.45],[55,90,0.45],[50,90,0.45],[50,100,0.45],
      [55,100,0.45],[50,110,0.45],[45,110,0.45],[40,110,0.45],[35,110,0.45],[30,110,0.45],
      [25,110,0.45],[30,100,0.45],[25,100,0.45],[20,85,0.45],[25,85,0.45],[30,80,0.45],
      [25,75,0.45],[20,75,0.45],[15,75,0.45],[10,75,0.45],[35,75,0.45],[40,75,0.45],
      [45,75,0.45],[40,65,0.45],[35,65,0.45],[30,55,0.45],[25,55,0.45],[35,55,0.45],
      [40,55,0.45],[45,60,0.45],[50,60,0.45],[55,60,0.45],[60,60,0.45],[40,45,0.45],
      [35,45,0.45],[35,35,0.45],[40,35,0.45],[37,35,0.45],
      // Australia
      [-20,130,0.5],[-25,130,0.5],[-25,140,0.5],[-20,140,0.5],[-15,135,0.5],[-30,135,0.5],
      [-30,145,0.5],[-35,145,0.5],[-35,138,0.5],[-32,138,0.5],[-28,153,0.5],[-32,115,0.5],
      // Japan/Korea
      [35,135,0.45],[38,140,0.45],[40,140,0.45],[37,127,0.45],
    ];

    ctx.save();
    for (const [lat, lon, opacity] of continents) {
      const [x, y, z] = latLonToXYZ(lat, lon, radius);
      const [px, py, pz] = project(x, y, z, rotX, rotY, cx, cy, fov);
      if (pz < 0) {
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${opacity * 0.55})`;
        ctx.fill();
      }
    }
    ctx.restore();

    // ── Equator ───────────────────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = "rgba(251,191,36,0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    let firstEq = true;
    for (let lon = -180; lon <= 181; lon += 2) {
      const [x, y, z] = latLonToXYZ(0, lon, radius);
      const [px, py, pz] = project(x, y, z, rotX, rotY, cx, cy, fov);
      if (pz < 0) { firstEq ? ctx.moveTo(px, py) : ctx.lineTo(px, py); firstEq = false; }
      else firstEq = true;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ── Globe rim ─────────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const rimGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    rimGrad.addColorStop(0, "rgba(96,165,250,0.5)");
    rimGrad.addColorStop(0.5, "rgba(99,102,241,0.3)");
    rimGrad.addColorStop(1, "rgba(96,165,250,0.15)");
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Specular highlight ────────────────────────────────────────────────────
    const spec = ctx.createRadialGradient(
      cx - radius * 0.35, cy - radius * 0.4, 0,
      cx - radius * 0.1, cy - radius * 0.2, radius * 0.55
    );
    spec.addColorStop(0, "rgba(255,255,255,0.05)");
    spec.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();

    // ── User location marker ──────────────────────────────────────────────────
    if (userLat != null && userLon != null) {
      const [x, y, z] = latLonToXYZ(userLat, userLon, radius * 1.01);
      const [px, py, pz] = project(x, y, z, rotX, rotY, cx, cy, fov);
      if (pz < 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251,191,36,0.2)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24";
        ctx.fill();
        ctx.font = "9px monospace";
        ctx.fillStyle = "rgba(251,191,36,0.8)";
        ctx.fillText("YOU", px + 7, py - 3);
        ctx.restore();
      }
    }

    // ── Satellites ────────────────────────────────────────────────────────────
    const updatedSats: ParsedSatellite[] = [];
    for (const sat of parsedSatsRef.current) {
      try {
        const pv = satellite.propagate(sat.satrec, now);
        const pos = pv.position;
        if (!pos || typeof pos === "boolean") { updatedSats.push(sat); continue; }
        const gmst = satellite.gstime(now);
        const geo = satellite.eciToGeodetic(pos, gmst);
        const lat = satellite.degreesLat(geo.latitude);
        const lon = satellite.degreesLong(geo.longitude);
        const altKm = geo.height;
        const orbitType = getOrbitType(altKm);
        const color = getOrbitColor(orbitType, sat.name);
        const orbitR = radius * (1 + altKm / 6371);
        const [x, y, z] = latLonToXYZ(lat, lon, orbitR);
        const [px, py, pz] = project(x, y, z, rotX, rotY, cx, cy, fov);
        const visible = pz < 0;
        const isHovered = hoveredRef.current === sat.name;
        const isTracked = trackedSatId === sat.name;

        if (visible) {
          const dotR = isTracked ? 5 : isHovered ? 4 : 2.5;
          // Glow
          if (isHovered || isTracked) {
            const g = ctx.createRadialGradient(px, py, 0, px, py, 16);
            g.addColorStop(0, `${color}60`);
            g.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(px, py, 16, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(px, py, dotR, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = isTracked ? 8 : 3;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (isTracked || isHovered) {
            ctx.save();
            ctx.font = "bold 10px monospace";
            ctx.fillStyle = color;
            ctx.fillText(sat.name.length > 14 ? sat.name.slice(0, 14) + "…" : sat.name, px + 8, py - 4);
            ctx.restore();
          }
        }

        updatedSats.push({ ...sat, lat, lon, altKm, orbitType, color, screenX: px, screenY: py, visible });
      } catch {
        updatedSats.push(sat);
      }
    }
    parsedSatsRef.current = updatedSats;
  }, [trackedSatId, userLat, userLon]);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;
    const loop = () => {
      if (autoRotate.current) rotYRef.current += 0.004;
      draw();
      frameCount++;
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Canvas resize
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    autoRotate.current = false;
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotYRef.current += dx * 0.005;
      rotXRef.current = Math.max(-1.3, Math.min(1.3, rotXRef.current + dy * 0.005));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hover detection
      const rect = canvasRef.current!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const mx = (e.clientX - rect.left) * dpr;
      const my = (e.clientY - rect.top) * dpr;
      const hit = parsedSatsRef.current.find(
        (s) => s.visible && Math.hypot(s.screenX - mx, s.screenY - my) < 14
      );
      
      const prevHovered = hoveredRef.current;
      hoveredRef.current = hit?.name ?? null;

      if (hit) {
        setTooltip({ name: hit.name, x: e.clientX - rect.left, y: e.clientY - rect.top });
        if (prevHovered !== hit.name && onSatelliteHover) {
          onSatelliteHover(hit);
        }
      } else {
        setTooltip(null);
        if (prevHovered !== null && onSatelliteHover) {
          onSatelliteHover(null);
        }
      }
    }
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    autoRotateTimer.current = setTimeout(() => { autoRotate.current = true; }, 3500);
  };
  const onClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left) * dpr;
    const my = (e.clientY - rect.top) * dpr;
    const hit = parsedSatsRef.current.find(
      (s) => s.visible && Math.hypot(s.screenX - mx, s.screenY - my) < 18
    );
    if (hit && onSatelliteClick) onSatelliteClick(hit);
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      autoRotate.current = false;
      if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
      const touch = e.touches[0];
      lastMouse.current = { x: touch.clientX, y: touch.clientY };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastMouse.current.x;
      const dy = touch.clientY - lastMouse.current.y;
      rotYRef.current += dx * 0.005;
      rotXRef.current = Math.max(-1.3, Math.min(1.3, rotXRef.current + dy * 0.005));
      lastMouse.current = { x: touch.clientX, y: touch.clientY };
    }
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    autoRotateTimer.current = setTimeout(() => { autoRotate.current = true; }, 3500);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseLeave={() => {
          onMouseUp();
          setTooltip(null);
          const prev = hoveredRef.current;
          hoveredRef.current = null;
          if (prev !== null && onSatelliteHover) {
            onSatelliteHover(null);
          }
        }}
        onClick={onClick}
      />

      {/* Satellite count overlay */}
      <div className="absolute bottom-3 left-3 font-mono text-[10px] text-zinc-500 space-y-0.5 pointer-events-none">
        <div>{tles.length} satellites loaded</div>
        <div>Drag to rotate · Click satellite to inspect</div>
      </div>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 bg-black/90 border border-white/15 rounded-lg px-3 py-1.5 font-mono text-xs text-white whitespace-nowrap shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          {tooltip.name}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/8 rounded-xl p-3 space-y-1.5 pointer-events-none">
        {[
          { color: "#60a5fa", label: "ISS / Station" },
          { color: "#34d399", label: "Starlink" },
          { color: "#f59e0b", label: "GPS / Nav" },
          { color: "#818cf8", label: "GEO" },
          { color: "#38bdf8", label: "Other LEO" },
          { color: "#fbbf24", label: "Your Location" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-mono text-zinc-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, Clock, Navigation, ArrowUp } from "lucide-react";

interface ISSCompassProps {
  issLat: number | null;
  issLon: number | null;
  userLat: number | null;
  userLon: number | null;
  nextPass?: {
    startUTC: string;
    maxElevation: number;
    startAzimuth: number;
    endAzimuth: number;
  } | null;
  isLoading?: boolean;
}

function calcBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatCountdown(targetUTC: string): string {
  const diff = new Date(targetUTC).getTime() - Date.now();
  if (diff <= 0) return "NOW";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function CompassDial({ bearing }: { bearing: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) * 0.42;

    ctx.clearRect(0, 0, W, H);

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(244,63,94,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tick marks
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180 - Math.PI / 2;
      const isMajor = deg % 90 === 0;
      const inner = isMajor ? r - 14 : r - 8;
      const outer = r - 2;
      ctx.beginPath();
      ctx.moveTo(cx + inner * Math.cos(rad), cy + inner * Math.sin(rad));
      ctx.lineTo(cx + outer * Math.cos(rad), cy + outer * Math.sin(rad));
      ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)";
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    // Cardinal labels
    const labels: [string, number][] = [["N", 0], ["E", 90], ["S", 180], ["W", 270]];
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [label, deg] of labels) {
      const rad = (deg * Math.PI) / 180 - Math.PI / 2;
      const lr = r - 24;
      ctx.fillStyle = label === "N" ? "#f43f5e" : "rgba(255,255,255,0.3)";
      ctx.fillText(label, cx + lr * Math.cos(rad), cy + lr * Math.sin(rad));
    }

    // Needle — pointing at bearing
    const needleRad = (bearing * Math.PI) / 180 - Math.PI / 2;
    const needleLen = r - 32;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + needleLen * Math.cos(needleRad), cy + needleLen * Math.sin(needleRad));
    const grad = ctx.createLinearGradient(cx, cy,
      cx + needleLen * Math.cos(needleRad), cy + needleLen * Math.sin(needleRad));
    grad.addColorStop(0, "#f43f5e");
    grad.addColorStop(1, "#60a5fa");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#f43f5e";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, [bearing]);

  return <canvas ref={canvasRef} width={140} height={140} className="w-full max-w-[140px]" />;
}

export default function ISSCompass({
  issLat, issLon, userLat, userLon, nextPass, isLoading,
}: ISSCompassProps) {
  const hasBoth = issLat != null && issLon != null && userLat != null && userLon != null;
  const bearing = hasBoth ? calcBearing(userLat!, userLon!, issLat!, issLon!) : 0;
  const distance = hasBoth ? calcDistance(userLat!, userLon!, issLat!, issLon!) : 0;

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-rose-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">ISS Compass</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-500">LIVE</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center animate-pulse">
          <div className="w-24 h-24 rounded-full border border-white/10" />
        </div>
      ) : (
        <>
          {/* Compass dial */}
          <div className="flex items-center justify-center">
            <CompassDial bearing={bearing} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-white/3 rounded-lg p-2">
              <div className="text-zinc-500 flex items-center gap-1">
                <Navigation className="h-2.5 w-2.5 text-rose-400" />
                BEARING
              </div>
              <div className="text-white font-bold mt-0.5">{bearing.toFixed(1)}°</div>
            </div>
            <div className="bg-white/3 rounded-lg p-2">
              <div className="text-zinc-500 flex items-center gap-1">
                <ArrowUp className="h-2.5 w-2.5 text-blue-400" />
                DISTANCE
              </div>
              <div className="text-white font-bold mt-0.5">{Math.round(distance).toLocaleString()} km</div>
            </div>
            {nextPass && (
              <>
                <div className="bg-white/3 rounded-lg p-2">
                  <div className="text-zinc-500 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-amber-400" />
                    NEXT PASS
                  </div>
                  <div className="text-amber-400 font-bold mt-0.5">{formatCountdown(nextPass.startUTC)}</div>
                </div>
                <div className="bg-white/3 rounded-lg p-2">
                  <div className="text-zinc-500 flex items-center gap-1">
                    <ArrowUp className="h-2.5 w-2.5 text-emerald-400" />
                    MAX ELEV
                  </div>
                  <div className="text-emerald-400 font-bold mt-0.5">{nextPass.maxElevation.toFixed(1)}°</div>
                </div>
              </>
            )}
          </div>

          {/* ISS position */}
          {issLat != null && issLon != null && (
            <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>ISS POS</span>
              <span className="text-zinc-300">
                {issLat.toFixed(2)}°{issLat >= 0 ? "N" : "S"} / {issLon.toFixed(2)}°{issLon >= 0 ? "E" : "W"}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

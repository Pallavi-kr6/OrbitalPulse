"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Layers, Cloud, Eye, Moon, Zap, Star } from "lucide-react";

interface SkyScoreCardProps {
  score: number | null;
  cloudCover: number;
  visibilityKm: number;
  moonIllumination: number;
  kpIndex: number;
  lightPollution: number;
  isLoading?: boolean;
}

function getRating(score: number): { label: string; color: string; bg: string } {
  if (score >= 8) return { label: "EXCELLENT", color: "#34d399", bg: "rgba(52,211,153,0.1)" };
  if (score >= 6) return { label: "GOOD", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" };
  if (score >= 4) return { label: "FAIR", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
  return { label: "POOR", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
}

function ScoreArc({ score }: { score: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H * 0.65;
    const r = Math.min(W, H) * 0.38;

    ctx.clearRect(0, 0, W, H);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    // Fill
    const pct = Math.min(score / 10, 1);
    const startA = Math.PI * 0.75;
    const endA = startA + pct * Math.PI * 1.5;
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, "#ef4444");
    grad.addColorStop(0.4, "#f59e0b");
    grad.addColorStop(0.7, "#60a5fa");
    grad.addColorStop(1, "#34d399");
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow dot at tip
    const tipX = cx + r * Math.cos(endA);
    const tipY = cy + r * Math.sin(endA);
    const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 12);
    glow.addColorStop(0, "rgba(96,165,250,0.8)");
    glow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(tipX, tipY, 12, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, [score]);

  return <canvas ref={canvasRef} width={160} height={100} className="w-full max-w-[160px]" />;
}

export default function SkyScoreCard({
  score,
  cloudCover,
  visibilityKm,
  moonIllumination,
  kpIndex,
  lightPollution,
  isLoading,
}: SkyScoreCardProps) {
  const displayScore = score ?? 0;
  const rating = getRating(displayScore);

  const metrics = [
    {
      icon: <Cloud className="h-3.5 w-3.5" />,
      label: "Cloud Cover",
      value: `${cloudCover}%`,
      score: 1 - cloudCover / 100,
      color: "#60a5fa",
    },
    {
      icon: <Eye className="h-3.5 w-3.5" />,
      label: "Visibility",
      value: `${Math.round(visibilityKm / 1000)}km`,
      score: Math.min(visibilityKm / 20000, 1),
      color: "#34d399",
    },
    {
      icon: <Moon className="h-3.5 w-3.5" />,
      label: "Moon",
      value: `${Math.round(moonIllumination * 100)}%`,
      score: 1 - moonIllumination,
      color: "#a78bfa",
    },
    {
      icon: <Zap className="h-3.5 w-3.5" />,
      label: "Geomagnetic",
      value: `Kp ${kpIndex.toFixed(1)}`,
      score: 1 - kpIndex / 9,
      color: "#f59e0b",
    },
    {
      icon: <Star className="h-3.5 w-3.5" />,
      label: "Light Pollution",
      value: `${Math.round(lightPollution * 100)}%`,
      score: 1 - lightPollution,
      color: "#f472b6",
    },
  ];

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Sky Score</span>
        </div>
        <span
          className="text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold tracking-widest"
          style={{ color: rating.color, borderColor: `${rating.color}40`, background: rating.bg }}
        >
          {rating.label}
        </span>
      </div>

      {/* Arc gauge */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 animate-pulse">
          <div className="w-24 h-16 rounded-full bg-white/5" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex items-center justify-center">
            <ScoreArc score={displayScore} />
            <div className="absolute bottom-2 text-center">
              <div className="text-3xl font-black font-mono" style={{ color: rating.color }}>
                {displayScore.toFixed(1)}
              </div>
              <div className="text-[9px] font-mono text-zinc-500">/ 10</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-metrics */}
      <div className="space-y-2 flex-1">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-1 text-zinc-500" style={{ color: m.color }}>
                {m.icon}
                <span className="text-zinc-400">{m.label}</span>
              </span>
              <span className="text-zinc-300">{m.value}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(1, m.score)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

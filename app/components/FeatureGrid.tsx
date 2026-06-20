"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Globe,
  SunDim,
  BrainCircuit,
  Compass,
  Satellite,
  Compass as CompassIcon,
  Sun,
  Eye,
  Activity,
  Layers
} from "lucide-react";

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  stats?: string;
  visualComponent?: React.ReactNode;
}

export default function FeatureGrid() {
  const features: FeatureItem[] = [
    {
      id: "globe",
      title: "Live Orbital Globe",
      description: "Interactive 3D celestial sphere tracking 27,000+ active satellites, space debris, and orbital trajectories in real-time.",
      icon: <Globe className="h-6 w-6 text-blue-400" />,
      badge: "3D Visualizer",
      stats: "27,419 Objects Tracked",
      visualComponent: (
        <div className="relative h-28 w-full mt-4 rounded-lg bg-blue-950/20 border border-blue-500/10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border border-dashed border-blue-400/30 flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-blue-400 animate-pulse" />
            </div>
          </motion.div>
          {/* Orbital path */}
          <div className="absolute w-24 h-12 rounded-full border border-indigo-400/20 rotate-45" />
          <div className="absolute w-32 h-8 rounded-full border border-purple-400/20 -rotate-12" />
        </div>
      ),
    },
    {
      id: "sky-score",
      title: "Sky Quality Score",
      description: "Hyperlocal atmospheric metrics combining Bortle scale, cloud cover, humidity, and light pollution index.",
      icon: <Layers className="h-6 w-6 text-cyan-400" />,
      badge: "Atmosphere",
      stats: "Bortle Class: 3 (Excellent)",
      visualComponent: (
        <div className="mt-4 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>LIGHT POLLUTION:</span>
            <span className="text-cyan-400 font-bold">0.82 mcd/m²</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
            <span>CLOUD FRACTION:</span>
            <span className="text-emerald-400">12%</span>
          </div>
        </div>
      ),
    },
    {
      id: "solar-weather",
      title: "Solar Weather Intelligence",
      description: "Real-time alerts for solar flares, coronal mass ejections, auroral visibility, and geomagnetic storms.",
      icon: <Sun className="h-6 w-6 text-amber-400 animate-pulse" />,
      badge: "Space Weather",
      stats: "Solar Wind: 412 km/s",
      visualComponent: (
        <div className="mt-4 flex gap-4 items-center justify-between bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
          <div className="space-y-1 font-mono text-[11px]">
            <div className="text-zinc-400">GEOMAGNETIC ACTIVITY:</div>
            <div className="text-amber-400 font-bold text-sm">Kp-Index: 4 (Active)</div>
          </div>
          <Activity className="h-8 w-8 text-amber-500/40 animate-pulse" />
        </div>
      ),
    },
    {
      id: "ai-narrator",
      title: "AI Sky Narrator",
      description: "Generative AI analysis of tonight's visible objects, meteor showers, and optimal observation windows.",
      icon: <BrainCircuit className="h-6 w-6 text-purple-400" />,
      badge: "AI Insights",
      stats: "Model: SkyGPT v4",
      visualComponent: (
        <div className="mt-4 p-3 rounded-lg bg-purple-950/20 border border-purple-500/10 font-sans text-xs italic text-zinc-300">
          \"Tonight's sky offers a rare 88% clarity. Look east at 22:40 for a bright passage of the ISS near Vega.\"
        </div>
      ),
    },
    {
      id: "iss-compass",
      title: "ISS AR Compass",
      description: "Interactive direction guide showing relative bearing, elevation, and time to next overhead pass.",
      icon: <Compass className="h-6 w-6 text-rose-400" />,
      badge: "AR Navigation",
      stats: "Next Pass: 14m 20s",
      visualComponent: (
        <div className="relative h-28 w-full mt-4 rounded-lg bg-rose-950/10 border border-rose-500/10 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-rose-500/20 flex items-center justify-center relative">
            <span className="absolute top-1 font-mono text-[8px] text-zinc-500">N</span>
            <span className="absolute bottom-1 font-mono text-[8px] text-zinc-500">S</span>
            {/* Needle */}
            <motion.div
              animate={{ rotate: [0, 45, 30, 45] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-1 h-14 bg-gradient-to-b from-rose-500 to-transparent absolute rounded-full origin-center"
              style={{ transformOrigin: "center 28px" }}
            />
            <div className="w-2 h-2 rounded-full bg-rose-400 z-10" />
          </div>
        </div>
      ),
    },
    {
      id: "satellite-explorer",
      title: "Real-Time Satellite Explorer",
      description: "Track telecommunication, scientific, and navigation constellations including Starlink, GPS, and Galileo.",
      icon: <Satellite className="h-6 w-6 text-emerald-400" />,
      badge: "Constellations",
      stats: "Starlink Active: 6,120",
      visualComponent: (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">STARLINK-30114</span>
            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">LINE-OF-SIGHT</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
            <span>AZ: 184.2°</span>
            <span>EL: 42.1°</span>
            <span>RANGE: 520km</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="w-full max-w-6xl py-24 px-6 relative z-10">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Sky Intelligence Modules
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base font-light">
          Unlock telemetry, orbital tracking, and space weather data in a single dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="flex"
          >
            {feature.id === "globe" ? (
              <Link href="/globe" className="flex flex-1">
                <Card className="glass-panel glass-panel-hover flex-1 flex flex-col justify-between overflow-hidden relative group cursor-pointer">
                  {/* Subtle hover background highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="p-6 pb-2 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                        {feature.icon}
                      </div>
                      {feature.badge && (
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-800/30 px-2 py-0.5 rounded-full border border-white/5">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-6 pt-2 relative z-10 flex-1 flex flex-col justify-between">
                    <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div>
                      {feature.visualComponent}
                      {feature.stats && (
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                          <span>METRIC:</span>
                          <span className="text-zinc-300">{feature.stats}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : feature.id === "satellite-explorer" ? (
              <Link href="/explorer" className="flex flex-1">
                <Card className="glass-panel glass-panel-hover flex-1 flex flex-col justify-between overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="p-6 pb-2 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                        {feature.icon}
                      </div>
                      {feature.badge && (
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-800/30 px-2 py-0.5 rounded-full border border-white/5">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-6 pt-2 relative z-10 flex-1 flex flex-col justify-between">
                    <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div>
                      {feature.visualComponent}
                      {feature.stats && (
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                          <span>METRIC:</span>
                          <span className="text-zinc-300">{feature.stats}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="glass-panel glass-panel-hover flex-1 flex flex-col justify-between overflow-hidden relative group">
                {/* Subtle hover background highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="p-6 pb-2 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-800/30 px-2 py-0.5 rounded-full border border-white/5">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 pt-2 relative z-10 flex-1 flex flex-col justify-between">
                  <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div>
                    {feature.visualComponent}
                    {feature.stats && (
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                        <span>METRIC:</span>
                        <span className="text-zinc-300">{feature.stats}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

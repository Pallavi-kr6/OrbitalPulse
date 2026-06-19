"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radar, Compass, Globe } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 py-24">
      {/* Aurora glow backdrops */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-aurora" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-aurora" />

      {/* Telemetry data overlay (NASA/SpaceX Style) */}
      <div className="absolute left-6 bottom-10 hidden xl:flex flex-col gap-2 font-mono text-[10px] text-zinc-500 tracking-wider">
        <div>SYS.STATUS: ONLINE</div>
        <div>SYS.LOC: WGS-84 ACTIVE</div>
        <div>SCANNER: ACTIVE [360°]</div>
      </div>
      <div className="absolute right-6 bottom-10 hidden xl:flex flex-col gap-2 font-mono text-[10px] text-zinc-500 text-right tracking-wider">
        <div>ORBITAL_PULSE_OS_v1.0.0</div>
        <div>ALT: SEA LEVEL</div>
        <div>LAT: 28.6139° N / LONG: 77.2090° E</div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
        {/* Sky telemetry badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono text-[11px] uppercase tracking-widest"
        >
          <Radar className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          Sky Telemetry Live
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight"
        >
          <span className="text-white block sm:inline">The Living </span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent block sm:inline">
            Sky OS
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg sm:text-2xl text-zinc-300 max-w-2xl font-light tracking-wide leading-relaxed"
        >
          What is the sky above you doing right now?
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto px-4"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full font-bold uppercase tracking-widest text-xs px-8 py-6 gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] border-0 text-white cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              Scan My Sky
            </Button>
          </Link>
          <Link href="/globe" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full font-bold uppercase tracking-widest text-xs px-8 py-6 gap-2 border-white/20 hover:border-white/40 hover:bg-white/5 backdrop-blur-md cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              Explore Demo
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Grid overlay for a hardware/technical feeling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
    </section>
  );
}

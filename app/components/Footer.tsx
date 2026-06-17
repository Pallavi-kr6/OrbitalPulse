import React from "react";
import { Orbit, Cpu, Globe, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#030014] border-t border-white/5 relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <Orbit className="h-5 w-5 text-blue-400" />
              <span className="font-bold tracking-widest text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ORBITAL PULSE
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-light">
              Real-time atmospheric mapping and satellite intelligence engine. Designed to catalog and visualize the celestial events happening above you.
            </p>
          </div>

          {/* Integration Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Data Sources
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-light">
              <li>
                <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">NASA Open APIs</a>
              </li>
              <li>
                <a href="https://celestrak.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Celestrak Satellite Catalog</a>
              </li>
              <li>
                <a href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">NOAA Space Weather Prediction</a>
              </li>
            </ul>
          </div>

          {/* Telemetry Status Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Telemetry Status
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>API Gateway: Online</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ISS Tracker: Locked</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Geomagnetic Sensor: Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-zinc-500 tracking-wider">
            © {new Date().getFullYear()} ORBITAL PULSE. COSPAR CATALOG ENABLED.
          </p>
          <p className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 tracking-wider">
            ENGINERING BY SPACEX + NASA STANDARDS
          </p>
        </div>
      </div>
    </footer>
  );
}

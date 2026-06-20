import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Orbit, Compass, Activity, Shield } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(13,10,37,0.5)]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Orbit className="h-6 w-6 text-blue-400 group-hover:rotate-180 transition-transform duration-700 ease-out" />
          <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            ORBITAL PULSE
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/globe"
            className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            Live Globe
          </Link>
          <Link
            href="#weather"
            className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            Solar Weather
          </Link>
          <Link
            href="#compass"
            className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            ISS Compass
          </Link>
          <Link
            href="/explorer"
            className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            Satellite Explorer
          </Link>
        </div>

        {/* Action Button */}
        <div>
          <Button variant="glass" className="rounded-full text-xs font-bold uppercase tracking-wider px-5 py-2">
            Initialize Scan
          </Button>
        </div>
      </nav>
    </header>
  );
}

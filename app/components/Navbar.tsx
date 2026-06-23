"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Orbit, Globe, Compass, Activity, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/globe", label: "Live Globe", icon: Globe },
  { href: "/explorer", label: "Satellite Explorer", icon: Compass },
  { href: "/dashboard", label: "My Sky Dashboard", icon: Activity },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(13,10,37,0.5)]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50" onClick={closeMenu}>
          <Orbit className="h-6 w-6 text-blue-400 group-hover:rotate-180 transition-transform duration-700 ease-out" />
          <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            ORBITAL PULSE
          </span>
        </Link>

        {/* Desktop Navigation Items */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                  isActive ? "text-blue-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors z-50 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-16 left-4 right-4 bg-[#0a081a]/95 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl flex flex-col gap-4 md:hidden z-40"
            >
              <div className="flex flex-col gap-2 pt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-mono uppercase tracking-wider transition-all ${
                        isActive
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-white/5 border-transparent text-zinc-400 hover:border-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}


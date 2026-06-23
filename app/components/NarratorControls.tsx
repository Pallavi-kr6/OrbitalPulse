"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useNarration } from "@/lib/hooks/useNarration";
import { Play, Pause, Square, Volume2, VolumeX, RotateCcw, ChevronUp, ChevronDown, X } from "lucide-react";

export default function NarratorControls() {
  const pathname = usePathname();
  const {
    isSpeaking,
    isMuted,
    isPaused,
    currentText,
    mute,
    unmute,
    stop,
    replay,
    pauseSpeech,
    resumeSpeech,
    isSupported,
  } = useNarration();

  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Avoid SSR hydration mismatches
  if (!mounted || !isSupported) return null;

  const handlePlayPause = () => {
    if (isSpeaking) {
      if (isPaused) {
        resumeSpeech();
      } else {
        pauseSpeech();
      }
    } else {
      replay(pathname);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  };

  // Determine status label
  let statusText = "Narrator Idle";
  if (isMuted) {
    statusText = "Narrator Muted";
  } else if (isSpeaking) {
    statusText = isPaused ? "Narration Paused" : "Speaking...";
  }

  // Safe positioning logic for desktop (>=768px) to avoid blocking main content
  const getDesktopPositionClasses = (path: string) => {
    if (path === "/dashboard") {
      return "md:bottom-6 md:left-6 md:right-auto";
    }
    if (path === "/explorer") {
      return "md:bottom-6 md:left-[26%] md:right-auto";
    }
    if (path === "/globe") {
      return "md:bottom-6 md:left-[305px] md:right-auto";
    }
    // Default to bottom-right for home page or miscellaneous routes
    return "md:bottom-6 md:right-6 md:left-auto";
  };

  const desktopPositionClass = getDesktopPositionClasses(pathname);

  return (
    <>
      {/* Floating launcher button when the panel is closed/hidden */}
      <AnimatePresence>
        {!isPanelVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsPanelVisible(true)}
            className={`fixed z-[99] p-3 rounded-full bg-purple-600/95 border border-purple-500/30 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-md hover:bg-purple-500 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer bottom-4 right-4 ${
              isMobile ? "bottom-4 right-4" : desktopPositionClass
            }`}
            title="Open Voice Guide"
          >
            <div className="flex items-center justify-center w-5 h-5 font-bold font-mono text-xs bg-black/40 rounded-full">
              N
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase pr-1">
              Voice
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main HUD Panel */}
      <AnimatePresence>
        {isPanelVisible && (
          <div
            className={`fixed z-[99] transition-all duration-300 bottom-0 left-0 right-0 w-full px-0 md:px-0 ${
              isMobile ? "bottom-0 left-0 right-0 w-full" : `md:w-80 ${desktopPositionClass}`
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 100 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMobile ? 100 : 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-black/95 md:bg-black/80 border-t md:border border-purple-500/20 backdrop-blur-2xl rounded-t-3xl md:rounded-2xl p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] md:shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden"
            >
              {/* Glowing background decor */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Collapsible Bar Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  {/* Wave Visualizer */}
                  <div className="flex items-center gap-0.5 h-3">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <motion.div
                        key={bar}
                        animate={
                          isSpeaking && !isPaused && !isMuted
                            ? { height: [4, 12, 4] }
                            : { height: 4 }
                        }
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: bar * 0.1,
                          ease: "easeInOut",
                        }}
                        className={`w-0.5 rounded-full ${
                          isSpeaking && !isPaused && !isMuted ? "bg-purple-400" : "bg-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-purple-300 uppercase">
                    AI Voice HUD
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    {statusText}
                  </span>
                  
                  {/* Collapse/Expand Toggle for Mobile */}
                  {isMobile && (
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title={isCollapsed ? "Expand panel" : "Collapse panel"}
                    >
                      {isCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}

                  {/* Close / Dismiss Button */}
                  <button
                    onClick={() => setIsPanelVisible(false)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Hide Voice HUD"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Render Panel Content */}
              <motion.div
                animate={isCollapsed && isMobile ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden space-y-3"
              >
                {/* Current Transcript Box */}
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/5 h-12 flex items-center justify-center overflow-hidden">
                  {isSpeaking && currentText ? (
                    <p className="text-[10px] text-zinc-300 font-mono italic text-center line-clamp-2 leading-tight">
                      "{currentText}"
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-600 font-mono text-center">
                      {isMuted ? "Unmute to hear active guidance." : "Click Play to hear about this page."}
                    </p>
                  )}
                </div>

                {/* Controller Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePlayPause}
                    className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isSpeaking && !isPaused
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                        : "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    }`}
                    title={isSpeaking && !isPaused ? "Pause" : "Play/Resume"}
                  >
                    {isSpeaking && !isPaused ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>{isPaused ? "Resume" : "Play"}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={stop}
                    disabled={!isSpeaking}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="Stop"
                  >
                    <Square className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={handleMuteToggle}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isMuted
                        ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400 hover:text-white"
                    }`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={() => replay(pathname)}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    title="Replay Current Page Guide"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Simple Inline Mini-Controls for Collapsed State on Mobile */}
              {isCollapsed && isMobile && (
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="text-[10px] font-mono text-zinc-400 italic truncate max-w-[70%]">
                    {isSpeaking && currentText ? `"${currentText}"` : "Collapsible audio panel active"}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePlayPause}
                      className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/20 text-purple-300 hover:bg-purple-500/25 transition-colors cursor-pointer"
                      title={isSpeaking && !isPaused ? "Pause" : "Play/Resume"}
                    >
                      {isSpeaking && !isPaused ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={handleMuteToggle}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

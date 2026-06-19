"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Volume2, VolumeX, RefreshCw, Sparkles } from "lucide-react";

interface AINarratorProps {
  narration: {
    summary: string;
    visibility: string;
    bestTime: string;
    direction: string;
  } | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

function TypewriterText({ text, speed = 25 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    idxRef.current = 0;
    const timer = setInterval(() => {
      if (idxRef.current < text.length) {
        setDisplayed((prev) => prev + text[idxRef.current]);
        idxRef.current++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[14px] bg-purple-400 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

export default function AINarrator({ narration, isLoading, onRefresh }: AINarratorProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!narration) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = narration.summary;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full p-4">
      <div className="bg-purple-950/20 backdrop-blur-md border border-purple-500/15 rounded-2xl p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">AI Sky Narrator</span>
            <Sparkles className="h-3 w-3 text-purple-400/60" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={speak}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-purple-400"
              title={isSpeaking ? "Stop speaking" : "Read aloud"}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4 text-purple-400 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-purple-400"
                title="Refresh narration"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Narration text */}
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-white/5 rounded w-4/5" />
            <div className="h-3 bg-white/5 rounded w-3/5" />
          </div>
        ) : narration ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-200 leading-relaxed italic font-light">
              <TypewriterText text={`"${narration.summary}"`} />
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
              {[
                { label: "VISIBILITY", value: narration.visibility, color: "text-cyan-400" },
                { label: "BEST TIME", value: narration.bestTime, color: "text-amber-400" },
                { label: "DIRECTION", value: narration.direction, color: "text-emerald-400" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-[8px] font-mono text-zinc-600 mb-0.5">{item.label}</div>
                  <div className={`text-[10px] font-mono ${item.color} line-clamp-2`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 italic">Waiting for location data to generate narration…</p>
        )}
      </div>
    </div>
  );
}

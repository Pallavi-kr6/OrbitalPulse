import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";

interface OfflineStateProps {
  onRetry?: () => void;
}

export default function OfflineState({ onRetry }: OfflineStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-white/5 border border-zinc-500/20 rounded-xl">
      <WifiOff className="h-8 w-8 text-zinc-400 mb-3" />
      <p className="text-xs font-mono text-zinc-300 font-bold mb-1">You are offline</p>
      <p className="text-[10px] font-mono text-zinc-500 mb-4">Please check your internet connection.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-[10px] font-mono font-bold tracking-widest transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          RETRY
        </button>
      )}
    </div>
  );
}

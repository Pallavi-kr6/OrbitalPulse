import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Failed to load data", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-white/5 border border-red-500/20 rounded-xl">
      <AlertTriangle className="h-8 w-8 text-red-400 mb-3" />
      <p className="text-xs font-mono text-red-200 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-mono font-bold tracking-widest transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          RETRY
        </button>
      )}
    </div>
  );
}

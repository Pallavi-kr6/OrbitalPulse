import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading data..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-white/2 rounded-xl">
      <Loader2 className="h-8 w-8 text-blue-400 animate-spin mb-3" />
      <p className="text-[10px] font-mono text-zinc-500 animate-pulse">{message}</p>
    </div>
  );
}

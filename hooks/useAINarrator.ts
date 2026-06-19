"use client";

import { useQuery } from "@tanstack/react-query";

export function useAINarrator(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ["ai-narrator", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`/api/ai-narrator?lat=${latitude}&lon=${longitude}`);
      if (!response.ok) {
        throw new Error("Failed to load AI narration");
      }
      const result = await response.json();
      return result.data ?? result;
    },
    staleTime: 900_000,
    retry: 3,
    refetchOnWindowFocus: false,
    enabled: typeof latitude === "number" && typeof longitude === "number",
  });
}

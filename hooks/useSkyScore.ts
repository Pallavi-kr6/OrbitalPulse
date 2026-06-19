"use client";

import { useQuery } from "@tanstack/react-query";

export function useSkyScore(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ["sky-score", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`/api/sky-score?lat=${latitude}&lon=${longitude}`);
      if (!response.ok) {
        throw new Error("Failed to load sky score");
      }
      const result = await response.json();
      return result.data ?? result;
    },
    staleTime: 300_000,
    retry: 3,
    refetchOnWindowFocus: false,
    enabled: typeof latitude === "number" && typeof longitude === "number",
  });
}

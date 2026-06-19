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
      return response.json();
    },
    staleTime: 300_000,
    retry: 2,
    enabled: typeof latitude === "number" && typeof longitude === "number",
  });
}

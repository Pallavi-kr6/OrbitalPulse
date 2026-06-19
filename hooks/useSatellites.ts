"use client";

import { useQuery } from "@tanstack/react-query";

export function useSatellites(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ["satellites", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`/api/satellites?lat=${latitude}&lon=${longitude}`);
      if (!response.ok) {
        throw new Error("Failed to load satellites");
      }
      return response.json();
    },
    staleTime: 60_000,
    retry: 2,
    enabled: typeof latitude === "number" && typeof longitude === "number",
  });
}

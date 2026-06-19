"use client";

import { useQuery } from "@tanstack/react-query";

export function useSkyStatus(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ["sky-status", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`/api/sky-status?lat=${latitude}&lon=${longitude}`);
      if (!response.ok) {
        throw new Error("Failed to load sky status");
      }
      return response.json();
    },
    staleTime: 300_000,
    retry: 2,
    enabled: typeof latitude === "number" && typeof longitude === "number",
  });
}

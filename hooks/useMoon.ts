"use client";

import { useQuery } from "@tanstack/react-query";

export function useMoon(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ["moon", latitude, longitude],
    queryFn: async () => {
      const response = await fetch(`/api/moon?lat=${latitude}&lon=${longitude}`);
      if (!response.ok) {
        throw new Error("Failed to load moon data");
      }
      return response.json();
    },
    staleTime: 12 * 60 * 60 * 1000,
    retry: 2,
    enabled: typeof latitude === "number" && typeof longitude === "number",
  });
}

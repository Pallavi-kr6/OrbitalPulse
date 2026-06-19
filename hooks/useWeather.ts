"use client";

import { useQuery } from "@tanstack/react-query";

export function useWeather(latitude: number | null, longitude: number | null) {
  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: async () => {
      const res = await fetch(`/api/sky-score?lat=${latitude}&lon=${longitude}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const result = await res.json();
      return result.data ?? result;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
    enabled: typeof latitude === "number" && typeof longitude === "number",
  });
}

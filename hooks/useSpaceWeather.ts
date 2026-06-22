"use client";

import { useQuery } from "@tanstack/react-query";
import { SpaceWeatherResponse } from "@/types/space-weather";

export function useSpaceWeather() {
  return useQuery<SpaceWeatherResponse>({
    queryKey: ["space-weather"],
    queryFn: async () => {
      const response = await fetch("/api/space-weather");
      if (!response.ok) {
        throw new Error("Failed to load space weather");
      }
      const result = await response.json();
      return result.data ?? result;
    },
    refetchInterval: 60_000, // Real-Time polling every 60 seconds
    staleTime: 30_000,
    retry: 3,
    refetchOnWindowFocus: true,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";

export function useSpaceWeather() {
  return useQuery({
    queryKey: ["space-weather"],
    queryFn: async () => {
      const response = await fetch("/api/space-weather");
      if (!response.ok) {
        throw new Error("Failed to load space weather");
      }
      return response.json();
    },
    staleTime: 300_000,
    retry: 2,
  });
}

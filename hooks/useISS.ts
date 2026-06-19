"use client";

import { useQuery } from "@tanstack/react-query";

export function useISS() {
  return useQuery({
    queryKey: ["iss-position"],
    queryFn: async () => {
      const response = await fetch("/api/iss");
      if (!response.ok) {
        throw new Error("Failed to load ISS position");
      }
      const result = await response.json();
      return result.data ?? result; // Handle both wrapped ({success, data}) and unwrapped responses
    },
    staleTime: 5000,
    retry: 3,
    refetchOnWindowFocus: false,
  });
}

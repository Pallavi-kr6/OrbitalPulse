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
      return response.json();
    },
    staleTime: 5000,
    retry: 2,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { CelesTrakTle } from "@/types/clients";

export function useTLEs() {
  return useQuery<{ tles: CelesTrakTle[]; fetchedAt: string }>({
    queryKey: ["tles"],
    queryFn: async () => {
      const res = await fetch("/api/tles");
      if (!res.ok) throw new Error("Failed to fetch TLEs");
      const result = await res.json();
      return result.data ?? result;
    },
    staleTime: 30 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });
}

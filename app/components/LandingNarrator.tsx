"use client";

import { useEffect } from "react";
import { useNarration } from "@/lib/hooks/useNarration";

export default function LandingNarrator() {
  const narrator = useNarration();

  useEffect(() => {
    // Only announce landing once per session
    narrator.announcePage("landing");
  }, [narrator]);

  return null;
}

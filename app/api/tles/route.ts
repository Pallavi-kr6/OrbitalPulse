import { successResponse, fallbackResponse } from "@/lib/api-client";
import { getTleByGroup } from "@/services/celestrak";
import { logger } from "@/lib/logger";

// Cache in-memory for 30 min (edge-compatible)
let cache: { data: unknown; ts: number } | null = null;
const TTL = 30 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < TTL) {
    return successResponse(cache.data);
  }

  try {
    const [stations, starlink, active] = await Promise.allSettled([
      getTleByGroup("stations"),
      getTleByGroup("starlink"),
      getTleByGroup("active"),
    ]);

    const issGroup =
      stations.status === "fulfilled" ? stations.value.slice(0, 1) : [];
    const starlinkGroup =
      starlink.status === "fulfilled" ? starlink.value.slice(0, 40) : [];
    // From active, take a diverse sample (GPS, science, weather)
    const activeGroup =
      active.status === "fulfilled" ? active.value.slice(0, 60) : [];

    const all = [...issGroup, ...starlinkGroup, ...activeGroup];
    // Deduplicate by name
    const seen = new Set<string>();
    const tles = all.filter((t) => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });

    const payload = { tles, fetchedAt: new Date().toISOString() };
    cache = { data: payload, ts: now };
    return successResponse(payload, "celestrak");
  } catch (err) {
    logger.error("TLE fetch failed", { error: String(err) });
    return fallbackResponse("Service unavailable", { tles: [], fetchedAt: new Date().toISOString() }, "system");
  }
}

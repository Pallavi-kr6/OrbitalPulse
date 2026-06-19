import { z } from "zod";
import { fetchJson } from "@/lib/api-client";
import { CelesTrakTle } from "@/types/clients";
import { memoize } from "@/server/redis";
import { logger } from "@/lib/logger";

const pendingRequests = new Map<
  string,
  Promise<CelesTrakTle[]>
>();

const tleSchema = z.array(
  z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string(),
  }),
);

export async function getTleByGroup(
  groupName = "active",
): Promise<CelesTrakTle[]> {

  const existing = pendingRequests.get(groupName);

  if (existing) {
    logger.debug("Using pending TLE request", { groupName });
    return existing;
  }

  const cacheKey = `celestrak-tle-${groupName}`;

  const request = memoize(cacheKey, 3600, async () => {
    const url =
      `https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(groupName)}&FORMAT=tle`;

    try {
      const raw = await fetchJson<string>(url, {
        timeoutMs: 15_000,
        retries: 3,
        backoffMs: 1_000,
        headers: {
          "User-Agent": "OrbitalPulse/1.0",
          Accept: "text/plain",
        },
      });

      const lines = raw.trim().split(/\r?\n/);
      const records: CelesTrakTle[] = [];

      for (let i = 0; i + 2 < lines.length; i += 3) {
        if (!lines[i] || !lines[i + 1] || !lines[i + 2]) {
          continue;
        }

        records.push({
          name: lines[i].trim(),
          line1: lines[i + 1].trim(),
          line2: lines[i + 2].trim(),
        });
      }

      const parsed = tleSchema.safeParse(records);

      if (!parsed.success) {
        logger.warn("Invalid CelesTrak TLE payload", {
          error: parsed.error.format(),
        });

        return [];
      }

      logger.debug("Fetched TLE group", {
        groupName,
        count: parsed.data.length,
      });

      return parsed.data;
    } catch (error) {
      logger.error("Failed to fetch CelesTrak TLEs", {
        groupName,
        error: String(error),
      });

      throw error;
    }
  });

  pendingRequests.set(groupName, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(groupName);
  }
}
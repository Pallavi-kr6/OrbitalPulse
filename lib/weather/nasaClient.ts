import { z } from "zod";
import { env } from "@/config/env";
import { fetchJson } from "@/lib/api-client";
import { NasaDonkiCME, NasaDonkiFlare } from "@/types/clients";
import { getDynamicDateRange } from "@/lib/utils/dateRange";
import { logger } from "@/lib/logger";

const flareSchema = z.array(
  z.object({
    flrID: z.string(),
    beginTime: z.string(),
    peakTime: z.string(),
    endTime: z.string().optional().nullable(),
    classType: z.string(),
  }).passthrough(),
).optional().default([]);

const cmeSchema = z.array(
  z.object({
    activityID: z.string(),
    startTime: z.string(),
  }).passthrough(),
).optional().default([]);

const gstSchema = z.array(
  z.object({
    gstID: z.string(),
    startTime: z.string(),
  }).passthrough(),
).optional().default([]);

export async function getSolarFlares(startDate?: string, endDate?: string): Promise<NasaDonkiFlare[]> {
  const dates = startDate && endDate ? { startDate, endDate } : getDynamicDateRange(7);
  const url = `https://api.nasa.gov/DONKI/FLR?startDate=${dates.startDate}&endDate=${dates.endDate}&api_key=${env.NASA_API_KEY}`;
  
  try {
    const raw = await fetchJson<unknown>(url, {
      timeoutMs: 30_000,
      retries: 3,
      backoffMs: 2_000,
      maxBackoffMs: 8_000,
    });
    const parsed = flareSchema.safeParse(raw);
    return parsed.success ? parsed.data as NasaDonkiFlare[] : [];
  } catch (error) {
    logger.error("Failed to fetch Solar Flares from NASA", { error: String(error) });
    throw error; // Will be caught by the route handler
  }
}

export async function getCMEs(startDate?: string, endDate?: string): Promise<NasaDonkiCME[]> {
  const dates = startDate && endDate ? { startDate, endDate } : getDynamicDateRange(7);
  const url = `https://api.nasa.gov/DONKI/CME?startDate=${dates.startDate}&endDate=${dates.endDate}&api_key=${env.NASA_API_KEY}`;
  
  try {
    const raw = await fetchJson<unknown>(url, {
      timeoutMs: 30_000,
      retries: 3,
      backoffMs: 2_000,
      maxBackoffMs: 8_000,
    });
    const parsed = cmeSchema.safeParse(raw);
    return parsed.success ? parsed.data as NasaDonkiCME[] : [];
  } catch (error) {
    logger.error("Failed to fetch CMEs from NASA", { error: String(error) });
    throw error;
  }
}

export async function getGST(startDate?: string, endDate?: string): Promise<any[]> {
  const dates = startDate && endDate ? { startDate, endDate } : getDynamicDateRange(7);
  const url = `https://api.nasa.gov/DONKI/GST?startDate=${dates.startDate}&endDate=${dates.endDate}&api_key=${env.NASA_API_KEY}`;
  
  try {
    const raw = await fetchJson<unknown>(url, {
      timeoutMs: 30_000,
      retries: 3,
      backoffMs: 2_000,
      maxBackoffMs: 8_000,
    });
    const parsed = gstSchema.safeParse(raw);
    return parsed.success ? parsed.data : [];
  } catch (error) {
    logger.error("Failed to fetch GST from NASA", { error: String(error) });
    throw error;
  }
}

import { env } from "@/config/env";
import { getDynamicDateRange } from "@/lib/utils/dateRange";
import { FlareData, CmeData } from "@/types/space-weather";
import { logger } from "@/lib/logger";

const NASA_BASE_URL = "https://api.nasa.gov/DONKI";

// Helper for fetch with retries
async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
}

export async function getDONKIFlares(): Promise<FlareData[]> {
  const { startDate, endDate } = getDynamicDateRange(7); // Last 7 days
  const url = `${NASA_BASE_URL}/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${env.NASA_API_KEY}`;
  
  try {
    const data = await fetchWithRetry(url);
    if (!Array.isArray(data)) return [];

    return data.map((f: any) => ({
      flareClass: f.classType,
      beginTime: f.beginTime,
      peakTime: f.peakTime,
      endTime: f.endTime || null,
    })).sort((a, b) => new Date(b.peakTime).getTime() - new Date(a.peakTime).getTime());
  } catch (err) {
    logger.error("Failed to fetch DONKI flares", { error: String(err) });
    return [];
  }
}

export async function getDONKICMEs(): Promise<CmeData[]> {
  const { startDate, endDate } = getDynamicDateRange(7);
  const url = `${NASA_BASE_URL}/CME?startDate=${startDate}&endDate=${endDate}&api_key=${env.NASA_API_KEY}`;
  
  try {
    const data = await fetchWithRetry(url);
    if (!Array.isArray(data)) return [];

    return data.map((c: any) => ({
      cmeDetected: true,
      cmeTime: c.startTime,
    })).sort((a, b) => new Date(b.cmeTime!).getTime() - new Date(a.cmeTime!).getTime());
  } catch (err) {
    logger.error("Failed to fetch DONKI CMEs", { error: String(err) });
    return [];
  }
}

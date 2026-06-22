import { logger } from "@/lib/logger";
import { KpData } from "@/types/space-weather";

const SWPC_BASE_URL = "https://services.swpc.noaa.gov";

// Helper for fetch with retries
async function fetchWithRetry(url: string, retries = 3, revalidate = 60): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        next: { revalidate }, 
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

export async function getSWPCKpIndex(): Promise<KpData[]> {
  const url = `${SWPC_BASE_URL}/json/planetary_k_index_1m.json`;
  
  try {
    const data = await fetchWithRetry(url, 3, 60); // 60s cache
    if (!Array.isArray(data)) return [];

    return data.map((d: any) => ({
      kpIndex: parseFloat(d.kp_index),
      time: d.time_tag,
    })).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  } catch (err) {
    logger.error("Failed to fetch SWPC KP Index", { error: String(err) });
    return [];
  }
}

export async function getSWPCAuroraForecast(): Promise<"Low" | "Moderate" | "High" | "Extreme" | "Unknown"> {
  const url = `${SWPC_BASE_URL}/products/animations/ovation/north.json`;
  
  try {
    const data = await fetchWithRetry(url, 3, 300); // 5m cache
    if (!Array.isArray(data) || data.length === 0) return "Unknown";

    // The endpoint usually returns coordinates and probabilities.
    // If it's a grid, we look for the max probability in the latest frame.
    // For simplicity, we assume data format gives us a max probability or we search for it.
    let maxProb = 0;
    
    // Example parsing logic based on known Ovation array shapes. 
    // Usually data array has frames, where each frame is an array of [lon, lat, probability]
    // The structure might be different, so let's try safely:
    const latestFrame = Array.isArray(data[data.length - 1]) ? data[data.length - 1] : [];
    
    // If it's the raw JSON grid structure (e.g. `Observation Time`, `Forecast Time`, `Data`...)
    // we would parse accordingly. For a robust generic approach:
    try {
       const strData = JSON.stringify(data);
       const matches = strData.match(/(\d{1,3})/g);
       if (matches) {
          // Just as a fallback heuristic if parsing fails
          maxProb = Math.min(100, Math.max(...matches.map(Number)));
       }
    } catch {
       maxProb = 0;
    }

    if (maxProb > 80) return "Extreme";
    if (maxProb > 50) return "High";
    if (maxProb > 20) return "Moderate";
    return "Low";

  } catch (err) {
    logger.error("Failed to fetch SWPC Aurora Forecast", { error: String(err) });
    return "Unknown";
  }
}

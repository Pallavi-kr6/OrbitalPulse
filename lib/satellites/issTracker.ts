import * as satellite from "satellite.js";
import type { CelesTrakTle } from "@/types/clients";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";
import { fetchJson } from "@/lib/api-client";

const ELEVATION_THRESHOLD = 0;

// Hardcoded ISS TLE as an absolute fallback if both N2YO and CelesTrak fail
const FALLBACK_ISS_TLE: CelesTrakTle = {
  name: "ISS (ZARYA)",
  line1: "1 25544U 98067A   23304.54784227  .00016717  00000+0  30164-3 0  9997",
  line2: "2 25544  51.6416 288.6672 0005705 155.6793 259.9734 15.50153835422748",
};

export async function getISSTle(): Promise<CelesTrakTle> {
  // Attempt to fetch ISS TLE from N2YO API first.
  try {
    const url = `https://api.n2yo.com/rest/v1/satellite/tle/25544&apiKey=${env.N2YO_API_KEY}`;
    const raw = await fetchJson<any>(url, { timeoutMs: 15_000, retries: 2, backoffMs: 500 });
    // Expected shape: { info: {...}, tle: "LINE1\r\nLINE2" }
    if (raw && typeof raw.tle === "string") {
      const [line1, line2] = raw.tle.split("\r\n");
      if (line1 && line2) {
        return { name: "ISS (ZARYA)", line1, line2 };
      }
    }
    logger.warn("N2YO TLE response missing expected fields, falling back to hardcoded TLE");
  } catch (error) {
    logger.warn("N2YO TLE fetch failed, falling back to hardcoded TLE", { error: String(error) });
  }
  // Final fallback to hardcoded TLE.
  return FALLBACK_ISS_TLE;
}

export async function getISSPosition(): Promise<{ latitude: number; longitude: number; altitude: number; timestamp: number }> {
  try {
    const iss = await getISSTle();
    const satrec = satellite.twoline2satrec(iss.line1, iss.line2);
    const now = new Date();
    const positionAndVelocity = satellite.propagate(satrec, now);
    const position = positionAndVelocity.position;
    
    if (!position || typeof position === "boolean") {
      throw new Error("Failed to propagate ISS position");
    }

    const gmst = satellite.gstime(now);
    // Note: geodetic is not required for ISS position here, but retained for potential future use.
    const geodetic = satellite.eciToGeodetic(position, gmst);

    return {
      latitude: satellite.degreesLat(geodetic.latitude),
      longitude: satellite.degreesLong(geodetic.longitude),
      altitude: geodetic.height,
      timestamp: now.getTime(),
    };
  } catch (error) {
    logger.error("getISSPosition failed", { error: String(error) });
    throw error;
  }
}

export async function getNextISSPass(latitude: number, longitude: number, altitudeKm = 0) {
  try {
    const iss = await getISSTle();
    const satrec = satellite.twoline2satrec(iss.line1, iss.line2);
    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const step = 60 * 1000;
    const passes: any[] = [];
    let currentPass: any = null;

    for (let time = now.getTime(); time <= endTime.getTime(); time += step) {
      const date = new Date(time);
      const positionAndVelocity = satellite.propagate(satrec, date);
      const position = positionAndVelocity.position;
      if (!position || typeof position === "boolean") continue;

      const gmst = satellite.gstime(date);
      // Compute look angles; elevation and azimuth are returned in radians.
      const lookAngles = satellite.ecfToLookAngles(
        { latitude: latitude * Math.PI / 180, longitude: longitude * Math.PI / 180, height: altitudeKm * 1000 },
        satellite.eciToEcf(position, gmst),
      );

      // Convert from radians to degrees for human‑readable values and comparisons.
      const elevation = lookAngles.elevation * 180 / Math.PI;
      const azimuth = lookAngles.azimuth * 180 / Math.PI;
      // Elevation threshold is defined in degrees.

      if (elevation > ELEVATION_THRESHOLD) {
        if (!currentPass) {
          currentPass = {
            startUTC: date.toISOString(),
            maxUTC: date.toISOString(),
            endUTC: date.toISOString(),
            startAzimuth: azimuth,
            endAzimuth: azimuth,
            maxElevation: elevation,
          }; // elevation and azimuth are now in degrees
        }

        currentPass.maxUTC = date.toISOString();
        currentPass.endUTC = date.toISOString();
        currentPass.maxElevation = Math.max(currentPass.maxElevation, elevation);
        currentPass.endAzimuth = azimuth;
      } else if (currentPass) {
        passes.push(currentPass);
        currentPass = null;
      }
    }

    if (currentPass) passes.push(currentPass);

    return { passes };
  } catch (error) {
    logger.error("getNextISSPass failed", { error: String(error) });
    return { passes: [] };
  }
}

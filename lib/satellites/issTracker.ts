import * as satellite from "satellite.js";
import { getTleByGroup } from "@/services/celestrak";
import { CelesTrakTle } from "@/types/clients";
import { logger } from "@/lib/logger";

const ELEVATION_THRESHOLD = 0;

export async function getISSTle(): Promise<CelesTrakTle> {
  const tles = await getTleByGroup("stations");
  const iss = tles.find((tle) => tle.name.toLowerCase().includes("iss"));
  if (!iss) {
    throw new Error("ISS TLE not found in stations group");
  }
  return iss;
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
    const lookAngles = satellite.ecfToLookAngles(
      { latitude: satellite.degreesToRadians(latitude), longitude: satellite.degreesToRadians(longitude), height: altitudeKm * 1000 },
      satellite.eciToEcf(position, gmst),
    );

    const elevation = satellite.degreesLat(lookAngles.elevation);
    const azimuth = satellite.degreesLong(lookAngles.azimuth);

    if (elevation > ELEVATION_THRESHOLD) {
      if (!currentPass) {
        currentPass = {
          startUTC: date.toISOString(),
          maxUTC: date.toISOString(),
          endUTC: date.toISOString(),
          startAzimuth: azimuth,
          endAzimuth: azimuth,
          maxElevation: elevation,
        };
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
}

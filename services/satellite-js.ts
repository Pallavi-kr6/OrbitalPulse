import * as satellite from "satellite.js";
import { getISSTle } from "@/lib/satellites/issTracker";
import { SatellitePass } from "@/types/astronomy";

const ELEVATION_THRESHOLD = 0;

export async function getIssPasses(latitude: number, longitude: number, altitudeKm = 0): Promise<SatellitePass> {
  const iss = await getISSTle();
  const satrec = satellite.twoline2satrec(iss.line1, iss.line2);
  const now = new Date();
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const step = 60 * 1000;
  const passes: SatellitePass["passes"] = [];
  let currentPass: { startUTC: string; maxUTC: string; endUTC: string; startAzimuth: number; endAzimuth: number; maxElevation: number } | null = null;

  for (let time = now.getTime(); time <= endTime.getTime(); time += step) {
    const date = new Date(time);
    const positionAndVelocity = satellite.propagate(satrec, date);
    const position = positionAndVelocity.position;
    if (!position || typeof position === "boolean") continue;

    const gmst = satellite.gstime(date);
    const geodetic = satellite.eciToGeodetic(position, gmst);
    const lookAngles = satellite.ecfToLookAngles(
      { latitude: satellite.degreesToRadians(latitude), longitude: satellite.degreesToRadians(longitude), height: altitudeKm * 1000 },
      satellite.eciToEcf(position, gmst),
    );

   const elevation = satellite.radiansToDegrees(
  lookAngles.elevation
);

const azimuth = satellite.radiansToDegrees(
  lookAngles.azimuth
);
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

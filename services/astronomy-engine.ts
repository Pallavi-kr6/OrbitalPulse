import * as Astronomy from "astronomy-engine";
import { PlanetPosition, MoonPosition } from "@/types/astronomy";

export function getPlanetPositions(date: Date, latitude: number, longitude: number): PlanetPosition[] {
  const observer: Astronomy.Observer = { latitude, longitude, height: 0 };
  const bodies = [
    Astronomy.Body.Mercury,
    Astronomy.Body.Venus,
    Astronomy.Body.Mars,
    Astronomy.Body.Jupiter,
    Astronomy.Body.Saturn,
    Astronomy.Body.Uranus,
    Astronomy.Body.Neptune,
  ];

  return bodies.map((body) => {
    const equatorial = Astronomy.Equator(body, date, observer, true, true);
    const horizon = Astronomy.Horizon(date, observer, equatorial.ra, equatorial.dec, "normal");

    return {
      body: Astronomy.Body[body],
      rightAscension: equatorial.ra,
      declination: equatorial.dec,
      distanceAu: equatorial.dist,
      altitude: horizon.altitude,
      azimuth: horizon.azimuth,
      hourAngle: Astronomy.HourAngle(body, date, observer),
    };
  });
}

export function getMoonEquatorialCoordinates(date: Date, latitude: number, longitude: number): MoonPosition {
  const observer: Astronomy.Observer = { latitude, longitude, height: 0 };
  const equatorial = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true);
  const horizon = Astronomy.Horizon(date, observer, equatorial.ra, equatorial.dec, "normal");
  return {
    azimuth: horizon.azimuth,
    altitude: horizon.altitude,
    distanceKm: equatorial.dist * 149_597_870.7,
    parallacticAngle: 0,
    ra: equatorial.ra,
    dec: equatorial.dec,
    altitudeDegrees: (horizon.altitude * 180) / Math.PI,
    azimuthDegrees: (horizon.azimuth * 180) / Math.PI,
  };
}

export function getRiseSet(body: Astronomy.Body, date: Date, latitude: number, longitude: number) {
  const observer: Astronomy.Observer = { latitude, longitude, height: 0 };
  const rise = Astronomy.SearchRiseSet(body, observer, +1, date, 0.25, 0);
  const set = Astronomy.SearchRiseSet(body, observer, -1, date, 0.25, 0);
  return {
    body: Astronomy.Body[body],
    rise: rise?.date?.toISOString() ?? null,
    set: set?.date?.toISOString() ?? null,
  };
}

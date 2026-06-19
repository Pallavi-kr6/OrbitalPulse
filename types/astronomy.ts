export type MoonPhase = {
  fraction: number;
  phase: number;
  phaseName: string;
  illuminated: number;
};

export type MoonPosition = {
  azimuth: number;
  altitude: number;
  distanceKm: number;
  parallacticAngle: number;
  ra: number;
  dec: number;
  altitudeDegrees: number;
  azimuthDegrees: number;
};

export type PlanetPosition = {
  body: string;
  rightAscension: number;
  declination: number;
  distanceAu: number;
  altitude: number;
  azimuth: number;
  hourAngle: number;
};

export type SunriseSunset = {
  dawn: string;
  sunrise: string;
  solarNoon: string;
  sunset: string;
  dusk: string;
  goldenHourMorning: string;
  goldenHourEvening: string;
  blueHourMorning: string;
  blueHourEvening: string;
};

export type ObservationConditions = {
  cloudCover: number;
  visibilityKm: number;
  lightPollution: number;
  kpIndex: number;
  moonIllumination: number;
  moonPhaseName: string;
  skyScore: number;
};

export type SkyNarration = {
  summary: string;
  visibility: string;
  bestTime: string;
  direction: string;
};

export type WeatherConditions = {
  temperatureC: number;
  windSpeedKmh: number;
  windDirection: number;
  cloudCover: number;
  visibilityKm: number;
  weatherCode: number;
  observationTime: string;
};

export type Satellite = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmh: number;
  azimuth?: number;
  elevation?: number;
};

export type SatellitePass = {
  passes: Array<{
    startUTC: string;
    maxUTC: string;
    endUTC: string;
    startAzimuth: number;
    endAzimuth: number;
    maxElevation: number;
  }>;
};

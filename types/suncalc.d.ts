declare module "suncalc" {
  export interface SunCalcPosition {
    azimuth: number;
    altitude: number;
    distance: number;
    ra: number;
    dec: number;
    azimuth2: number;
    altitude2: number;
    parallacticAngle: number;
  }

  export interface SunCalcTimes {
    solarNoon: Date;
    nadir: Date;
    sunrise: Date;
    sunset: Date;
    sunriseEnd: Date;
    sunsetStart: Date;
    dawn: Date;
    dusk: Date;
    nauticalDawn: Date;
    nauticalDusk: Date;
    nightEnd: Date;
    night: Date;
    goldenHourEnd: Date;
    goldenHour: Date;
  }

  export function getTimes(date: Date, latitude: number, longitude: number): SunCalcTimes;
  export function getMoonPosition(date: Date, latitude: number, longitude: number): SunCalcPosition;
  export function getMoonIllumination(date: Date): { fraction: number; phase: number; angle: number };
  export function getMoonTimes(date: Date, latitude: number, longitude: number): { rise: Date | null; set: Date | null; alwaysUp: boolean; alwaysDown: boolean };
  export function getPosition(date: Date, latitude: number, longitude: number): SunCalcPosition;
  export function getSunlightPosition(date: Date, latitude: number, longitude: number): { altitude: number; azimuth: number };
  export function getShadow(date: Date, latitude: number, longitude: number, height: number): { altitude: number; azimuth: number; direction: number };

  const SunCalc: {
    getTimes: typeof getTimes;
    getMoonPosition: typeof getMoonPosition;
    getMoonIllumination: typeof getMoonIllumination;
    getMoonTimes: typeof getMoonTimes;
    getPosition: typeof getPosition;
    getSunlightPosition: typeof getSunlightPosition;
    getShadow: typeof getShadow;
  };

  export default SunCalc;
}

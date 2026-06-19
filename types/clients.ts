export type N2YOSatellite = {
  satid: number;
  satname: string;
  intDesignator: string;
  launchDate: string;
  satlat: number;
  satlng: number;
  satalt: number;
  satvelocity: number;
};

export type N2YOAboveResponse = {
  info: {
    category: number;
    satcount: number;
    satlat: number;
    satlng: number;
    satalt: number;
    observerlat: number;
    observerlng: number;
    observeralt: number;
    seconds: number;
  };
  above: N2YOSatellite[];
};

export type N2YOSatelliteDetail = {
  satid: number;
  satname: string;
  intDesignator: string;
  launchDate: string;
  satlat: number;
  satlng: number;
  satalt: number;
  satvelocity: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
};

export type OpenNotifyISSPosition = {
  timestamp: number;
  iss_position: {
    latitude: string;
    longitude: string;
  };
  message: string;
};

export type OpenNotifyPeople = {
  message: string;
  number: number;
  people: Array<{ craft: string; name: string }>;
};

export type OpenMeteoResponse = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relativehumidity_2m: number[];
    cloudcover: number[];
    visibility: number[];
    weathercode: number[];
  };
};

export type GroqAiNarrationResponse = {
  summary: string;
  visibility: string;
  bestTime: string;
  direction: string;
};

export type NasaDonkiFlare = {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string;
  sourceLocation?: string;
  activeRegionNum?: number;
  link?: string;
};

export type NasaDonkiCME = {
  activityID: string;
  startTime: string;
  mostAccurateTime?: string;
  note?: string;
  catalog?: string;
  link?: string;
};

export type NasaDonkiKP = {
  source: string;
  link?: string;
  data: Array<{ time_tag: string; kp_index: number }>;
};

export type SwpcKpIndex = Array<{ time_tag: string; kp_index: number }>;
export type SwpcGeomagneticStorm = Array<{
  bk_p?: number;
  storm_strength: string;
  start_time: string;
  peak_time: string;
  end_time: string;
  link?: string;
}>;

export type CelesTrakTle = {
  name: string;
  line1: string;
  line2: string;
};

export type NasaGibsLayer = {
  id: string;
  title: string;
  description: string;
  tileUrlTemplate: string;
};

export type NasaGibsResponse = {
  layers: NasaGibsLayer[];
};

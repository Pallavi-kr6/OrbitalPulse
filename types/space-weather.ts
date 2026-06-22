export interface FlareData {
  flareClass: string;
  beginTime: string;
  peakTime: string;
  endTime: string | null;
}

export interface CmeData {
  cmeDetected: boolean;
  cmeTime: string | null;
}

export interface KpData {
  kpIndex: number;
  time: string;
}

export interface SpaceWeatherResponse {
  flareClass: string | null;
  flareTime: string | null;
  cmeDetected: boolean;
  cmeTime: string | null;
  kpIndex: number;
  auroraLevel: "Low" | "Moderate" | "High" | "Extreme" | "Unknown";
  severityScore: number;
  scoreLevel: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  recentFlares: FlareData[];
  recentCMEs: CmeData[];
  recentKp: KpData[];
}

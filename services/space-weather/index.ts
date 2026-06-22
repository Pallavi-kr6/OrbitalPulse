import { getDONKIFlares, getDONKICMEs } from "./donki";
import { getSWPCKpIndex, getSWPCAuroraForecast } from "./swpc";
import { SpaceWeatherResponse, FlareData, CmeData, KpData } from "@/types/space-weather";

// Space Weather Score Engine Weights
const FLARE_WEIGHTS: Record<string, number> = {
  "B": 1,
  "C": 2,
  "M": 5,
  "X": 10
};

function calculateSeverityScore(latestFlare: FlareData | null, latestCme: CmeData | null, latestKp: number): number {
  let score = 0;

  // KP Index Contribution (Linear mapping from 0-9 to 0-4.5)
  score += (latestKp / 2);

  // Flare Class Contribution
  if (latestFlare) {
    const flareLetter = latestFlare.flareClass.charAt(0).toUpperCase();
    if (FLARE_WEIGHTS[flareLetter]) {
      score += FLARE_WEIGHTS[flareLetter];
    }
  }

  // CME Contribution
  if (latestCme?.cmeDetected) {
    score += 3;
  }

  // Cap score to 10 max
  return Math.min(10, Math.round(score * 10) / 10);
}

function getScoreLevel(score: number): "LOW" | "MODERATE" | "HIGH" | "EXTREME" {
  if (score < 3) return "LOW";
  if (score < 6) return "MODERATE";
  if (score < 8) return "HIGH";
  return "EXTREME";
}

export async function getSpaceWeather(): Promise<SpaceWeatherResponse> {
  const [flares, cmes, kpHistory, auroraLevel] = await Promise.all([
    getDONKIFlares(),
    getDONKICMEs(),
    getSWPCKpIndex(),
    getSWPCAuroraForecast()
  ]);

  const latestFlare = flares.length > 0 ? flares[0] : null;
  const latestCme = cmes.length > 0 ? cmes[0] : null;
  const latestKp = kpHistory.length > 0 ? kpHistory[0].kpIndex : 0;

  const severityScore = calculateSeverityScore(latestFlare, latestCme, latestKp);
  const scoreLevel = getScoreLevel(severityScore);

  return {
    flareClass: latestFlare?.flareClass || null,
    flareTime: latestFlare?.peakTime || null,
    cmeDetected: latestCme?.cmeDetected || false,
    cmeTime: latestCme?.cmeTime || null,
    kpIndex: latestKp,
    auroraLevel,
    severityScore,
    scoreLevel,
    recentFlares: flares,
    recentCMEs: cmes,
    recentKp: kpHistory
  };
}

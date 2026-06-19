import { create } from "zustand";

export type WeatherState = {
  cloudCover: number | null;
  visibilityKm: number | null;
  temperatureC: number | null;
  setWeather: (cloudCover: number, visibilityKm: number, temperatureC: number) => void;
};

export const useWeatherStore = create<WeatherState>((set) => ({
  cloudCover: null,
  visibilityKm: null,
  temperatureC: null,
  setWeather: (cloudCover, visibilityKm, temperatureC) => set({ cloudCover, visibilityKm, temperatureC }),
}));

import { create } from "zustand";
import { Satellite } from "@/types/astronomy";

export type SatelliteState = {
  activeSatellites: Satellite[];
  setSatellites: (satellites: Satellite[]) => void;
};

export const useSatelliteStore = create<SatelliteState>((set) => ({
  activeSatellites: [],
  setSatellites: (satellites) => set({ activeSatellites: satellites }),
}));

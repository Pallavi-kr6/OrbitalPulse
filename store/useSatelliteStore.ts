import { create } from "zustand";
import { Satellite } from "@/types/astronomy";

export type SelectedSatellite = {
  id: string | number;
  name: string;
  noradId: string;
  lat: number;
  lon: number;
  altKm: number;
  orbitType: "LEO" | "MEO" | "GEO" | "HEO";
  visible: boolean;
  color: string;
};

export type SatelliteState = {
  activeSatellites: Satellite[];
  setSatellites: (satellites: Satellite[]) => void;
  selectedSatellite: SelectedSatellite | null;
  setSelectedSatellite: (satellite: SelectedSatellite | null) => void;
  trackedSatId: string | null;
  setTrackedSatId: (id: string | null) => void;
};

export const useSatelliteStore = create<SatelliteState>((set) => ({
  activeSatellites: [],
  setSatellites: (satellites) => set({ activeSatellites: satellites }),
  selectedSatellite: null,
  setSelectedSatellite: (satellite) => set({ selectedSatellite: satellite }),
  trackedSatId: null,
  setTrackedSatId: (id) => set({ trackedSatId: id }),
}));

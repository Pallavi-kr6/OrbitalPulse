import { create } from "zustand";

export type UIState = {
  sidebarOpen: boolean;
  selectedLayer: string | null;
  setSidebarOpen: (open: boolean) => void;
  setSelectedLayer: (layer: string | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  selectedLayer: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedLayer: (layer) => set({ selectedLayer: layer }),
}));

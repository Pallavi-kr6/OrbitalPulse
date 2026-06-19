import { NasaGibsLayer } from "@/types/clients";

export type CesiumLayerState = {
  id: string;
  layer: NasaGibsLayer;
  visible: boolean;
  date: string;
};

export class CesiumLayerManager {
  private layers = new Map<string, CesiumLayerState>();

  constructor(initialLayers: NasaGibsLayer[] = []) {
    initialLayers.forEach((layer) => {
      this.layers.set(layer.id, {
        id: layer.id,
        layer,
        visible: false,
        date: new Date().toISOString().slice(0, 10),
      });
    });
  }

  addLayer(layer: NasaGibsLayer) {
    this.layers.set(layer.id, {
      id: layer.id,
      layer,
      visible: true,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  removeLayer(layerId: string) {
    this.layers.delete(layerId);
  }

  toggleLayer(layerId: string) {
    const state = this.layers.get(layerId);
    if (!state) return;
    this.layers.set(layerId, { ...state, visible: !state.visible });
  }

  updateDate(layerId: string, date: string) {
    const state = this.layers.get(layerId);
    if (!state) return;
    this.layers.set(layerId, { ...state, date });
  }

  applyState(state: Array<Partial<CesiumLayerState> & { id: string }>) {
    state.forEach((item) => {
      const existing = this.layers.get(item.id);
      if (!existing) return;
      this.layers.set(item.id, { ...existing, ...item });
    });
  }

  getState() {
    return Array.from(this.layers.values());
  }
}

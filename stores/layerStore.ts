import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MilitaryScenario } from "@orbat-mapper/msdllib";

interface LayerState {
  layers: Set<string>;
  showIconAnchors: boolean;
  showUnits: boolean;
  showEquipment: boolean;
  showLabels: boolean;
  showSymbolOutline: boolean;
  symbolSize: number;
  showAreaOfInterest: boolean;
  
  setLayers: (layers: Set<string>) => void;
  setSideLayers: (scenario: MilitaryScenario) => void;
  addLayer: (layerId: string) => void;
  removeLayer: (layerId: string) => void;
  clearLayers: () => void;
  
  setShowIconAnchors: (show: boolean) => void;
  setShowUnits: (show: boolean) => void;
  setShowEquipment: (show: boolean) => void;
  setShowLabels: (show: boolean) => void;
  setShowSymbolOutline: (show: boolean) => void;
  setSymbolSize: (size: number) => void;
  setShowAreaOfInterest: (show: boolean) => void;
}

export const useLayerStore = create<LayerState>()(
  persist(
    (set) => ({
      layers: new Set<string>(),
      showIconAnchors: false,
      showUnits: true,
      showEquipment: true,
      showLabels: true,
      showSymbolOutline: true,
      symbolSize: 20,
      showAreaOfInterest: true,
      
      setLayers: (layers) => set({ layers }),
      
      setSideLayers: (scenario) => {
        const newLayers = new Set<string>();
        scenario.sides.forEach((layer: any) => {
          newLayers.add(layer.objectHandle);
        });
        set({ layers: newLayers });
      },
      
      addLayer: (layerId) =>
        set((state) => {
          const newLayers = new Set(state.layers);
          newLayers.add(layerId);
          return { layers: newLayers };
        }),
      
      removeLayer: (layerId) =>
        set((state) => {
          const newLayers = new Set(state.layers);
          newLayers.delete(layerId);
          return { layers: newLayers };
        }),
      
      clearLayers: () => set({ layers: new Set() }),
      
      setShowIconAnchors: (show) => set({ showIconAnchors: show }),
      setShowUnits: (show) => set({ showUnits: show }),
      setShowEquipment: (show) => set({ showEquipment: show }),
      setShowLabels: (show) => set({ showLabels: show }),
      setShowSymbolOutline: (show) => set({ showSymbolOutline: show }),
      setSymbolSize: (size) => set({ symbolSize: size }),
      setShowAreaOfInterest: (show) => set({ showAreaOfInterest: show }),
    }),
    {
      name: "layer-storage",
      partialize: (state) => ({
        showIconAnchors: state.showIconAnchors,
        showUnits: state.showUnits,
        showEquipment: state.showEquipment,
        showLabels: state.showLabels,
        showSymbolOutline: state.showSymbolOutline,
        symbolSize: state.symbolSize,
        showAreaOfInterest: state.showAreaOfInterest,
      }),
      // Custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Map Settings Store
interface MapSettingsState {
  showPadding: boolean;
  showCollisionBoxes: boolean;
  showTileBoundaries: boolean;
  showOverdrawInspector: boolean;
  
  setShowPadding: (show: boolean) => void;
  setShowCollisionBoxes: (show: boolean) => void;
  setShowTileBoundaries: (show: boolean) => void;
  setShowOverdrawInspector: (show: boolean) => void;
}

export const useMapSettingsStore = create<MapSettingsState>((set) => ({
  showPadding: false,
  showCollisionBoxes: false,
  showTileBoundaries: false,
  showOverdrawInspector: false,
  
  setShowPadding: (show) => set({ showPadding: show }),
  setShowCollisionBoxes: (show) => set({ showCollisionBoxes: show }),
  setShowTileBoundaries: (show) => set({ showTileBoundaries: show }),
  setShowOverdrawInspector: (show) => set({ showOverdrawInspector: show }),
}));
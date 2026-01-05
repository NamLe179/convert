import { create } from "zustand";

// UI Store - manages modal state, panels, and hover
interface UIState {
  modalOpen: boolean;
  showLeftPanel: boolean;
  hoverEnabled: boolean;
  setModalOpen: (open: boolean) => void;
  toggleLeftPanel: () => void;
  setHoverEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  modalOpen: false,
  showLeftPanel: true,
  hoverEnabled: true,
  setModalOpen: (open) => set({ modalOpen: open }),
  toggleLeftPanel: () => set((state) => ({ showLeftPanel: !state.showLeftPanel })),
  setHoverEnabled: (enabled) => set({ hoverEnabled: enabled }),
}));

// Side Store - manages side panel settings
interface SideState {
  hideEmptySides: boolean;
  primarySideMap: Record<string, string>;
  sortAlphabetically: boolean;
  setHideEmptySides: (hide: boolean) => void;
  setPrimarySide: (scenarioKey: string, sideKey: string) => void;
  setSortAlphabetically: (sort: boolean) => void;
}

export const useSideStore = create<SideState>((set) => ({
  hideEmptySides: false,
  primarySideMap: {},
  sortAlphabetically: false,
  setHideEmptySides: (hide) => set({ hideEmptySides: hide }),
  setPrimarySide: (scenarioKey, sideKey) =>
    set((state) => ({
      primarySideMap: { ...state.primarySideMap, [scenarioKey]: sideKey },
    })),
  setSortAlphabetically: (sort) => set({ sortAlphabetically: sort }),
}));

// Width Store - manages panel widths
interface WidthState {
  orbatPanelWidth: number;
  detailsWidth: number;
  setOrbatPanelWidth: (width: number) => void;
  setDetailsWidth: (width: number) => void;
  resetOrbatPanelWidth: () => void;
  resetDetailsWidth: () => void;
}

export const useWidthStore = create<WidthState>((set) => ({
  orbatPanelWidth: 400,
  detailsWidth: 400,
  setOrbatPanelWidth: (width) => set({ orbatPanelWidth: width }),
  setDetailsWidth: (width) => set({ detailsWidth: width }),
  resetOrbatPanelWidth: () => set({ orbatPanelWidth: 400 }),
  resetDetailsWidth: () => set({ detailsWidth: 400 }),
}));
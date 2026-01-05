import { create } from "zustand";

// Store for managing expanded items in the ORBAT tree
interface ExpandedState {
  expandedItems: Map<string, string[]>;
  openSideItems: string[];
  
  setExpandedItems: (items: Map<string, string[]>) => void;
  toggleExpandedItem: (sideId: string, itemId: string) => void;
  setOpenSideItems: (items: string[]) => void;
  toggleSideItem: (itemId: string) => void;
  clearExpanded: () => void;
}

export const useExpandedStore = create<ExpandedState>((set) => ({
  expandedItems: new Map(),
  openSideItems: [],
  
  setExpandedItems: (items) => set({ expandedItems: items }),
  
  toggleExpandedItem: (sideId, itemId) =>
    set((state) => {
      const newMap = new Map(state.expandedItems);
      const sideItems = newMap.get(sideId) || [];
      const index = sideItems.indexOf(itemId);
      
      if (index > -1) {
        sideItems.splice(index, 1);
      } else {
        sideItems.push(itemId);
      }
      
      newMap.set(sideId, sideItems);
      return { expandedItems: newMap };
    }),
  
  setOpenSideItems: (items) => set({ openSideItems: items }),
  
  toggleSideItem: (itemId) =>
    set((state) => {
      const index = state.openSideItems.indexOf(itemId);
      const newItems = [...state.openSideItems];
      
      if (index > -1) {
        newItems.splice(index, 1);
      } else {
        newItems.push(itemId);
      }
      
      return { openSideItems: newItems };
    }),
  
  clearExpanded: () => set({ expandedItems: new Map(), openSideItems: [] }),
}));

// Store for managing expanded Federates in the DeploymentPanel
interface FederatesState {
  openItems: string[];
  
  setOpenItems: (items: string[]) => void;
  toggleItem: (itemId: string) => void;
  clearOpenItems: () => void;
}

export const useFederatesStore = create<FederatesState>((set) => ({
  openItems: [],
  
  setOpenItems: (items) => set({ openItems: items }),
  
  toggleItem: (itemId) =>
    set((state) => {
      const index = state.openItems.indexOf(itemId);
      const newItems = [...state.openItems];
      
      if (index > -1) {
        newItems.splice(index, 1);
      } else {
        newItems.push(itemId);
      }
      
      return { openItems: newItems };
    }),
  
  clearOpenItems: () => set({ openItems: [] }),
}));
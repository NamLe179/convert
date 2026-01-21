import { create } from "zustand";
import { EquipmentItem, Federate, Unit, type ForceSide } from "@orbat-mapper/msdllib";
import { eventBus, MSDL_EDITOR_EVENT } from "@/lib/eventBus";

// Helper function to check if item is Unit or Equipment
function isUnitOrEquipment(item: any): item is Unit | EquipmentItem {
  return item && (item instanceof Unit || item instanceof EquipmentItem);
}

// sửa lỗi tránh bị lỗi DOMParser
let _unallocatedFederate: Federate | null = null;
export function getUnallocatedFederate(): Federate {
  if (!_unallocatedFederate && typeof window !== 'undefined') {
    _unallocatedFederate = Federate.fromModel({ name: "Unallocated" });
  }
  return _unallocatedFederate!;
}

interface SelectState {
  activeItem: Unit | EquipmentItem | ForceSide | null;
  activeFederate: Federate | null;
  revision: number; // Counter to force re-renders
  
  setActiveItem: (item: Unit | EquipmentItem | ForceSide | null) => void;
  clearActiveItem: () => void;
  updateSidc: (sidc: string) => void;
  updateName: (name: string) => void;
  
  setActiveFederate: (federate: Federate | null) => void;
  clearActiveFederate: () => void;
  openFederatesPanel: () => void;
}

export const useSelectStore = create<SelectState>((set, get) => ({
  activeItem: null,
  activeFederate: null,
  revision: 0,
  
  setActiveItem: (item) => {
    if (item !== null) {
      // Clear federate when setting active item
      set({ activeItem: item, activeFederate: null });
      eventBus.emit(MSDL_EDITOR_EVENT, "selected-item");
    } else {
      set({ activeItem: item });
    }
  },
  
  clearActiveItem: () => set({ activeItem: null }),
  
  updateSidc: (sidc) => {
    const { activeItem } = get();
    if (!activeItem) return;
    
    if (isUnitOrEquipment(activeItem)) {
      activeItem.sidc = sidc;
      // Trigger re-render by incrementing revision
      set((state) => ({ revision: state.revision + 1 }));
    }
  },
  
  updateName: (name) => {
    const { activeItem } = get();
    if (!activeItem) return;
    
    if (isUnitOrEquipment(activeItem)) {
      activeItem.name = name;
      // Trigger re-render by incrementing revision
      set((state) => ({ revision: state.revision + 1 }));
    }
  },
  
  setActiveFederate: (federate) => {
    if (federate !== null) {
      // Clear active item when setting federate
      set({ activeFederate: federate, activeItem: null });
      eventBus.emit(MSDL_EDITOR_EVENT, "selected-federate");
    } else {
      set({ activeFederate: federate });
    }
  },
  
  clearActiveFederate: () => set({ activeFederate: null }),
  
  openFederatesPanel: () => {
    set({ activeFederate: getUnallocatedFederate(), activeItem: null });
    eventBus.emit(MSDL_EDITOR_EVENT, "selected-federate");
  },
}));
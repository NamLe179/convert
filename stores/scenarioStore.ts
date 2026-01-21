import { create } from "zustand";
import { toast } from "sonner";
import { eventBus, MSDL_EDITOR_EVENT } from "@/lib/eventBus";
import { useLayerStore } from "./layerStore";
import { useSelectStore } from "./selectStore";
import { useSideStore } from "./uiStore";

// Import MSDL library types and classes
import type {
  AssociationType,
  DispositionType,
  FederateType,
  ForceSideType,
  HoldingType,
  LngLatElevationTuple,
  LngLatTuple,
  MilitaryScenarioInputType,
  ScenarioIdType,
  StandardIdentity,
  UnitEquipmentInterface,
  UnitModelType,
  EquipmentModelType,
} from "@orbat-mapper/msdllib";
import {
  Association,
  EquipmentItem,
  EquipmentItemDisposition,
  Federate,
  ForceSide,
  Holding,
  MilitaryScenario,
  ScenarioId,
  Unit,
  UnitDisposition,
} from "@orbat-mapper/msdllib";
import type { MsdlOptionsType } from "@orbat-mapper/msdllib/dist/lib/msdlOptions";
import type { Position } from "geojson";

// Local types
type OrbatDragItem = any; // This should come from your types folder
type Instruction = any; // This should come from your types folder

export interface MetaEntry<T = string> {
  label: T;
  value: string | number;
}

export interface Patch {
  op: "replace" | "remove" | "add";
  path: (string | number)[];
  value?: unknown;
}

export interface UndoEntry<T = string> {
  patches: Patch[];
  inversePatches: Patch[];
  meta?: MetaEntry<T>;
}

export interface ScenarioModifications {
  updateScenarioId: (value: Partial<ScenarioIdType>) => void;
  updateOptions: (value: Partial<MsdlOptionsType>) => void;
  updateFederate: (objectHandle: string, value: Partial<FederateType>) => void;
  updateForceSide: (objectHandle: string, value: Partial<ForceSideType>) => void;
  updateItemLocation: (objectHandle: string, newLocation: Position) => void;
  updateItemDisposition: (objectHandle: string, disposition: DispositionType) => void;
  updateItemModel: (objectHandle: string, model: UnitModelType | EquipmentModelType) => void;
  updateSymbolIdentifier: (objectHandle: string, sidc: string) => void;
  updateHoldings: (objectHandle: string, newHoldings: HoldingType[]) => void;
  
  addUnit: (newLocation: LngLatTuple | LngLatElevationTuple, newUnit?: Partial<UnitEquipmentInterface>) => void;
  addEquipmentItem: (newLocation: LngLatTuple | LngLatElevationTuple, newEquipment?: Partial<UnitEquipmentInterface>) => void;
  removeUnit: (unitHandle: string) => void;
  removeEquipmentItem: (equipmentHandle: string) => void;
  
  addForceSide: (newSide?: Partial<ForceSideType>) => void;
  removeForceSide: (objectHandle: string) => void;
  
  addFederate: (newFederate?: Partial<FederateType>) => void;
  assignUnitToFederate: (unit: string, federate: string, includeSubordinates?: boolean) => void;
  assignEquipmentToFederate: (equipment: string, federate: string) => void;
  removeUnitFromFederate: (unit: string, includeSubordinates?: boolean) => void;
  removeEquipmentFromFederate: (equipment: string) => void;
  
  createDeployment: () => void;
  setPrimarySide: (side: ForceSide | string) => void;
  setSideAffiliation: (objectHandleOrSide: string | ForceSide, affiliation: StandardIdentity) => void;
  updateOrbatDragItems: (source: OrbatDragItem, target: OrbatDragItem, instruction: Instruction) => void;
  updateForceSideAssociation: (objectHandleOrForceSide: string | ForceSide, associations: (Association | AssociationType)[]) => void;
}

// Helper functions
function createScenarioKey(scenario: any): string {
  if (!scenario?.scenarioId) return "";
  return scenario.scenarioId.name + scenario.scenarioId.description;
}

function xmlToString(element: Element): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(element);
}

function parseFromString(xmlString: string): Element {
  if (typeof window === 'undefined') {
    throw new Error('parseFromString can only be used in browser environment');
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  return doc.documentElement;
}

interface ScenarioState {
  // Core state
  msdl: MilitaryScenario | undefined;
  revision: number; // Counter to force re-renders
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
  
  // Actions
  createScenario: (scenarioInput?: MilitaryScenarioInputType) => void;
  loadScenario: (scenario: MilitaryScenario) => void;
  clearScenario: () => void;
  undo: () => void;
  redo: () => void;
  
  // Internal helpers
  applyPatchWrapper: (patches: Patch[]) => void;
  triggerUpdate: () => void; // Helper to force re-render
  
  // Modifications
  modifyScenario: ScenarioModifications;
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  // Initial state
  msdl: undefined,
  revision: 0,
  undoStack: [],
  redoStack: [],
  
  // Helper to trigger re-render when mutating class instance
  triggerUpdate: () => set((state) => ({ revision: state.revision + 1 })),
  
  // Apply patches for undo/redo
  applyPatchWrapper: (patches: Patch[]) => {
    const { msdl } = get();
    if (!msdl) return;
    
    for (const patch of patches) {
      const { op, path, value } = patch;
      const target = msdl.scenarioId?.element;
      if (!target) continue;

      switch (op) {
        case "replace":
          if (value !== undefined) {
            const newElement = parseFromString(value as string);
            target.replaceWith(newElement);
            msdl.scenarioId = new ScenarioId(newElement);
            // Just update the reference, don't spread
            set({ msdl });
          }
          break;
        default:
          console.warn(`Unknown operation: ${op}`);
      }
    }
  },
  
  // Undo action
  undo: () => {
    const { undoStack, redoStack, applyPatchWrapper } = get();
    if (undoStack.length === 0) return;
    
    const entry = undoStack[undoStack.length - 1];
    const { patches, inversePatches, meta } = entry;
    
    applyPatchWrapper(inversePatches);
    
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [{ patches, inversePatches, meta }, ...redoStack],
    });
  },
  
  // Redo action
  redo: () => {
    const { undoStack, redoStack, applyPatchWrapper } = get();
    if (redoStack.length === 0) return;
    
    const entry = redoStack[0];
    const { patches, inversePatches, meta } = entry;
    
    applyPatchWrapper(patches);
    
    set({
      redoStack: redoStack.slice(1),
      undoStack: [...undoStack, { patches, inversePatches, meta }],
    });
  },
  
  // Load existing scenario
  loadScenario: (scenario: MilitaryScenario) => {
    useSelectStore.getState().clearActiveItem();
    
    const scenarioKey = createScenarioKey(scenario);
    const { primarySideMap } = useSideStore.getState();
    
    if (scenarioKey in primarySideMap) {
      const primarySide = scenario.getForceSideById(primarySideMap[scenarioKey]);
      if (!primarySide) {
        console.warn(
          `Primary side with object handle ${primarySideMap[scenarioKey]} not found.`
        );
      } else {
        scenario.primarySide = primarySide;
      }
    }
    
    set({ msdl: scenario, undoStack: [], redoStack: [] });
    useLayerStore.getState().setSideLayers(scenario);
  },
  
  // Clear scenario
  clearScenario: () => {
    set({ msdl: undefined, undoStack: [], redoStack: [] });
    useLayerStore.getState().clearLayers();
    useSelectStore.getState().clearActiveItem();
  },
  
  // Create new scenario
  createScenario: (scenarioInput?: MilitaryScenarioInputType) => {
    if (!scenarioInput) return;
    
    get().clearScenario();
    
    const scenario = MilitaryScenario.createFromModel(scenarioInput);
    set({ msdl: scenario });
    
    eventBus.emit(MSDL_EDITOR_EVENT, "created-new-msdl");
  },
  
  // Scenario modifications
  modifyScenario: {
    // Update scenario ID
    updateScenarioId: (value: Partial<ScenarioIdType>) => {
      const { msdl, undoStack, redoStack } = get();
      if (!msdl) return;
      
      const preSnapshot = xmlToString(msdl.scenarioId.element);
      const v = msdl.scenarioId;
      
      Object.entries(value).forEach(([key, val]) => {
        if (key in v) {
          (v as any)[key] = val;
        } else {
          console.warn(`Property ${key} does not exist on ScenarioIdType.`);
        }
      });
      
      const postSnapshot = xmlToString(msdl.scenarioId.element);
      
      const patches: Patch[] = [
        { op: "replace", path: ["scenarioId"], value: postSnapshot },
      ];
      const inversePatches: Patch[] = [
        { op: "replace", path: ["scenarioId"], value: preSnapshot },
      ];
      
      set((state) => ({
        revision: state.revision + 1,
        undoStack: [...undoStack, { patches, inversePatches }],
        redoStack: [],
      }));
    },
    
    // Update MSDL options
    updateOptions: (value: Partial<MsdlOptionsType>) => {
      const { msdl, undoStack, redoStack } = get();
      if (!msdl) return;
      
      const preSnapshot = xmlToString(msdl.msdlOptions.element);
      const v = msdl.msdlOptions;
      
      Object.entries(value).forEach(([key, val]) => {
        if (key in v) {
          (v as any)[key] = val;
        } else {
          console.warn(`Property ${key} does not exist on MsdlOptionsType.`);
        }
      });
      
      const postSnapshot = xmlToString(msdl.msdlOptions.element);
      
      const patches: Patch[] = [
        { op: "replace", path: ["msdlOptions"], value: postSnapshot },
      ];
      const inversePatches: Patch[] = [
        { op: "replace", path: ["msdlOptions"], value: preSnapshot },
      ];
      
      set((state) => ({
        revision: state.revision + 1,
        undoStack: [...undoStack, { patches, inversePatches }],
        redoStack: [],
      }));
    },
    
    // Update federate
    updateFederate: (objectHandle: string, value: Partial<FederateType>) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const federate = msdl.getFederateById(objectHandle);
      if (!federate) {
        console.warn(`Federate with object handle ${objectHandle} not found.`);
        return;
      }
      
      federate.updateFromObject(value);
      get().triggerUpdate();
    },
    
    // Update force side
    updateForceSide: (objectHandle: string, value: Partial<ForceSideType>) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const forceSide = msdl.getForceSideById(objectHandle);
      if (!forceSide) {
        console.warn(`Force side with object handle ${objectHandle} not found.`);
        return;
      }
      
      Object.entries(value).forEach(([key, val]) => {
        if (key in forceSide) {
          (forceSide as any)[key] = val;
        } else {
          console.warn(`Property ${key} does not exist on ForceSide.`);
        }
      });
      
      get().triggerUpdate();
    },
    
    // Update item location
    updateItemLocation: (objectHandle: string, newLocation: Position) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const item = msdl.getUnitOrEquipmentById(objectHandle);
      if (!item) {
        console.warn(`Unit/Equipment with object handle ${objectHandle} not found.`);
        return;
      }
      
      if (item.disposition?.location) {
        item.disposition.location = newLocation as any;
      }
      
      get().triggerUpdate();
    },
    
    // Update item disposition
    updateItemDisposition: (objectHandle: string, disposition: DispositionType) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const item = msdl.getUnitOrEquipmentById(objectHandle);
      if (!item) {
        console.warn(`Unit/Equipment with object handle ${objectHandle} not found.`);
        return;
      }
      
      if (disposition && item.disposition) {
        // Ghép nối các thuộc tính của disposition
        Object.assign(item.disposition, disposition);
      } else if (disposition) {
        // assign mới nếu chưa có disposition
        item.disposition = disposition as any;
      }
      
      get().triggerUpdate();
    },
    
    // Update item model
    updateItemModel: (
      objectHandle: string,
      model: UnitModelType | EquipmentModelType
    ) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const item = msdl.getUnitOrEquipmentById(objectHandle);
      if (!item) {
        console.warn(`Unit/Equipment with object handle ${objectHandle} not found.`);
        return;
      }
      
      item.model = model;
      get().triggerUpdate();
    },
    
    // Update symbol identifier
    updateSymbolIdentifier: (objectHandle: string, sidc: string) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const item = msdl.getUnitOrEquipmentById(objectHandle);
      if (!item) {
        console.warn(`Unit/Equipment with object handle ${objectHandle} not found.`);
        return;
      }
      
      item.symbolIdentifier = sidc;
      get().triggerUpdate();
      eventBus.emit(MSDL_EDITOR_EVENT, "symbol-updated");
    },
    
    // Update holdings
    updateHoldings: (objectHandle: string, newHoldings: HoldingType[]) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const item = msdl.getUnitOrEquipmentById(objectHandle);
      if (!item) {
        console.warn(`Unit/Equipment with object handle ${objectHandle} not found.`);
        return;
      }
      
      const holdingObjects = newHoldings.map((h) => {
        const newHolding = Holding.fromModel(h);
        newHolding.updateFromObject(h);
        return newHolding;
      });
      
      item.holdings = holdingObjects;
      get().triggerUpdate();
    },
    
    // Add unit
    addUnit: (
      newLocation: LngLatTuple | LngLatElevationTuple,
      newUnit?: Partial<UnitEquipmentInterface>
    ) => {
      const { msdl } = get();
      if (!msdl) return;
      
      // Đảm bảo phải có 1 force side trước khi thêm unit
      if (msdl.sides.length === 0) {
        toast.error("Please create a Force Side first");
        return;
      }
      
      const item = Unit.create();
      item.name = newUnit?.name ?? "New unit";
      item.sidc = "SFGPU----------";
      item.symbolIdentifier = "SFGPU----------";
      
      // Đặt disposition với location
      const disposition = UnitDisposition.create();
      disposition.location = newLocation as any;
      item.disposition = disposition;
      
      // Đặt force relation đến primary side hoặc side đầu tiên có sẵn
      const targetSide = msdl.primarySide || msdl.sides[0];
      if (targetSide) {
        try {
          item.setForceRelation(targetSide);
        } catch (e) {
          console.warn("Could not set force relation:", e);
        }
      }
      
      msdl.addUnit(item);
      
      get().triggerUpdate();
      
      if (useSideStore.getState().hideEmptySides) {
        toast.warning("'Hide empty sides'-setting is set", {
          description: "Newly created Force Side might be hidden",
        });
      }
      
      eventBus.emit(MSDL_EDITOR_EVENT, "created-unit");
    },
    
    // Add equipment item
    addEquipmentItem: (
      newLocation: LngLatTuple | LngLatElevationTuple,
      newEquipment?: Partial<UnitEquipmentInterface>
    ) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const item = EquipmentItem.create();
      item.name = newEquipment?.name ?? "New equipment item";
      item.sidc = "SFGPE-----M----";
      item.symbolIdentifier = "SFGPE-----M----";
      
      // Đặt disposition với location
      const disposition = EquipmentItemDisposition.create();
      disposition.location = newLocation as any;
      item.disposition = disposition;
      
      msdl.addEquipmentItem(item);
      
      get().triggerUpdate();
    },
    
    // Remove unit
    removeUnit: (unitHandle: string) => {
      const { msdl } = get();
      if (!msdl) return;
      
      msdl.removeUnit(unitHandle);
      get().triggerUpdate();
    },
    
    // Remove equipment item
    removeEquipmentItem: (equipmentHandle: string) => {
      const { msdl } = get();
      if (!msdl) return;
      
      msdl.removeEquipmentItem(equipmentHandle);
      get().triggerUpdate();
    },
    
    // Add force side
    addForceSide: (newSide?: Partial<ForceSideType>) => {
      const { msdl } = get();
      if (!msdl || !newSide) return;
      
      const side = ForceSide.create();
      side.updateFromObject(newSide);
      msdl.addForceSide(side);
      
      // Đặt làm primary side nếu chưa có primary side nào
      if (!msdl.primarySide) {
        msdl.primarySide = side;
      }
      
      get().triggerUpdate();
      useLayerStore.getState().addLayer(side.objectHandle);
      
      if (useSideStore.getState().hideEmptySides) {
        toast.warning("'Hide empty sides'-setting is set", {
          description: "Newly created Force Side might be hidden",
        });
      }
      
      eventBus.emit(MSDL_EDITOR_EVENT, "created-force-side");
    },
    
    // Remove force side
    removeForceSide: (objectHandle: string) => {
      const { msdl } = get();
      if (!msdl) return;
      
      msdl.removeForceSide(objectHandle);
      get().triggerUpdate();
    },
    
    // Add federate
    addFederate: (newFederate?: Partial<FederateType>) => {
      const { msdl } = get();
      if (!msdl || !newFederate) return;
      
      const fed = Federate.create();
      fed.updateFromObject(newFederate);
      msdl.addFederate(fed);
      
      get().triggerUpdate();
      eventBus.emit(MSDL_EDITOR_EVENT, "created-federate");
    },
    
    // Assign unit to federate
    assignUnitToFederate: (
      unit: string,
      federate: string,
      includeSubordinates: boolean = false
    ) => {
      const { msdl } = get();
      if (!msdl || !unit || !federate) return;
      
      msdl.assignUnitToFederate(unit, federate, includeSubordinates);
      get().triggerUpdate();
      eventBus.emit(MSDL_EDITOR_EVENT, "assigned-federate");
    },
    
    // Assign equipment to federate
    assignEquipmentToFederate: (equipment: string, federate: string) => {
      const { msdl } = get();
      if (!msdl || !equipment || !federate) return;
      
      msdl.assignEquipmentItemToFederate(equipment, federate);
      get().triggerUpdate();
      eventBus.emit(MSDL_EDITOR_EVENT, "assigned-federate");
    },
    
    // Remove unit from federate
    removeUnitFromFederate: (unit: string, includeSubordinates: boolean = false) => {
      const { msdl } = get();
      if (!msdl || !unit) return;
      
      const federate = msdl.getFederateOfUnit(unit);
      if (!federate) return;
      
      msdl.removeUnitFromFederate(unit, federate.objectHandle, includeSubordinates);
      get().triggerUpdate();
      eventBus.emit(MSDL_EDITOR_EVENT, "removed-federate");
    },
    
    // Remove equipment from federate
    removeEquipmentFromFederate: (equipment: string) => {
      const { msdl } = get();
      if (!msdl || !equipment) return;
      
      const federate = msdl.getFederateOfEquipment(equipment);
      if (!federate) return;
      
      msdl.removeEquipmentFromFederate(equipment, federate.objectHandle);
      get().triggerUpdate();
      eventBus.emit(MSDL_EDITOR_EVENT, "removed-federate");
    },
    
    // Create deployment
    createDeployment: () => {
      const { msdl } = get();
      if (!msdl) return;
      
      msdl.createDeployment();
      get().triggerUpdate();
    },
    
    // Set primary side
    setPrimarySide: (side: any | string) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const objectHandle = typeof side === "string" ? side : side.objectHandle;
      const forceSide = msdl.getForceSideById(objectHandle);
      
      if (!forceSide) {
        console.warn(`Force side with object handle ${objectHandle} not found.`);
        return;
      }
      
      msdl.primarySide = forceSide;
      
      const scenarioKey = createScenarioKey(msdl);
      useSideStore.getState().setPrimarySide(scenarioKey, objectHandle);
      
      get().triggerUpdate();
    },
    
    // Set side affiliation
    setSideAffiliation: (
      objectHandleOrSide: string | any,
      affiliation: StandardIdentity
    ) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const objectHandle =
        typeof objectHandleOrSide === "string"
          ? objectHandleOrSide
          : objectHandleOrSide.objectHandle;
      const forceSide = msdl.getForceSideById(objectHandle);
      
      if (!forceSide) {
        console.warn(`Force side with object handle ${objectHandle} not found.`);
        return;
      }
      
      forceSide.setAffiliation(affiliation);
      get().triggerUpdate();
    },
    
    // Update ORBAT drag items
    updateOrbatDragItems: (
      source: OrbatDragItem,
      target: OrbatDragItem,
      instruction: Instruction
    ) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const sourceItem = msdl.getItemInstance(source.item.objectHandle);
      const targetItem = msdl.getItemInstance(target.item.objectHandle);
      
      if (!sourceItem || !targetItem) {
        console.warn("Source or target item not found in the scenario.");
        return;
      }
      
      if (sourceItem.objectHandle === targetItem.objectHandle) {
        return;
      }
      
      try {
        msdl.setItemRelation({
          source: sourceItem,
          target: targetItem,
          instruction: instruction.type,
        });
      } catch (error) {
        console.error("Failed to update item relation:", error);
        toast.error("Failed to update item relation. Check console for details.");
        return;
      }
      
      // Update affiliation
      if (sourceItem.constructor.name === "Unit" || sourceItem.constructor.name === "EquipmentItem") {
        sourceItem.setAffiliation(targetItem.getAffiliation(), { recursive: true });
      }
      
      get().triggerUpdate();
    },
    
    // Update force side association
    updateForceSideAssociation: (
      objectHandleOrForceSide: string | ForceSide,
      associations: (Association | AssociationType)[]
    ) => {
      const { msdl } = get();
      if (!msdl) return;
      
      const forceSide = msdl.getItemInstance(objectHandleOrForceSide);
      
      if (!forceSide || !(forceSide instanceof ForceSide)) {
        console.warn(`Force side with object handle ${objectHandleOrForceSide} not found.`);
        return;
      }
      
      forceSide.associations = associations;
      msdl.evaluateAssociations(forceSide);
      get().triggerUpdate();
    },
  },
}));

// Computed selectors
export const useScenarioSelectors = () => {
  const msdl = useScenarioStore((state) => state.msdl);
  const undoStack = useScenarioStore((state) => state.undoStack);
  const redoStack = useScenarioStore((state) => state.redoStack);
  
  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    isNETN: msdl?.isNETN ?? false,
  };
};

export const useCanUndo = () => 
  useScenarioStore((state) => state.undoStack.length > 0);

export const useCanRedo = () => 
  useScenarioStore((state) => state.redoStack.length > 0);

export const useIsNETN = () => 
  useScenarioStore((state) => state.msdl?.isNETN ??  false);
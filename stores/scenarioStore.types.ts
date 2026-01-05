// Type definitions for scenarioStore

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
  ForceSide,
} from "@orbat-mapper/msdllib";
import type { Association } from "@orbat-mapper/msdllib";
import type { MsdlOptionsType } from "@orbat-mapper/msdllib/dist/lib/msdlOptions";
import type { Position } from "geojson";
import type { OrbatDragItem } from "@/types/draggables";
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";

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
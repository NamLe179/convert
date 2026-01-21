import type { TacticalJson } from "@orbat-mapper/msdllib/dist/lib/common";
import type { Position } from "geojson";

// Map & Context Menu
export type MapContextMenuEvent = {
  x: number;
  y: number;
  position: Position;
  zoomLevel?: number;
  units?: TacticalJson[];
  equipment?: TacticalJson[];
};

// Generic Enum Types
export type EnumItem<G = string> = {
  value: G;
  label: string;
  description?: string;
};

export type EnumBaseLayer<G = string> = EnumItem<G> & {
  layerType: "default" | "custom";
};

// Tabs Configuration
// Trong React, bạn sẽ dùng createContext<TabsState | null>(null)
export interface TabsState {
  selectedIndex: number;
  count: number;
  tabClass?: string;
}

export type TabItem = string | { 
  label: string; 
  value: string; 
  disabled?: boolean; 
  badge?: string 
};
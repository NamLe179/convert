"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Command as CommandPrimitive } from "cmdk";
import type { Map as MlMap } from "maplibre-gl";

// Icons
import { Search } from "lucide-react";

import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";
import { flyToItem, flyToPlace } from "@/hooks/mapActions";
import { useScenarioActions, type ScenarioAction } from "@/hooks/scenarioActions";
import { 
  useScenarioSearch, 
  type ActionSearchResult, 
  type EquipmentSearchResult, 
  type UnitSearchResult 
} from "@/hooks/scenarioSearching";
import { useGeoSearch, type ExtendedPhotonSearchResult } from "@/hooks/geosearching";

// Components
import { Dialog, DialogContent } from "@/components/ui/dialog"; 
import MilSymbol from "@/components/MilSymbol";
import CommandPalettePlaceItem from "@/components/commandpalette/CommandPalettePlaceItem"; 

// Custom Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Types
type SearchItemResult =
  | UnitSearchResult
  | EquipmentSearchResult
  | ActionSearchResult
  | ExtendedPhotonSearchResult;

interface Props {
  mlMap?: MlMap;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ mlMap, open, onOpenChange }: Props) {
  // 1. Stores & Hooks
  const msdl = useScenarioStore((state) => state.msdl);
  const setActiveItem = useSelectStore((state) => state.setActiveItem);
  const { dispatchAction: _dispatchAction } = useScenarioActions();
  const { search, searchActions, actionItems } = useScenarioSearch(); 
  const { photonSearch } = useGeoSearch(); 

  // 2. State
  const [rawQuery, setRawQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  
  // GroupedHits state: Map<string, Array>
  const [groupedHits, setGroupedHits] = useState<Map<string, SearchItemResult[]>>(new Map());

  // 3. Computed & Debounce
  const query = rawQuery.replace(/^[#@>]/, "").trim();
  const debouncedQuery = useDebounce(query, 200);
  const geoDebouncedQuery = useDebounce(query, 300);

  const isActionSearch = rawQuery.startsWith("#") || rawQuery.startsWith(">");
  const isGeoSearch = rawQuery.startsWith("@");

  const noResults = useMemo(() => {
    return debouncedQuery.length > 0 && groupedHits.size === 0;
  }, [debouncedQuery, groupedHits]);

  // 4. Update Map Center when opened
  useEffect(() => {
    if (open && mlMap) {
      const center = mlMap.getCenter();
      if (center) {
        setMapCenter([center.lng, center.lat]);
      } else {
        setMapCenter(null);
      }
    }
  }, [open, mlMap]);

  // 5. Search Effect
  useEffect(() => {
    const performSearch = async () => {
      // Case 1: Action Search
      if (isActionSearch) {
        const filteredActions = query ? searchActions(query) : actionItems;
        setGroupedHits(new Map([["Actions", filteredActions]]));
        return;
      }

      // Case 2: Geo Search
      if (isGeoSearch) {
        if (!geoDebouncedQuery.trim()) return;
        const data = await photonSearch(geoDebouncedQuery, { mapCenter: mapCenter });
        setGroupedHits(
          new Map([
            ["Places", data.map((d) => ({ ...d, category: "Places" } as ExtendedPhotonSearchResult))],
          ])
        );
        return;
      }

      // Case 3: Default Scenario Search
      // search() returns a Map
      setGroupedHits(search(debouncedQuery));
    };

    performSearch();
  }, [
    debouncedQuery, 
    geoDebouncedQuery, 
    isActionSearch, 
    isGeoSearch, 
    query, 
    mapCenter, 
    search, 
    searchActions, 
    actionItems, 
    photonSearch
  ]);

  // 6. Helpers & Selection Logic
  const isUnitEquipmentSearchResult = (item: SearchItemResult): item is UnitSearchResult | EquipmentSearchResult => {
    return item.category === "Units" || item.category === "Equipment";
  };

  const isActionSearchResult = (item: SearchItemResult): item is ActionSearchResult => {
    return item.category === "Actions";
  };

  const isGeoSearchResult = (item: SearchItemResult): item is ExtendedPhotonSearchResult => {
    return item.category === "Places";
  };

  const dispatchAction = (action: ScenarioAction) => {
    _dispatchAction(action);
    onOpenChange(false);
  };

  const selectUnitOrEquipmentItem = (itemId: string) => {
    if (!itemId || !msdl) return;
    const activeItem = msdl.getUnitOrEquipmentById(itemId) ?? null;
    
    setActiveItem(activeItem);  

    onOpenChange(false);
    
    if (activeItem && mlMap) {
      flyToItem(activeItem, mlMap, { zoom: 10 });
      dispatchAction("LocateInOrbat");
    }
  };

  const selectItem = (item: SearchItemResult) => {
    if (isUnitEquipmentSearchResult(item)) {
      selectUnitOrEquipmentItem(item.id);
    } else if (isActionSearchResult(item)) {
      dispatchAction(item.action);
    } else if (isGeoSearchResult(item)) {
      if (!mlMap) return;
      onOpenChange(false);
      flyToPlace(item, mlMap);
    }
  };

  // Convert Map to Array for rendering
  const groups = Array.from(groupedHits.entries());

  const getItemLabel = (item: SearchItemResult): string => {
    if (isGeoSearchResult(item)) {
      return (item as any).properties?.name || (item as any).name || "Place";
    }
    // Các loại Unit/Action/Equipment đều có label
    return item.label;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-[550px]">
        <CommandPrimitive shouldFilter={false} className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
          {/* Input */}
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type a command or search..."
              value={rawQuery}
              onValueChange={setRawQuery}
            />
          </div>

          {/* List */}
          <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden py-2">
            
            {noResults && (
              <div className="py-6 text-center text-sm">No search results found.</div>
            )}

            {groups.map(([source, hits]) => (
              <CommandPrimitive.Group
                key={source}
                heading={source}
                className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {hits.map((item) => (
                  <CommandPrimitive.Item
                    key={item.id}
                    value={item.id + getItemLabel(item)}// Value unique để cmdk filter hoặc disable filter bằng loop
                    onSelect={() => selectItem(item)}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    {/* Render Unit/Equipment */}
                    {isUnitEquipmentSearchResult(item) && (
                      <>
                        <div className="justify-center flex w-6 mr-2 shrink-0">
                          <MilSymbol className="size-6" sidc={item.sidc} size={100} />
                        </div>
                        <div className="grid grid-cols-[auto,1fr] w-full">
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: item.highlight ? item.highlight : item.label 
                            }} 
                            className="[&_b]:text-red-600 truncate"
                          />
                          <div className="font-light text-sm text-muted-foreground truncate">
                            {item.id}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Render Action */}
                    {isActionSearchResult(item) && (
                      <>
                        <div className="justify-center flex w-6 mr-2 shrink-0">
                          {/* Render Icon component dynamically */}
                          {item.icon && <item.icon className="size-4" />}
                        </div>
                        <div className="grid grid-cols-[auto,1fr]">
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: item.highlight ? item.highlight : item.label 
                            }} 
                            className="[&_b]:text-red-600"
                          />
                        </div>
                      </>
                    )}

                    {/* Render Geo Place */}
                    {isGeoSearchResult(item) && (
                      <CommandPalettePlaceItem
                        item={item}
                        center={mapCenter}
                      />
                    )}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
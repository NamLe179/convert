"use client";

import { useState, useRef, useEffect, useMemo, useContext } from "react";
import {
  Pencil,
  ArrowUp,
  Focus,
  LocateFixed,
  ListTree, // LocateOrbatIcon
} from "lucide-react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

// Types & Utils
import { EquipmentItem, ForceSide, Unit } from "@orbat-mapper/msdllib";
import {
  isEquipmentItem,
  isForceSide,
  isUnit,
  isUnitOrEquipment,
} from "@/lib/utils-msdl";
import { cn } from "@/lib/utils";
import { getEquipmentItemDragItem, getUnitDragItem } from "@/types/draggables";
import { mapItem } from "@/components/orbat/utils";
import type { TabItem } from "@/components/types";

// Stores & Actions
import { useSelectStore } from "@/stores/selectStore";
import { useIsNETN, useScenarioStore } from "@/stores/scenarioStore";
import { useWidthStore } from "@/stores/uiStore";
import { useScenarioActions } from "@/hooks/scenarioActions";
import { useGetMapLocation } from "@/hooks/geoMapLocation"; 

// UI Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Tabsmod -> Tabs

// Custom Components
import CloseButton from "@/components/CloseButton"; 
import MilSymbol from "@/components/MilSymbol"; 
import ShowXMLDialog from "@/components/ShowXMLDialog"; 
import PanelResizeHandle from "@/components/PanelResizeHandle"; 

// Child Panels
import DetailsPanelForceSide from "@/components/DetailsPanelForceSide";
import DetailsPanelUnit from "@/components/DetailsPanelUnit";
import DetailsPanelEquipment from "@/components/DetailsPanelEquipment";
import DetailsPanelDisposition from "@/components/DetailsPanelDisposition";
import DetailsPanelEquipmentList from "@/components/DetailsPanelEquipmentList";
import DetailsPanelHoldings from "@/components/DetailsPanelHoldings";
import UnitModelPanel from "@/components/UnitModelPanel";
import EquipmentItemModelPanel from "@/components/EquipmentItemModelPanel";

// Context 
import { SidcModalContext } from "@/components/injects"; 

interface Props {
  item: Unit | EquipmentItem | ForceSide;
  mlMap: any; // maplibregl.Map
  onFlyTo: (location: any) => void;
  className? : string;
}

export default function DetailsPanel({ item, mlMap, onFlyTo, className }: Props) {
  // 1. Context & Stores
  const { msdl, modifyScenario } = useScenarioStore();
  const isNETN = useIsNETN();
  const selectStore = useSelectStore();
  const widthStore = useWidthStore();
  const { dispatchAction } = useScenarioActions();
  
  // Lấy hàm mở modal từ Context
  const { getModalSidc } = useContext(SidcModalContext) || { getModalSidc: async () => undefined };

  // 2. Local State & Refs
  const elRef = useRef<HTMLSpanElement>(null); // Ref cho biểu tượng để drag
  const [isDragging, setIsDragging] = useState(false);
  
  // 3. Map Location Hook
  const {
    start: startGetLocation,
    isActive: isGetLocationActive,
    onGetLocation,
    cancel: cancelGetLocation,
  } = useGetMapLocation(mlMap);

  // Callback khi lấy được location
  useEffect(() => {
    // Đăng ký callback (tùy thuộc vào implementation của hook useGetMapLocation)
    const unsubscribe = onGetLocation((location) => {
      modifyScenario.updateItemLocation(item.objectHandle, location);
    });
    return () => unsubscribe && unsubscribe();
  }, [onGetLocation, item.objectHandle, modifyScenario]);

  // 4. Computed Logic (useMemo)
  const typeLabel = useMemo(() => {
    if (isUnit(item)) return "Unit";
    if (isEquipmentItem(item)) return "Equipment";
    if (isForceSide(item)) return item.isSide ? "Side" : "Force";
    return "Item";
  }, [item]);

  const equipmentCount = useMemo(() => {
    return isUnit(item) ? item.equipment.length : 0;
  }, [item]);

  const holdingsCount = useMemo(() => {
    return isUnitOrEquipment(item) ? item.holdings.length : 0;
  }, [item]);

  const selectedSidc = useMemo(() => {
    // Logic Vue: lấy activeItem từ store, nhưng props item đã được truyền vào
    const active = selectStore.activeItem;
    return isUnitOrEquipment(active!) ? active.sidc : undefined;
  }, [selectStore.activeItem]);

  const selectedName = useMemo(() => {
    const active = selectStore.activeItem;
    return isUnitOrEquipment(active!) ? active.label : active?.name;
  }, [selectStore.activeItem]);

  // Tab Items logic
  const tabItems = useMemo(() => {
    const items: TabItem[] = [{ label: "Details", value: "info" }];
    if (isUnit(item)) {
      items.push({ 
        label: "Equipment", 
        value: "equipment", 
        badge: equipmentCount.toString() 
      });
    }
    if (isUnitOrEquipment(item)) {
      items.push({ label: "Model", value: "model" });
    }
    if (isNETN && isUnitOrEquipment(item)) {
      items.push({ 
        label: "Holdings", 
        value: "holdings", 
        badge: holdingsCount.toString() 
      });
    }
    return items;
  }, [item, isNETN, equipmentCount, holdingsCount]);

  // 5. Drag and Drop Effect
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => {
        if (isUnit(item)) {
          return getUnitDragItem({ item: mapItem(item) });
        } else if (isEquipmentItem(item)) {
          return getEquipmentItemDragItem({ item: mapItem(item) });
        }
        return {};
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [item]);

  // 6. Handlers
  const goUp = () => {
    if (!msdl) return;
    
    if (isUnitOrEquipment(item)) {
      const parentItem =
        msdl.getUnitOrForceSideById(item.superiorHandle) ??
        msdl.getEquipmentById(item.superiorHandle);
      if (parentItem) selectStore.setActiveItem(parentItem); 
    } else if (isForceSide(item)) {
      const parentItem = msdl.getForceSideById(item.allegianceHandle || "");
      if (parentItem) selectStore.setActiveItem(parentItem);
    }
  };

  const handleChangeSymbol = async () => {
    if (!isUnitOrEquipment(item)) return;

    let sidc = item.sidc;
    if (sidc.length !== 15) {
      console.error("Unsupported SIDC, must be exactly 15 characters long");
      return;
    }

    const newSidcValue = await getModalSidc(sidc, {});

    if (selectStore.activeItem && newSidcValue !== undefined) {
      const { sidc: newSidc } = newSidcValue;
      // Cập nhật store và model
      if ('updateSidc' in selectStore) (selectStore as any).updateSidc(newSidc);
      modifyScenario.updateSymbolIdentifier(item.objectHandle, newSidc);
    }
  };

  return (
    <Card
      className={cn("text-sm bg-sidebar gap-0 backdrop-blur-lg relative overflow-auto", className)}
      style={{ width: `${widthStore.detailsWidth}px` }}
    >
      {/* HEADER */}
      <header className="px-4 h-10 mt-10 flex justify-between">
        <div className="flex gap-2 items-center">
          <span ref={elRef}>
            <MilSymbol sidc={selectedSidc || ""} size={16} />
          </span>
          <span className="text-base font-bold">{selectedName}</span>
          
          {isUnitOrEquipment(item) && (
            <Button
              id="edit-item-details"
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleChangeSymbol}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div>
          <Badge>{typeLabel}</Badge>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="flex items-center pl-2 py-1 border-b border-muted-foreground/20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onFlyTo(item)} 
          title="Zoom to item"
        >
          <Focus className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goUp} 
          title="Go to parent"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>

        {isUnitOrEquipment(item) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={startGetLocation}
            disabled={isGetLocationActive}
            title="Set location of item"
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          title="Locate in ORBAT"
          onClick={() => dispatchAction("LocateInOrbat")}
        >
          <ListTree className="h-4 w-4" />
        </Button>

        <ShowXMLDialog item={item}>XML</ShowXMLDialog>
      </div>

      {/* TABS Content */}
      <Tabs defaultValue="info" className="w-full">
        {/* ScrollTabs Mockup: TabsList with overflow */}
        <div className="overflow-x-auto">
            <TabsList className="justify-start w-full bg-transparent h-auto p-0 border-b rounded-none">
            {tabItems.map((tab) => {
              const label = typeof tab === "string" ? tab : tab.label;
              const value = typeof tab === "string" ? tab : tab.value;
              const badge = typeof tab === "string" ? undefined : tab.badge;

              return (
                <TabsTrigger 
                    key={value} 
                    value={value}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2"
                >
                  {label}
                  {badge && (
                    <Badge variant="secondary" className="ml-2 px-1 py-0 text-[10px]">
                      {badge}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="max-h-[50vh] min-w-96">
          <TabsContent value="info" className="p-4">
            {isForceSide(item) && <DetailsPanelForceSide item={item} />}
            {isUnit(item) && <DetailsPanelUnit item={item} />}
            {isEquipmentItem(item) && <DetailsPanelEquipment item={item} />}
            {isUnitOrEquipment(item) && <DetailsPanelDisposition item={item} />}
          </TabsContent>

          {isUnit(item) && (
            <TabsContent value="equipment" className="p-4">
              <DetailsPanelEquipmentList item={item} onFlyTo={onFlyTo} />
            </TabsContent>
          )}

          {isNETN && isUnitOrEquipment(item) && (
            <TabsContent value="holdings" className="p-4">
              <DetailsPanelHoldings item={item} />
            </TabsContent>
          )}

          <TabsContent value="model">
            <div className="max-w-[40vw]">
              <div className="p-4 overflow-auto">
                {isUnit(item) && <UnitModelPanel unit={item} />}
                {isEquipmentItem(item) && <EquipmentItemModelPanel equipment={item} />}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* CLOSE BUTTON */}
      <CloseButton 
        className="absolute right-4 top-2" 
        onClick={() => selectStore.clearActiveItem()} 
      />

      {/* LOCATION OVERLAY */}
      {isGetLocationActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded z-50">
          <div className="p-4 bg-background rounded border shadow-lg">
            <span>Click on map to set location</span>
            <Button 
              variant="link" 
              type="button" 
              onClick={cancelGetLocation}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* RESIZE HANDLE */}
      <PanelResizeHandle
              left
              width={widthStore.detailsWidth}
              onUpdate={(w) => {
                  // Logic update width
                  if ('setDetailsWidth' in widthStore) (widthStore as any).setDetailsWidth(w);
                  else (widthStore as any).detailsWidth = w;
              } }
              onReset={() => widthStore.resetDetailsWidth()} onDragging={function (isDragging: boolean): void {
                  throw new Error("Function not implemented.");
              } }      />
    </Card>
  );
}
"use client";

import { useState, useMemo } from "react";
import { Crosshair } from "lucide-react";
import { toast } from "sonner";
import type { Position } from "geojson";

// Types
import type { LngLatElevationTuple, LngLatTuple } from "@orbat-mapper/msdllib";
import type { TacticalJson } from "@orbat-mapper/msdllib/dist/lib/common";
import type { MapContextMenuEvent } from "@/components/types"; 

// Stores & Utils
import { useSelectStore } from "@/stores/selectStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import { mapProviders, useMapLayerStore } from "@/stores/mapLayerStore";
import { formatDecimalDegrees } from "@/lib/utils-msdl"; 

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import MilSymbol from "@/components/MilSymbol";
import YesNoDialog from "@/components/YesNoDialog"; 

interface Props {
  event?: MapContextMenuEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MapContextMenu({ event, open, onOpenChange }: Props) {
  // Stores 
  const selectStore = useSelectStore();
  const { msdl, modifyScenario } = useScenarioStore();
  const mapLayerStore = useMapLayerStore();

  // State 
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<{
    units: TacticalJson[];
    equipment: TacticalJson[];
  }>({ units: [], equipment: [] });

  // Computed Logic 
  const clickPosition = useMemo((): number[] => {
    if (!event) return [0, 0];
    return [...event.position];
  }, [event]);

  const triggerStyle = useMemo(() => ({
    top: `${event?.y}px`,
    left: `${event?.x}px`,
  }), [event?.y, event?.x]);

  // Helper Functions 
  const returnMapProviders = (lonLat: Position | number[], zoomLevel = 15) => {
    // Ép kiểu về số an toàn
    const lat = lonLat[1];
    const lon = lonLat[0];

    return [
      {
        name: "Google Maps",
        url: `https://www.google.com/maps/@$${lat},${lon},${zoomLevel}z`,
      },
      {
        name: "Google Street View",
        url: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`,
      },
      {
        name: "Bing Maps",
        url: `https://www.bing.com/maps?cp=${lat}~${lon}&lvl=${zoomLevel}`,
      },
      {
        name: "OpenStreetMap",
        url: `https://www.openstreetmap.org/#map=15/${lat}/${lon}`,
      },
      {
        name: "Geohack",
        url: `https://geohack.toolforge.org/geohack.php?params=${lat}_N_${lon}_E`,
      },
    ];
  };

  // Handlers 

  const onUnitSelect = (activeItemId?: string) => {
    if (!activeItemId) return;
    const item = msdl?.getUnitOrEquipmentById(activeItemId) ?? null;
    // Cập nhật store (giả định store dùng setter hoặc gán trực tiếp nếu dùng proxy)
    if ('activeItem' in selectStore) (selectStore as any).activeItem = item;
  };

  const handleCreateEquipment = (pos: number[]) => {
    if (!msdl?.sides || msdl.sides.length === 0) {
      toast.info("No force sides available");
      return;
    }
    if (!pos || pos.length < 2 || pos.length > 3) return;
    modifyScenario.addEquipmentItem(pos as LngLatTuple | LngLatElevationTuple);
  };

  const handleCreateUnit = (pos: number[]) => {
    if (!msdl?.sides || msdl.sides.length === 0) {
      toast.info("No force sides available");
      return;
    }
    if (!pos || pos.length < 2 || pos.length > 3) return;
    modifyScenario.addUnit(pos as LngLatTuple | LngLatElevationTuple);
  };

  const handleDeleteItemsInit = (e: Event | React.SyntheticEvent) => {
    e.preventDefault(); // Ngăn dropdown đóng ngay lập tức 
    if (!event) return;
    
    setItemsToDelete({
      units: event.units ?? [],
      equipment: event.equipment ?? [],
    });
    setShowConfirmDeleteDialog(true);
  };

  const confirmDelete = () => {
    itemsToDelete.equipment.forEach((eq) => {
      if (eq.id) modifyScenario.removeEquipmentItem(eq.id);
    });
    itemsToDelete.units.forEach((u) => {
      if (u.id) modifyScenario.removeUnit(u.id);
    });
    setShowConfirmDeleteDialog(false);
  };

  const cancelDelete = () => {
    setItemsToDelete({ units: [], equipment: [] });
    setShowConfirmDeleteDialog(false);
  };

  // Render Helpers 
  const activeItemHandle = (selectStore as any).activeItem?.objectHandle;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        {/* Trigger ẩn/định vị */}
        <DropdownMenuTrigger
          className="absolute pointer-events-none data-[state=closed]:hidden outline-none"
          style={triggerStyle}
        >
          <Crosshair className="h-6 w-6 text-red-900/70 -translate-x-1/2 -translate-y-1/2" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56"
          align="start"
          sideOffset={0}
        >
          {event && (
            <DropdownMenuLabel>
              {formatDecimalDegrees(clickPosition)}
            </DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />

          {/* CREATE NEW MENU */}
          {(!event?.units?.length && !event?.equipment?.length) && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Create new</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleCreateUnit(clickPosition)}>
                    Unit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateEquipment(clickPosition)}>
                    Equipment item
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          )}

          {/* OPEN IN MENU */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Open in</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {returnMapProviders(clickPosition, event?.zoomLevel).map(({ name, url }) => (
                <DropdownMenuItem key={url} asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {name}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />

          {/* UNITS LIST */}
          {event?.units && event.units.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Units
                <Badge className="ml-2" variant="secondary">
                  {event.units.length}
                </Badge>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-[70vh] overflow-auto">
                {event.units.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={(e) => {
                      e.preventDefault(); // Giữ menu mở
                      onUnitSelect(item.id);
                    }}
                  >
                    <MilSymbol sidc={item.sidc} />
                    <span className={item.id === activeItemHandle ? 'font-bold' : ''}>
                      {item.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* EQUIPMENT LIST */}
          {event?.equipment && event.equipment.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Equipment
                <Badge className="ml-2" variant="secondary">
                  {event.equipment.length}
                </Badge>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-[70vh] overflow-auto">
                {event.equipment.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      onUnitSelect(item.id);
                    }}
                  >
                    <MilSymbol sidc={item.sidc} />
                    <span className={item.id === activeItemHandle ? 'font-bold' : ''}>
                      {item.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* DELETE ACTION */}
          {(event?.units?.length || event?.equipment?.length) ? (
            <>
              <DropdownMenuItem onSelect={handleDeleteItemsInit}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {/* BASE LAYER MENU */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Map baselayer</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={mapLayerStore.baseLayer}
                onValueChange={(val) => {
                   if ('setBaseLayer' in mapLayerStore) (mapLayerStore as any).setBaseLayer(val);
                   else (mapLayerStore as any).baseLayer = val;
                }}
              >
                {mapProviders.map(({ label, value }) => (
                  <DropdownMenuRadioItem
                    key={value}
                    value={value}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

        </DropdownMenuContent>
      </DropdownMenu>

      {/* CONFIRM DELETE DIALOG */}
      <YesNoDialog
        open={showConfirmDeleteDialog}
        onOpenChange={setShowConfirmDeleteDialog}
        title="Confirm deleting items"
        onYes={confirmDelete}
        onNo={cancelDelete}
      >
        <div className="text-sm">
          <p className="mb-2">Are you sure you want to delete the following item(s)?</p>
          
          {itemsToDelete.units.length > 0 && (
            <div className="mb-2">
              <p className="font-bold">Units:</p>
              <ul className="list-disc pl-5 max-h-48 overflow-y-auto">
                {itemsToDelete.units.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            </div>
          )}

          {itemsToDelete.equipment.length > 0 && (
            <div className="mb-2">
              <p className="font-bold">Equipment items:</p>
              <ul className="list-disc pl-5 max-h-48 overflow-y-auto">
                {itemsToDelete.equipment.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </YesNoDialog>
    </>
  );
}
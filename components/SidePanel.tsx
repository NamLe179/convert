"use client";

import { useEffect, useMemo } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";

// Utils & Stores
import { sortBy } from "@/lib/utils-msdl";
import { isOrbatItemDragItem } from "@/types/draggables";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useLayerStore } from "@/stores/layerStore";
import { useSideStore } from "@/stores/uiStore";
import { useDialogStore } from "@/stores/dialogStore";
import { useExpandedStore } from "@/stores/expandedStore";
import { useSelectStore } from "@/stores/selectStore";

// UI Components
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

// Custom Components
import SidePanelDropdown from "@/components/SidePanelDropdown";
import CreateNewForceSideDialog from "@/components/CreateNewForceSideDialog";
import SideItem from "@/components/orbat/SideItem";
import DescriptionItem from "@/components/DescriptionItem"; 
import DescriptionList from "@/components/DescriptionList"; 

export default function SidePanel() {
  // 1. Store Hooks
  const { msdl, modifyScenario } = useScenarioStore();
  const layerStore = useLayerStore();
  const sideStore = useSideStore();
  const dialogStore = useDialogStore();
  const expandedStore = useExpandedStore();
  const selectStore = useSelectStore();

  // 2. Computed Logic (useMemo)
  const sides = useMemo(() => {
    const rawSides = msdl?.sides ?? [];
    
    // Sort logic
    const sortedSides = sideStore.sortAlphabetically
      ? sortBy(rawSides, "name")
      : rawSides;

    // Filter logic
    if (sideStore.hideEmptySides) {
      return sortedSides.filter(
        (side) => side.subordinates.length > 0 || side.equipment.length > 0
      );
    }
    
    return sortedSides;
  }, [msdl?.sides, sideStore.sortAlphabetically, sideStore.hideEmptySides]);

  const hasHiddenSides = useMemo(() => {
    const totalSides = msdl?.sides.length ?? 0;
    const currentSides = sides.length;
    return currentSides < totalSides;
  }, [sides.length, msdl?.sides.length]);

  // 3. Drag & Drop Effect
  useEffect(() => {
    return combine(
      monitorForElements({
        onDrop(args) {
          const { location, source } = args;
          
          if (!location.current.dropTargets.length) return;
          
          const target = location.current.dropTargets[0];
          const instruction = extractInstruction(target.data);

          if (
            instruction && 
            isOrbatItemDragItem(source.data) && 
            isOrbatItemDragItem(target.data)
          ) {
            modifyScenario.updateOrbatDragItems(source.data, target.data, instruction);
          }
        },
      })
    );
  }, [modifyScenario]);

  // 4. Handlers
  const toggleLayers = () => {
    if (layerStore.layers.size >= sides.length) {
      layerStore.layers.clear();
      return;
    }
    sides.forEach((side) => {
      layerStore.layers.add(side.objectHandle);
    });
  };

  const openFederatesPanel = () => {
    selectStore.openFederatesPanel();
  };

  const createForceSide = () => {
    dialogStore.toggleCreateForceSideDialog();
  };

  const showAssociations = () => {
    dialogStore.toggleAssociationDialog();
  };

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-4 mt-1">
        <h3 className="text-xs/6 font-semibold uppercase">
          Sides
          {hasHiddenSides && (
            <span className="ml-2 text-muted-foreground text-xs">
              ({sides.length}/{msdl?.sides.length})
            </span>
          )}
        </h3>
        <SidePanelDropdown
          onToggleVisibility={toggleLayers}
          onCreateForceSide={createForceSide}
          onShowAssociations={showAssociations}
        />
      </header>

      {/* Dialog */}
      <CreateNewForceSideDialog
        open={dialogStore.isCreateForceSideDialogOpen}
        onOpenChange={(val) => {
             if (!val) dialogStore.toggleCreateForceSideDialog();
        }}
        onCreated={modifyScenario.addForceSide}
      />

      {/* Accordion Container */}
      <div id="orbat-sides-container">
        <Accordion
          type="multiple"
          className="mt-2"
          value={expandedStore.openSideItems}
          onValueChange={(val) => {
            if ('setOpenSideItems' in expandedStore) (expandedStore as any).setOpenSideItems(val);
            else (expandedStore as any).openSideItems = val;
          }}
        >
          {sides.map((side) => (
            <SideItem
              key={side.objectHandle}
              sideObjectHandle={side.objectHandle}
            />
          ))}
        </Accordion>
      </div>

      {/* Footer / Empty State */}
      {msdl && (
        <>
          {/* Empty State */}
          {msdl.forceSides.length === 0 && (
            <div className="mx-4">
              <div className="text-sm mb-2">
                The scenario does not have any Force Sides yet
              </div>
              <Button
                variant="secondary"
                onClick={createForceSide}
                id="create-force-side"
              >
                Create Force Side
              </Button>
            </div>
          )}

          {/* Action Buttons & Associations */}
          <div className="m-4">
            <Button variant="secondary" onClick={toggleLayers}>
              Toggle all side visibilities
            </Button>
            
            <Button
              variant="secondary"
              className="ml-4"
              onClick={openFederatesPanel}
              id="show-all-federates"
            >
              Show all federates
            </Button>

            {/* Sử dụng DescriptionItem Component */}
            <div className="mt-4">
              <DescriptionList>
                <DescriptionItem label="Associations">
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={showAssociations}
                    size="sm"
                  >
                    Show
                  </Button>
                </DescriptionItem>
              </DescriptionList>
            </div>
          </div>
        </>
      )}
    </>
  );
}
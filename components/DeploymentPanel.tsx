"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { getUnallocatedFederate } from "@/stores/selectStore"; 

import type { Federate } from "@orbat-mapper/msdllib";

// UI Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";

import { cn } from "@/lib/utils";

// Custom Components
import CloseButton from "@/components/CloseButton";
import ShowXMLDialog from "@/components/ShowXMLDialog";
import PanelResizeHandle from "@/components/PanelResizeHandle";
import CreateNewFederateDialog from "@/components/CreateNewFederateDialog"; 
import DeploymentFederate from "@/components/DeploymentFederate";

// Stores
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";
import { useWidthStore } from "@/stores/uiStore";
import { useDialogStore } from "@/stores/dialogStore";
import { useFederatesStore } from "@/stores/expandedStore";

interface Props {
  federate?: Federate; // Nhận prop federate 
  className?: string;  // Nhận className để positioning
}

export default function DeploymentPanel({ federate, className }: Props) {
  // 1. Stores
  const { msdl, modifyScenario } = useScenarioStore();
  const selectStore = useSelectStore();
  const widthStore = useWidthStore();
  const dialogStore = useDialogStore();
  const federatesStore = useFederatesStore();

  const [isDragging, setIsDragging] = useState(false);

  // 2. Computed Logic (useMemo)
  const allFederates = useMemo(() => {
    const deploymentFederates = msdl?.deployment?.federates || [];
    return [...deploymentFederates, getUnallocatedFederate()];
  }, [msdl?.deployment?.federates]);

  const deployment = useMemo(() => {
    // Clone object để tránh reactivity issue (giống Vue version)
    return msdl?.deployment ? { ...msdl.deployment } : undefined;
  }, [msdl?.deployment]);

  // 3. Handlers
  const handleOpenCloseAll = () => {
    const currentOpenItems = federatesStore.openItems || [];
    let newItems: string[] = [];

    if (currentOpenItems.length > 0) {
      newItems = [];
    } else {
      newItems = allFederates.map((f) => f.objectHandle);
    }

    // Update store (Flexible for Zustand setter or direct proxy)
    if ('setOpenItems' in federatesStore) {
        (federatesStore as any).setOpenItems(newItems);
    } else {
        (federatesStore as any).openItems = newItems;
    }
  };

  const handleCreateFederate = () => {
    dialogStore.toggleCreateFederateDialog();
  };

  const createNewDeployment = () => {
    modifyScenario.createDeployment();
  };

  const handleAccordionChange = (value: string[]) => {
      if ('setOpenItems' in federatesStore) {
          (federatesStore as any).setOpenItems(value);
      } else {
          (federatesStore as any).openItems = value;
      }
  };

  return (
    <Card
      className={cn(
        "text-sm bg-sidebar gap-0 backdrop-blur-lg relative overflow-auto",
        className
      )}
      style={{ width: `${widthStore.detailsWidth}px` }}
    >
      {/* Header */}
      <header className="px-4 h-10 mt-4 flex justify-between">
        <span className="text-base font-bold">Federates</span>
        <div className="font-small text-muted-foreground">
          Size: {msdl?.deployment?.federates.length || 0}
        </div>
      </header>

      {/* Toolbar / Create Deployment State */}
      {msdl?.deployment ? (
        <div
          id="create-new-federate"
          className="flex items-center pl-2 py-1 border-b border-muted-foreground/20"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={handleCreateFederate}
            title="Create new federate"
            className="mr-1"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <ShowXMLDialog item={deployment}>XML</ShowXMLDialog>
        </div>
      ) : (
        <div className="flex items-center flex-col pl-4 py-1 border-b border-muted-foreground/20">
          <span>No deployment present in MSDL file</span>
          <span className="my-6" id="create-deployment">
            <Button variant="secondary" className="ml-4" onClick={createNewDeployment}>
              Create deployment
            </Button>
          </span>
        </div>
      )}

      {/* Scrollable Content */}
      <ScrollArea className="" id="federates-overview-area">
        {msdl?.deployment && (
          <div className="w-full pb-4">
            <header className="flex items-center justify-between pl-4 mt-1">
              <h3 className="text-xs/6 font-semibold uppercase">Federates</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenCloseAll}
                title="Open/close all"
                className="mr-2"
              >
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </header>

            <CreateNewFederateDialog
              open={dialogStore.isCreateFederateDialogOpen}
              onOpenChange={(val) => {
                  if(!val) dialogStore.toggleCreateFederateDialog();
              }}
              onCreated={modifyScenario.addFederate}
            />

            <Accordion
              type="multiple"
              className="py-2"
              value={federatesStore.openItems}
              onValueChange={handleAccordionChange}
            >
              {allFederates.map((federate) => (
                <DeploymentFederate
                  key={federate.objectHandle}
                  federate={federate}
                />
              ))}
            </Accordion>
          </div>
        )}
      </ScrollArea>

      {/* Footer / Controls */}
      <CloseButton
        className="absolute right-4 top-2"
        onClick={() => selectStore.clearActiveFederate()}
      />

      <PanelResizeHandle
              left
              width={widthStore.detailsWidth}
              onUpdate={(w) => {
                  if ('setDetailsWidth' in widthStore) (widthStore as any).setDetailsWidth(w);
                  else (widthStore as any).detailsWidth = w;
              } }
              onReset={() => widthStore.resetDetailsWidth()} 
              onDragging={(dragging) => setIsDragging(dragging)}  
        />
    </Card>
  );
}
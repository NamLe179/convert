"use client";

import { ChevronsRight } from "lucide-react";
import type { Map as MlMap, LngLatBoundsLike } from "maplibre-gl";
import type { BBox } from "geojson";

// UI Components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 

// Stores
import { useUIStore, useWidthStore } from "@/stores/uiStore";
import { useScenarioStore } from "@/stores/scenarioStore";

// Custom Components
import SidePanel from "@/components/SidePanel"; 
import CloseButton from "@/components/CloseButton"; 
import PanelMapDisplay from "@/components/PanelMapDisplay"; 
import PanelScenarioInfo from "@/components/PanelScenarioInfo"; 
import PanelScenarioOptions from "@/components/PanelScenarioOptions"; 
import PanelResizeHandle from "@/components/PanelResizeHandle"; 

interface Props {
  mlMap?: MlMap;
}

export default function LeftPanel({ mlMap }: Props) {
  // 1. Stores
  const uiStore = useUIStore();
  const widthStore = useWidthStore();
  const { msdl } = useScenarioStore();

  // 2. Logic FlyTo
  const flyToBoundingBox = (bbox: BBox) => {
    if (bbox.some((v) => v === Infinity || v === -Infinity)) {
      return;
    }
    mlMap?.fitBounds(bbox as LngLatBoundsLike, {
      padding: { 
        top: 50, 
        bottom: 50, 
        left: widthStore.orbatPanelWidth + 50, 
        right: 100 
      },
    });
  };

  const tabItems = [
    { label: "ORBAT", value: "orbat" },
    { label: "Display", value: "mapdisplay" },
    { label: "Info", value: "scenarioInfo" },
    { label: "Options", value: "scenarioOptions" },
  ];

  // 3. Render: Collapsed State
  if (!uiStore.showLeftPanel) {
    return (
      <Button
        variant="outline"
        onClick={uiStore.toggleLeftPanel}
        size="icon"
        className="pointer-events-auto absolute top-2 left-2 z-10" 
      >
        <ChevronsRight className="size-4" />
        <span className="sr-only">Open panel</span>
      </Button>
    );
  }

  // 4. Render: Expanded State
  return (
    <aside
      className="h-full max-h-[90vh] bg-sidebar/95 backdrop-blur-sm pointer-events-auto border rounded-md relative flex flex-col"
      style={{ width: `${widthStore.orbatPanelWidth}px` }}
    >
      <Tabs defaultValue="orbat" className="flex flex-col h-full">
        {/* Header Tabs Area */}
        <div className="flex items-center justify-between border-b px-1 bg-muted/50">
          <TabsList className="bg-transparent p-0 h-10 w-full justify-start overflow-x-auto no-scrollbar">
            {tabItems.map((item) => (
              <TabsTrigger 
                key={item.value} 
                value={item.value}
                className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Right Slot Replacement */}
          <div className="flex items-center shrink-0 pl-2">
             <CloseButton onClick={uiStore.toggleLeftPanel} className="mr-2" />
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-hidden relative"> 
           <div className="h-full w-full overflow-y-auto">
            <TabsContent value="orbat" className="m-0 h-full">
              <SidePanel />
            </TabsContent>
            
            <TabsContent value="mapdisplay" className="m-0 mt-6 px-4">
              <PanelMapDisplay />
            </TabsContent>
            
            <TabsContent value="scenarioInfo" className="m-0 px-4">
              <PanelScenarioInfo onFlyTo={flyToBoundingBox} />
            </TabsContent>
            
            <TabsContent value="scenarioOptions" className="m-0 px-4">
              <PanelScenarioOptions />
            </TabsContent>
           </div>
        </div>
      </Tabs>

      {/* Resize Handle */}
      <PanelResizeHandle
              width={widthStore.orbatPanelWidth}
              onUpdate={(w) => widthStore.setOrbatPanelWidth(w)}
              onReset={() => widthStore.resetOrbatPanelWidth()} onDragging={function (isDragging: boolean): void {
                  throw new Error("Function not implemented.");
              } }      />
    </aside>
  );
}
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { Map as MapLibreInstance } from "maplibre-gl";
import { MilitaryScenario } from "@orbat-mapper/msdllib";

// Components
import MaplibreMap from "@/components/MaplibreMap"; 
import MainNavbar from "@/components/MainNavbar"; 
import CreateNewScenarioDialog from "@/components/CreateNewScenarioDialog"; 
import LoadFromUrlDialog from "@/components/LoadFromUrlDialog"; 
import CustomBaseLayerDialog from "@/components/CustomBaseLayerDialog"; 
import MapLogic from "@/components/MapLogic"; 
import LeftPanel from "@/components/LeftPanel"; 
import RightPanel from "@/components/RightPanel";
import DropZoneIndicator from "@/components/DropZoneIndicator";
import CommandPalette from "@/components/commandpalette/CommandPalette"; 
import EditAssociationsDialog from "@/components/EditAssociationsDialog"; 
import SymbolPickerModal from "@/components/SymbolPickerModal"; 
import UserTour from "@/components/UserTour"; 

// Stores & Hooks
import { useDialogStore } from "@/stores/dialogStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useMapLayerStore, getStyleForBaseLayer } from "@/stores/mapLayerStore";
import { useTourStore } from "@/stores/tourStore";
import { useScenarioActions } from "@/hooks/scenarioActions"; 
import { useFileDropZone } from "@/hooks/filedragdrop"; 
import { useSidcModal } from "@/hooks/modals"; 
import { SidcModalContext } from "@/components/injects";
import { progress } from "@/lib/progress"; 

// Utils
// import { inputEventFilter } from "@/utils"; 

export default function ScenarioEditorPage() {
  // 1. Stores
  const { createScenario, loadScenario, msdl, undo, redo } = useScenarioStore();
  const dialogStore = useDialogStore();
  const mapLayerStore = useMapLayerStore();
  const { startTour } = useTourStore();
  const { dispatchAction } = useScenarioActions();

  // 2. Local State & Refs
  const [mlMap, setMlMap] = useState<MapLibreInstance | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 3. Hooks (Modal, DragDrop)
  const {
    getModalSidc,
    confirmSidcModal,
    showSidcModal,
    cancelSidcModal,
    initialSidcModalValue,
    sidcModalTitle,
    // Cần đảm bảo hook useSidcModal của bạn trả về setIsVisible hoặc tương tự để control SymbolPickerModal
    setShowSidcModal 
  } = useSidcModal();

  const handleDrop = async (files: File[] | null) => {
    if (!files || files.length === 0) {
      console.error("No files dropped");
      return;
    }
    const file = files[0];
    try {
      const content = await file.text();
      loadScenario(MilitaryScenario.createFromString(content));
    } catch (e) {
      console.error("Failed to load", file.name, e);
    }
  };

  const { isOverDropZone } = useFileDropZone(dropZoneRef, handleDrop);

  // 4. Map Logic
  const updateMapStyle = useCallback(() => {
    if (!mlMap) return;
    const newStyle = getStyleForBaseLayer(
      mapLayerStore.baseLayer,
      mapLayerStore.getCustomTileUrl() // Zustand getter trả về giá trị trực tiếp, ko phải .value
    );
    mlMap.setStyle(newStyle, { diff: false });
  }, [mlMap, mapLayerStore.baseLayer, mapLayerStore]); // check dependencies

  const onMapReady = (map: MapLibreInstance) => {
    setMlMap(map);
    // updateMapStyle sẽ được gọi trong useEffect khi mlMap thay đổi
    console.log("Map ready");
  };

  // Watch map layer changes (tương đương watch trong Vue)
  useEffect(() => {
    if (mlMap && !msdl) {
      updateMapStyle();
    }
    // Else map style update is handled by MapLogic via Store subscription
  }, [mapLayerStore.baseLayer, mlMap, msdl, updateMapStyle]);

  // Initial Update Map Style when map becomes ready
  useEffect(() => {
    if (mlMap) {
      updateMapStyle();
    }
  }, [mlMap, updateMapStyle]);


  // 5. Custom Layer Handlers
  const updateCustomXYZ = (url: string) => {
    mapLayerStore.setCustomXYZUrl(url);
    updateMapStyle();
    dialogStore.toggleXYZBaseLayerDialog();
  };

  const updateCustomWMS = (url: string) => {
    mapLayerStore.setCustomWMSUrl(url);
    updateMapStyle();
    dialogStore.toggleWMSBaseLayerDialog();
  };

  // 6. Lifecycle & Dev Data Loading
  useEffect(() => {
    // Start Tour
    startTour();

    // Load Example Data (Dev only)
    if (process.env.NODE_ENV === "development") {
      const loadExampleScenario = async () => {
        progress.start(); 
        const url = "/examples/MSDL-example.xml";
        try {
          const response = await fetch(url);
          if (response.ok) {
            const msdlAsText = await response.text();
            loadScenario(MilitaryScenario.createFromString(msdlAsText));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
        progress.done();
      };
      loadExampleScenario();
    }
  }, []); // Run once on mount

  // 7. Global Keyboard Events (Thay thế <GlobalEvents>)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Filter input events (giống inputEventFilter trong Vue)
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      // Search: Ctrl+K, Meta+K, Alt+K
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "k") ||
        (e.altKey && e.key === "k")
      ) {
        e.preventDefault();
        setShowSearch(true);
      }

      // Undo: Ctrl+Z / Meta+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Shift+Z / Meta+Shift+Z / Ctrl+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        redo();
      }

      // Locate in Orbat: L
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "l") {
         // Cần check thêm logic exact modifier nếu cần
         dispatchAction("LocateInOrbat");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, dispatchAction]);

  // Provider Value Memoization
  const contextValue = useMemo(() => ({ getModalSidc }), [getModalSidc]);

  return (
    <SidcModalContext.Provider value={contextValue}>
      <div 
        className="h-[calc(100vh-theme(spacing.1))] w-full flex flex-col relative overflow-hidden bg-background" 
        ref={dropZoneRef}
      >
        <header className="shrink-0 z-50">
          <MainNavbar onShowSearch={() => setShowSearch(true)} />
        </header>

        <main className="flex-auto relative w-full h-full">
          {/* Map */}
          <MaplibreMap onReady={onMapReady} />
          
          {/* Logic Overlay */}
          {mlMap && msdl && <MapLogic mlMap={mlMap} />}

          {/* UI Panels Overlay */}
          <div className="absolute inset-0 pointer-events-none p-2 z-10">
            {/* Truyền mlMap vào panel, ép kiểu vì mlMap có thể null lúc đầu nhưng Panels sẽ handle */}
            <LeftPanel mlMap={mlMap || undefined} />
            <RightPanel mlMap={mlMap || undefined} />
          </div>
        </main>

        {/* Dialogs & Modals */}
        <CreateNewScenarioDialog
          open={dialogStore.isCreateMSDLDialogOpen}
          onOpenChange={(val) => !val && dialogStore.toggleCreateMSDLDialog()} // Logic toggle store
          onCreated={createScenario}
        />

        <LoadFromUrlDialog 
          open={dialogStore.isUrlDialogOpen}
          onOpenChange={(val) => !val && dialogStore.toggleUrlDialog()}
          onLoaded={loadScenario}
        />

        <CustomBaseLayerDialog
          open={dialogStore.isWMSBaseLayerDialogOpen}
          onOpenChange={(val) => !val && dialogStore.toggleWMSBaseLayerDialog()}
          layerType="WMS"
          onUpdatedUrl={updateCustomWMS}
        />

        <CustomBaseLayerDialog
          open={dialogStore.isXYZBaseLayerDialogOpen}
          onOpenChange={(val) => !val && dialogStore.toggleXYZBaseLayerDialog()}
          layerType="XYZ"
          onUpdatedUrl={updateCustomXYZ}
        />

        <EditAssociationsDialog 
           open={dialogStore.isAssociationDialogOpen}
           onOpenChange={(val) => !val && dialogStore.toggleAssociationDialog()}
        />

        {/* Utilities */}
        {isOverDropZone && <DropZoneIndicator />}
        
        <CommandPalette 
          open={showSearch} 
          onOpenChange={setShowSearch}
          mlMap={mlMap || undefined}
        />

        {/* Symbol Picker Modal */}
        {/* Logic hiển thị dựa trên hook useSidcModal */}
        {showSidcModal && (
          <SymbolPickerModal
            open={showSidcModal}
            onOpenChange={(val) => {
               if(!val) cancelSidcModal();
            }}
            sidc={initialSidcModalValue}
            onSidcChange={confirmSidcModal}
            dialogTitle={sidcModalTitle}
          />
        )}

        <UserTour />
      </div>
    </SidcModalContext.Provider>
  );
}
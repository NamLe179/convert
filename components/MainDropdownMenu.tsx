"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, Settings } from "lucide-react";

// Stores & Composables
import { useDialogStore } from "@/stores/dialogStore";
import { useLayerStore, useMapSettingsStore } from "@/stores/layerStore";
import { useCanRedo, useCanUndo, useScenarioStore } from "@/stores/scenarioStore";
import { useScenarioActions } from "@/hooks/scenarioActions"; 
import { mapProviders, useMapLayerStore, type BaseLayer } from "@/stores/mapLayerStore";

export default function MainDropdownMenu() {
  // Access Stores - Sử dụng selector để tránh re-render vô hạn
  const showIconAnchors = useLayerStore((state) => state.showIconAnchors);
  const setShowIconAnchors = useLayerStore((state) => state.setShowIconAnchors);
  
  const showCollisionBoxes = useMapSettingsStore((state) => state.showCollisionBoxes);
  const setShowCollisionBoxes = useMapSettingsStore((state) => state.setShowCollisionBoxes);
  const showTileBoundaries = useMapSettingsStore((state) => state.showTileBoundaries);
  const setShowTileBoundaries = useMapSettingsStore((state) => state.setShowTileBoundaries);
  const showPadding = useMapSettingsStore((state) => state.showPadding);
  const setShowPadding = useMapSettingsStore((state) => state.setShowPadding);
  const showOverdrawInspector = useMapSettingsStore((state) => state.showOverdrawInspector);
  const setShowOverdrawInspector = useMapSettingsStore((state) => state.setShowOverdrawInspector);
  
  const msdl = useScenarioStore((state) => state.msdl);
  const undo = useScenarioStore((state) => state.undo);
  const redo = useScenarioStore((state) => state.redo);
  
  // Sử dụng custom hooks
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  
  const { dispatchAction } = useScenarioActions();
  
  const toggleCreateMSDLDialog = useDialogStore((state) => state.toggleCreateMSDLDialog);
  const toggleUrlDialog = useDialogStore((state) => state.toggleUrlDialog);
  const toggleWMSBaseLayerDialog = useDialogStore((state) => state.toggleWMSBaseLayerDialog);
  const toggleXYZBaseLayerDialog = useDialogStore((state) => state.toggleXYZBaseLayerDialog);
  const toggleAssociationDialog = useDialogStore((state) => state.toggleAssociationDialog);
  
  const baseLayer = useMapLayerStore((state) => state.baseLayer);
  const setBaseLayer = useMapLayerStore((state) => state.setBaseLayer);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:bg-accent rounded flex items-center gap-2 data-[state=open]:bg-accent outline-none">
        <span className="font-bold tracking-tight">MSDL editor</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="rounded min-w-48" align="start">
        
        {/* --- FILE MENU --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>File</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => toggleCreateMSDLDialog()}>
              <span id="create-new-msdl">Create new MSDL...</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => dispatchAction("DownloadMSDL")}>
              Download MSDL
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => dispatchAction("LoadMSDLFromFile")}>
              Load MSDL from file ...
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => toggleUrlDialog()}>
              Load MSDL from URL ...
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => dispatchAction("ExportKML")}>
              Export as KML/KMZ
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* --- EDIT MENU --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Edit</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem onSelect={() => undo()} disabled={!canUndo}>
              Undo <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => redo()} disabled={!canRedo}>
              Redo <DropdownMenuShortcut>Ctrl+shift+Z</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* --- SCENARIO MENU --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Scenario</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => toggleAssociationDialog()}>
              Side associations ...
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* --- MAP BASELAYER MENU --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Map baselayer</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={baseLayer}
              onValueChange={(val) => setBaseLayer(val as BaseLayer)}
            >
              {mapProviders.map(({ label, value }) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  onSelect={(e) => e.preventDefault()} 
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="flex-1 text-left">{label}</span>
                    
                    {/* Settings Button for WMS */}
                    {(value as string) === "wms" && (
                      <Button
                        variant="ghost"
                        className="ml-2 inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          e.preventDefault(); 
                          toggleWMSBaseLayerDialog();
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    )}

                    {/* Settings Button for XYZ */}
                    {(value as string) === "xyz" && (
                      <Button
                        variant="ghost"
                        className="ml-2 inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleXYZBaseLayerDialog();
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* --- MAP DEBUGGING MENU --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!msdl}>Map debugging</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={showIconAnchors}
              onCheckedChange={setShowIconAnchors}
              onSelect={(e) => e.preventDefault()}
            >
              Show icon anchors
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuCheckboxItem
              checked={showCollisionBoxes}
              onCheckedChange={setShowCollisionBoxes}
              onSelect={(e) => e.preventDefault()}
            >
              Show collision boxes
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={showTileBoundaries}
              onCheckedChange={setShowTileBoundaries}
              onSelect={(e) => e.preventDefault()}
            >
              Show tile boundaries
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={showPadding}
              onCheckedChange={setShowPadding}
              onSelect={(e) => e.preventDefault()}
            >
              Show padding
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={showOverdrawInspector}
              onCheckedChange={setShowOverdrawInspector}
              onSelect={(e) => e.preventDefault()}
            >
              Show overdraw inspector
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* --- ABOUT MENU --- */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>About</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem asChild>
              <a 
                href="https://github.com/orbat-mapper/msdl-editor/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" /> 
                GitHub project page
              </a>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
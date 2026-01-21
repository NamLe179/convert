"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Check } from "lucide-react";
import { useDebounce } from "use-debounce"; 

// Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";

// Custom Components
import MilSymbol from "@/components/MilSymbol"; 
import SymbolCodeSelect from "./SymbolCodeSelect"; 
import SymbolCodeViewer from "./SymbolCodeViewer"; 
import SymbolCodeMultilineSelect from "./SymbolCodeMultilineSelect"; 
import EditFieldToggle from "./EditFieldToggle"; 

// Hooks & Logic
import { useSymbolItems } from "@/hooks/symbolDataB";
import { useSymbologySearch, type SymbolSearchResult } from "@/hooks/symbolSearchingB";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";
import { SidcB } from "@/symbology/sidc";
import { isUnitOrEquipment } from "@/lib/utils-msdl";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sidc?: string;
  onSidcChange?: (sidc: string) => void;
  dialogTitle?: string;
  initialTab?: string;
}

export default function SymbolPickerModal({
  open,
  onOpenChange,
  sidc = "",
  onSidcChange,
  dialogTitle = "Symbol picker",
  initialTab = "select",
}: Props) {
  // 1. Stores & Hooks
  const { msdl } = useScenarioStore();
  const selectStore = useSelectStore();
  
  // Hook logic SIDC
  const {
    // Values
    csidc,
    codingSchemeValue,
    battleDimensionValue,
    statusValue,
    functionIdValue,
    modifier1Value,
    modifier2Value,
    echelonValue,
    contextValue,
    affiliationValue,
    // Dropdown Items
    battleDimensionItems,
    statusItems,
    echelonItems,
    hqtfdItems,
    mainIconItems,
    // Methods/Helpers
    setValues,
    isLoaded,
    loadData,
  } = useSymbolItems(sidc);

  // Search Hook
  const { search } = useSymbologySearch(affiliationValue);

  // 2. Local State
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 200);
  const [dimension, setDimension] = useState<string>("");
  const [groupedHits, setGroupedHits] = useState<Record<string, SymbolSearchResult[]>>({});

  // 3. Effects
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Effect: Handle Search
  useEffect(() => {
    if (!debouncedQuery) {
      setGroupedHits({});
      return;
    }
    const { groups } = search(debouncedQuery);
    setGroupedHits(groups);
  }, [debouncedQuery, search]);

  // Effect: Sync "Dimension" composite code (Logic createDimensionCode của Vue)
  // Logic này tạo ra key tổng hợp để chọn đúng item trong dropdown "Battle Dimension"
  useEffect(() => {
    if (!isLoaded) return;
    
    let functionType = "*";
    let modifier = "*";
    
    // Tái tạo logic check loại đơn vị từ Vue
    const isGrdUnit = codingSchemeValue === "S" && battleDimensionValue === "G" && (functionIdValue[0] === "U" || functionIdValue[0] === "-");
    const isGrdEquip = battleDimensionValue === "G" && functionIdValue[0] === "E";
    const isGrdInst = battleDimensionValue === "G" && functionIdValue[0] === "I";
    const isGraphCC = codingSchemeValue === "G" && battleDimensionValue === "G" && functionIdValue[0] === "G";
    const isSigInt = codingSchemeValue === "I" && battleDimensionValue === "G" && functionIdValue[0] === "S";
    const isStabOp = codingSchemeValue === "O" && battleDimensionValue === "G" && functionIdValue[0] === "A";

    if (isGrdUnit) functionType = "U";
    else if (isGrdEquip) functionType = "E";
    else if (isGrdInst) { functionType = "I"; modifier = "H"; }
    else if (isGraphCC) functionType = "G";
    else if (isSigInt) functionType = "S";
    else if (isStabOp) functionType = "A";
    
    const newDim = `${codingSchemeValue}*${battleDimensionValue}*${functionType}*****${modifier}`;
    setDimension(newDim);
  }, [codingSchemeValue, battleDimensionValue, functionIdValue, isLoaded]);

  // 4. Handlers
  
  // Helper update SIDC an toàn bằng class SidcB
  const safeUpdate = (modifier: (s: SidcB) => void) => {
    try {
      const s = new SidcB(csidc);
      modifier(s);
      setValues(s.toString());
    } catch (error) {
      console.error("Invalid SIDC:", csidc, error);
      // Fallback to default SIDC if invalid
      const s = new SidcB("SFGPU----------");
      modifier(s);
      setValues(s.toString());
    }
  };

  // Logic: setDimension() của Vue
  const handleSetDimension = (val: string) => {
    setDimension(val);
    const code = val.replaceAll("*", "-");
    
    const newScheme = code[0];
    const newBattleDim = code[2];
    const newFuncId = code.slice(4, 10);
    
    let newMod1 = "-";
    const isGrdUnit = newScheme === "S" && newBattleDim === "G" && (newFuncId[0] === "U" || newFuncId[0] === "-");
    const isGrdEquip = newBattleDim === "G" && newFuncId[0] === "E";
    const isGrdInst = newBattleDim === "G" && newFuncId[0] === "I";
    const isSea = newScheme === "S" && (newBattleDim === "S" || newBattleDim === "U");

    if (isGrdUnit) newMod1 = "-";
    else if (isGrdEquip) newMod1 = "M";
    else if (isGrdInst) newMod1 = "H";
    else if (isSea) newMod1 = "N";
    else newMod1 = "-";

    safeUpdate((s) => {
      s.codingScheme = newScheme;
      s.battleDimension = newBattleDim;
      s.functionId = newFuncId;
      s.modifier2 = "-";
      s.modifier1 = newMod1;
    });
  };

  const onSearchResultSelect = (hit: SymbolSearchResult) => {
    setValues(hit.sidc);
    setSearchQuery(""); // Reset search after select
  };

  const onSymbolViewerSelect = (hit: { sidc: string }) => {
    setValues(hit.sidc);
  };

  const handleSubmit = () => {
    if (onSidcChange) onSidcChange(csidc);
    onOpenChange(false);
  };

  const handleUpdateName = (newValue: string) => {
    selectStore.updateName(newValue);
  };

  if (!isLoaded) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="md:max-w-2xl lg:max-w-4xl h-[90vh] md:h-auto flex flex-col overflow-hidden p-0 gap-0"
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") handleSubmit();
        }}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden px-6 py-4">
          {/* Header Preview */}
          <header className="flex h-20 w-full items-center justify-between shrink-0 mb-4">
            <div className="flex items-center gap-4">
              <MilSymbol sidc={csidc} size={44} />
              {selectStore.activeItem && isUnitOrEquipment(selectStore.activeItem) && (
                <div className="flex items-center text-base font-bold pl-4">
                  <EditFieldToggle 
                      value={selectStore.activeItem.name} 
                      onUpdate={handleUpdateName} 
                  />
                </div>
              )}
            </div>
            <SymbolCodeViewer sidc={csidc} onUpdate={onSymbolViewerSelect} />
          </header>

          {/* Tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="select">Select</TabsTrigger>
              <TabsTrigger value="favorites" disabled>Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="flex-1 overflow-hidden flex flex-col mt-4 data-[state=inactive]:hidden">
              {/* Search Box */}
              <div className="mb-4 shrink-0 border rounded-md relative z-50">
                <Command shouldFilter={false} className="rounded-lg border shadow-md">
                  <CommandInput 
                    placeholder="Search symbology..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="h-11"
                  />
                  {searchQuery.length > 0 && (
                     <div className="absolute top-full left-0 w-full bg-popover border rounded-b-md shadow-lg max-h-[300px] overflow-y-auto z-50">
                        <CommandList>
                          <CommandEmpty>No framework found.</CommandEmpty>
                          {Object.entries(groupedHits).map(([source, hits]) => (
                            <CommandGroup key={source} heading={source}>
                              {hits.map((item) => (
                                <CommandItem 
                                  key={item.sidc} 
                                  value={item.sidc + item.text} // unique value
                                  onSelect={() => onSearchResultSelect(item)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center w-full">
                                    <div className="w-10 flex justify-center mr-2 shrink-0">
                                      <MilSymbol sidc={item.sidc} size={24} />
                                    </div>
                                    <div 
                                      className="flex-1 text-sm truncate"
                                      dangerouslySetInnerHTML={{ __html: item.highlight || item.text }}
                                    />
                                    {item.sidc === csidc && <Check className="ml-auto h-4 w-4 opacity-50" />}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                     </div>
                  )}
                </Command>
              </div>

              {/* Form Fields */}
              <ScrollArea className="flex-1 -mr-4 pr-4">
                <form className="space-y-4 pb-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div className="flex w-full items-end gap-1">
                    <SymbolCodeSelect
                      value={dimension}
                      onValueChange={handleSetDimension}
                      label="Battle Dimension"
                      items={battleDimensionItems}
                    />
                  </div>

                  <SymbolCodeSelect 
                    value={statusValue} 
                    onValueChange={(val) => safeUpdate(s => s.status = val)} 
                    label="Status" 
                    items={statusItems} 
                  />

                  <SymbolCodeSelect
                    value={modifier2Value}
                    onValueChange={(val) => safeUpdate(s => s.modifier2 = val)}
                    label="Echelon / Mobility / Towed array"
                    items={echelonItems}
                  />

                  <SymbolCodeSelect
                    value={modifier1Value}
                    onValueChange={(val) => safeUpdate(s => s.modifier1 = val)}
                    label="Headquarters / Task force / Dummy"
                    items={hqtfdItems}
                  />

                  <SymbolCodeMultilineSelect
                    value={functionIdValue}
                    onValueChange={(val) => safeUpdate(s => s.functionId = val)}
                    label="Main icon"
                    items={mainIconItems}
                  />
                </form>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end space-x-2 px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Select symbol</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
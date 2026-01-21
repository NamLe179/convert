"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useLayerStore } from "@/stores/layerStore";

// UI Components
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import SwitchLabel from "@/components/SwitchLabel"; 

export default function PanelMapDisplay() {
  const layerStore = useLayerStore();

  // Local state cho slider để UI mượt mà, tránh update store liên tục khi đang kéo
  const [symbSize, setSymbSize] = useState([layerStore.symbolSize]);

  // Helper để update store an toàn (hỗ trợ cả pattern Setter và Direct Assignment)
  const updateStore = (key: keyof typeof layerStore, value: any) => {
    const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    if (typeof (layerStore as any)[setterName] === "function") {
      (layerStore as any)[setterName](value);
    } else {
      (layerStore as any)[key] = value;
    }
  };

  const resetSymbolSize = (v = 20) => {
    setSymbSize([v]);
    updateStore("symbolSize", v);
  };

  return (
    <div>
      <h4 className="text-sm font-bold mt-2">Map display</h4>
      
      <div className="grid gap-4 sm:grid-cols-2 grid-cols-1 mt-4">
        <SwitchLabel
          checked={layerStore.showUnits}
          onCheckedChange={(val) => updateStore("showUnits", val)}
        >
          Show units
        </SwitchLabel>

        <SwitchLabel
          checked={layerStore.showEquipment}
          onCheckedChange={(val) => updateStore("showEquipment", val)}
        >
          Show equipment
        </SwitchLabel>

        <SwitchLabel
          checked={layerStore.showLabels}
          onCheckedChange={(val) => updateStore("showLabels", val)}
        >
          Show labels
        </SwitchLabel>

        <SwitchLabel
          checked={layerStore.showSymbolOutline}
          onCheckedChange={(val) => updateStore("showSymbolOutline", val)}
        >
          Show symbol outline
        </SwitchLabel>

        <SwitchLabel
          checked={layerStore.showAreaOfInterest}
          onCheckedChange={(val) => updateStore("showAreaOfInterest", val)}
        >
          Show area of interest
        </SwitchLabel>

        {/* Symbol Size Slider */}
        <div className="flex items-center sm:col-span-2 gap-2 text-sm">
          <span className="flex-none text-sm font-medium">Symbol size</span>
          
          <Slider
            className="px-2 flex-1" 
            min={10}
            max={40}
            step={1}
            value={symbSize}
            onValueChange={(val) => setSymbSize(val)} // Update local UI ngay lập tức
            onValueCommit={(val) => updateStore("symbolSize", val[0])} // Update store khi thả chuột
          />
          
          <span className="flex-none w-10 text-right">
            {symbSize[0]} px
          </span>
          
          <Button
            className="flex-none -ml-1"
            variant="ghost"
            size="icon"
            onClick={() => resetSymbolSize()}
          >
            <RotateCcw className="h-4 w-4" /> {/* Thêm size cho icon */}
            <span className="sr-only">Reset symbol size</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
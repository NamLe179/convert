"use client";

import { useState, useMemo } from "react";
import { Pencil } from "lucide-react";
import type { MsdlOptionsType } from "@orbat-mapper/msdllib/dist/lib/msdlOptions";

// Stores
import { useScenarioStore } from "@/stores/scenarioStore";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Custom Components
import ShowXMLDialog from "@/components/ShowXMLDialog"; 
import OptionsEditForm from "@/components/OptionsEditForm";
import DescriptionItem from "@/components/DescriptionItem"; 
import DescriptionList from "@/components/DescriptionList"; 

export default function PanelScenarioOptions() {
  // 1. Store
  const { msdl, modifyScenario } = useScenarioStore();

  // 2. State
  const [isEditing, setIsEditing] = useState(false);

  // 3. Derived Data
  const myElement = useMemo(() => {
    return { element: msdl?.msdlOptions?.element };
  }, [msdl?.msdlOptions?.element]);

  // 4. Handlers
  const handleUpdate = (data: Partial<MsdlOptionsType>) => {
    setIsEditing(false);
    modifyScenario.updateOptions(data);
  };

  // Guard clause
  if (!msdl) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mt-1">
        <h4 className="text-sm font-bold">Options</h4>
        <div className="flex items-center gap-1">
          {msdl.isNETN && <Badge variant="secondary">NETN</Badge>}
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isEditing}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isEditing ? (
        <OptionsEditForm
          item={msdl.msdlOptions}
          onCancel={() => setIsEditing(false)}
          onUpdate={handleUpdate}
        />
      ) : (
        <DescriptionList className="divide-y divide-border">
          <DescriptionItem label="MSDLVersion">
            {msdl.msdlOptions.msdlVersion || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="AggregateBased">
            {msdl.msdlOptions.aggregateBased || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="AggregateEchelon">
            {msdl.msdlOptions.aggregateEchelon || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="StandardName">
            {msdl.msdlOptions.standardName || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="MajorVersion">
            {msdl.msdlOptions.majorVersion || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="MinorVersion">
            {msdl.msdlOptions.minorVersion || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="CoordinateSystemType">
            {msdl.msdlOptions.coordinateSystemType || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="CoordinateSystemDatum">
            {msdl.msdlOptions.coordinateSystemDatum || "n/a"}
          </DescriptionItem>

          {/* Footer Button inside Container */}
          <div className="flex items-center justify-end mt-4 pt-2">
            <Button 
              variant="outline" 
              type="button" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              Modify Options
            </Button>
          </div>
        </DescriptionList>
      )}

      {/* Debugging Section */}
      <div className="mt-4">
        <h4 className="text-sm font-bold">Debugging</h4>
        <div className="flex gap-2 mt-2">
          <ShowXMLDialog item={myElement}>
            MSDL Options
          </ShowXMLDialog>
          
          <ShowXMLDialog item={msdl}>
            MSDL (slow)
          </ShowXMLDialog>
        </div>
      </div>
    </div>
  );
}
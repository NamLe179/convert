"use client";

import { useState, useMemo } from "react";
import { Focus, Pencil } from "lucide-react";
import type { ScenarioIdType } from "@orbat-mapper/msdllib/dist/lib/scenarioid";

// Stores
import { useScenarioStore } from "@/stores/scenarioStore";
import { useDialogStore } from "@/stores/dialogStore";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Custom Components
import ShowXMLDialog from "@/components/ShowXMLDialog"; 
import ScenarioIdEditForm from "@/components/ScenarioIdEditForm";
import ScenarioStats from "@/components/ScenarioStats"; 
import DescriptionItem from "@/components/DescriptionItem";
import DescriptionList from "@/components/DescriptionList";

interface Props {
  // Thay thế emit('flyTo', bbox)
  onFlyTo: (bbox: any) => void;
}

export default function PanelScenarioInfo({ onFlyTo }: Props) {
  // 1. Stores
  const { msdl, modifyScenario } = useScenarioStore();
  const dialogStore = useDialogStore(); // Dùng nếu cần mở dialog khác

  // 2. State
  const [isEditing, setIsEditing] = useState(false);

  // 3. Handlers
  const handleUpdate = (data: Partial<ScenarioIdType>) => {
    setIsEditing(false);
    modifyScenario.updateScenarioId(data);
  };

  // 4. Derived Data (Computed)
  const areaOfInterest = msdl?.environment?.areaOfInterest;
  
  // Object wrapper cho XML Dialog (giữ nguyên logic Vue)
  const myElement = useMemo(() => {
    return { element: msdl?.scenarioId?.element };
  }, [msdl?.scenarioId?.element]);

  // Early return nếu chưa có dữ liệu msdl
  if (!msdl) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mt-1">
        <h4 className="text-base font-semibold">Scenario information</h4>
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

      {/* Edit Form OR Info Display */}
      {isEditing ? (
        <ScenarioIdEditForm
          item={msdl.scenarioId}
          onCancel={() => setIsEditing(false)}
          onUpdate={handleUpdate}
        />
      ) : (
        <DescriptionList className="divide-y divide-border">
          <DescriptionItem label="Name">
            {msdl.scenarioId.name || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="Description">
            {msdl.scenarioId.description}
          </DescriptionItem>
          
          <DescriptionItem label="Security classification">
            {msdl.scenarioId.securityClassification}
          </DescriptionItem>
          
          <DescriptionItem label="Modification date">
            {msdl.scenarioId.modificationDate || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="Type">
            {msdl.scenarioId.type || "n/a"}
          </DescriptionItem>
          
          <DescriptionItem label="Version">
            {msdl.scenarioId.version || "n/a"}
          </DescriptionItem>

          {/* Modify Button inside description list footer */}
          <div className="flex items-center justify-end mt-4">
            <Button 
              variant="outline" 
              type="button" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              Modify ScenarioID
            </Button>
          </div>
        </DescriptionList>
      )}

      {/* Environment Section */}
      <h4 className="text-base font-semibold mt-4">Environment</h4>
      <DescriptionList className="divide-y divide-border">
        <DescriptionItem label="Scenario time">
          {msdl.environment?.scenarioTime || "n/a"}
        </DescriptionItem>

        <DescriptionItem label="Area of interest">
          <div className="flex items-center justify-between gap-2">
            <span>{areaOfInterest?.toBoundingBox() || "n/a"}</span>
            <Button
              onClick={() => onFlyTo(areaOfInterest?.toBoundingBox())}
              variant="ghost"
              size="icon"
              title="Zoom to area"
              disabled={!areaOfInterest}
              className="h-6 w-6" 
            >
              <Focus className="h-4 w-4" />
            </Button>
          </div>
        </DescriptionItem>
      </DescriptionList>

      {/* Stats Section */}
      <h4 className="text-base font-semibold mt-4">Scenario statistics</h4>
      <ScenarioStats />

      {/* Debugging Section */}
      <div className="mt-4">
        <h4 className="text-sm font-bold">Debugging</h4>
        <div className="flex gap-2 mt-2">
          <ShowXMLDialog item={myElement}>
             ScenarioID
          </ShowXMLDialog>
          
          <ShowXMLDialog item={msdl}>
             MSDL (slow)
          </ShowXMLDialog>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
import {
  ScenarioId,
  type MilitaryScenarioInputType,
  type MsdlOptionsType,
  type ScenarioIdType,
} from "@orbat-mapper/msdllib";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Custom Components
import ScenarioIdEditForm from "@/components/ScenarioIdEditForm"; 

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (scenario: MilitaryScenarioInputType | undefined) => void;
}

export default function CreateNewScenarioDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  // State
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Computed equivalent
  // Khởi tạo object ScenarioId rỗng ban đầu
  // Chỉ tạo trong client-side để tránh SSR error với DOMParser
  const scenarioIdItem = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return ScenarioId.fromModel({} as ScenarioIdType);
  }, []);

  // Handlers
  const handleCancel = () => {
    onCreated(undefined);
    onOpenChange(false);
  };

  const handleUpdate = (values: Partial<ScenarioIdType>) => {
    // Construct the MSDL input object
    const scenInput: MilitaryScenarioInputType = {
      isNETN: true,
      msdlOptions: {
        msdlVersion: "",
        scenarioDataStandards: {
          symbologyDataStandard: { standardName: "NATO_APP" },
        },
        coordinateDataStandard: { coordinateSystemType: "GDC" },
      } as MsdlOptionsType,
      scenarioId: values as ScenarioIdType,
    };

    onCreated(scenInput);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new MSDL scenario</DialogTitle>
          <DialogDescription>
            Start with filling in the scenario information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {scenarioIdItem && (
            <ScenarioIdEditForm
              item={scenarioIdItem}
              onCancel={handleCancel}
              onUpdate={handleUpdate}
              variant="new"
            />
          )}
        </div>

        {isError && (
          <p className="text-sm text-destructive-foreground mt-2">
            {errorMessage}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
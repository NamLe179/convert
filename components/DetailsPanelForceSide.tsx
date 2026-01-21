"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { type ForceSide, MilitaryServiceItems } from "@orbat-mapper/msdllib";

// Components
import { Button } from "@/components/ui/button";
import DescriptionList from "@/components/DescriptionList"; 
import DescriptionItem from "@/components/DescriptionItem"; 
import ForceSideEditForm from "@/components/ForceSideEditForm"; 

// Stores
import { useScenarioStore } from "@/stores/scenarioStore";

interface Props {
  item: ForceSide;
}

export default function ForceSidePanel({ item }: Props) {
  // 1. State (Thay thế useToggle của VueUse)
  const [showEditForm, setShowEditForm] = useState(false);

  // 2. Store Access
  const { modifyScenario } = useScenarioStore();

  // 3. Handlers
  const handleUpdate = (data: Partial<ForceSide>) => {
    setShowEditForm(false);
    modifyScenario.updateForceSide(item.objectHandle, data);
    console.log("Updated ForceSide:", data);
  };

  const getServiceLabel = (service: string): string => {
    return MilitaryServiceItems.find((i) => i.value === service)?.label ?? service;
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mt-1">
        <h4 className="text-sm font-bold">Force/Side</h4>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEditForm(!showEditForm)}
            disabled={showEditForm}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conditional Rendering: Edit Form vs View Mode */}
      {showEditForm ? (
        <ForceSideEditForm
          item={item}
          onCancel={() => setShowEditForm(false)}
          onUpdate={handleUpdate}
        />
      ) : (
        <DescriptionList className="divide-y divide-border">
          
          <DescriptionItem label="Name">
            {item.name}
          </DescriptionItem>

          {item.militaryService && (
            <DescriptionItem label="Military service">
              {getServiceLabel(item.militaryService)}
            </DescriptionItem>
          )}

          {item.countryCode && (
            <DescriptionItem label="Country code">
              {item.countryCode}
            </DescriptionItem>
          )}
          
        </DescriptionList>
      )}
    </>
  );
}
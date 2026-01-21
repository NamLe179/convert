"use client";

import { useMemo } from "react";
import type { EquipmentItem, Unit } from "@orbat-mapper/msdllib";

// Stores
import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";
import { useDialogStore } from "@/stores/dialogStore";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Custom Components
import MilSymbol from "@/components/MilSymbol";
import DeploymentDropdown from "@/components/DeploymentDropdown";
import CreateNewFederateDialog from "@/components/CreateNewFederateDialog"; 
import AssignToFederateDropdown from "@/components/AssignToFederateDropdown"; 

export default function PanelScenarioDeployment() {
  // 1. Stores
  const { msdl, modifyScenario } = useScenarioStore();
  const selectStore = useSelectStore();
  const dialogStore = useDialogStore();

  // 2. Helpers
  const getFederateUnits = (units: string[]): Unit[] => {
    if (!msdl) return [];
    return units
      .map((unitId) => msdl.getUnitById(unitId))
      .filter((unit): unit is Unit => unit !== undefined);
  };

  const getFederateEquipment = (equipment: string[]): EquipmentItem[] => {
    if (!msdl) return [];
    return equipment
      .map((eqId) => msdl.getEquipmentById(eqId))
      .filter((eq): eq is EquipmentItem => eq !== undefined);
  };

  // 3. Handlers
  const handleCreateFederate = () => {
    dialogStore.toggleCreateFederateDialog();
  };

  const handleSelectItem = (item: Unit | EquipmentItem) => {
    // Update store (kiểm tra xem store dùng hàm setter hay gán trực tiếp)
    if ('setActiveItem' in selectStore) {
        (selectStore as any).setActiveItem(item);
    } else {
        (selectStore as any).activeItem = item;
    }
  };

  // Guard clause
  if (!msdl?.deployment) return null;

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between px-4 mt-1">
        <h3 className="text-xs/6 font-semibold uppercase">Federates</h3>
        <DeploymentDropdown onCreateFederate={handleCreateFederate} />
      </header>

      {/* Dialog */}
      <CreateNewFederateDialog
        open={dialogStore.isCreateFederateDialogOpen}
        onOpenChange={(val) => {
            if(!val) dialogStore.toggleCreateFederateDialog();
        }}
        onCreated={modifyScenario.addFederate}
      />

      {/* Accordion List */}
      <Accordion type="multiple" className="mt-2">
        {msdl.deployment.federates.map((federate) => {
          const federateUnits = getFederateUnits(federate.units);
          const federateEquipment = getFederateEquipment(federate.equipment);

          return (
            <AccordionItem
              key={federate.objectHandle}
              value={federate.objectHandle}
            >
              <AccordionTrigger className="bg-card-foreground/5 py-2 rounded-none px-4 hover:no-underline">
                {federate.name}
              </AccordionTrigger>
              
              <AccordionContent className="px-4">
                {/* Units List */}
                {federateUnits.length > 0 && (
                  <>
                    <h4 className="text-xs/6 font-semibold mt-2">Units</h4>
                    <ul>
                      {federateUnits.map((unit) => (
                        <li
                          key={unit.objectHandle}
                          className="flex items-center justify-between gap-1 py-1"
                        >
                          <div className="flex items-center gap-1">
                            <MilSymbol sidc={unit.sidc} size={16} />
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-foreground"
                              onClick={() => handleSelectItem(unit)}
                            >
                              {unit.label}
                            </Button>
                          </div>
                          
                          <AssignToFederateDropdown
                            className="ml-auto"
                            objectHandle={unit.objectHandle}
                            onAssignToFederate={(targetFed, includeSub) => 
                              modifyScenario.assignUnitToFederate(unit.objectHandle, targetFed, false)
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Equipment List */}
                {federateEquipment.length > 0 && (
                  <>
                    <h4 className="text-xs/6 font-semibold mt-2">Equipment</h4>
                    <ul>
                      {federateEquipment.map((equipmentItem) => (
                        <li
                          key={equipmentItem.objectHandle}
                          className="flex items-center justify-between gap-1 py-1"
                        >
                          <div className="flex items-center gap-1">
                            <MilSymbol sidc={equipmentItem.sidc} size={16} />
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-foreground"
                              onClick={() => handleSelectItem(equipmentItem)}
                            >
                              {equipmentItem.label}
                            </Button>
                          </div>
                          
                          <AssignToFederateDropdown
                            className="ml-auto"
                            objectHandle={equipmentItem.objectHandle}
                            onAssignToFederate={(targetFed) => 
                              modifyScenario.assignEquipmentToFederate(equipmentItem.objectHandle, targetFed)
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
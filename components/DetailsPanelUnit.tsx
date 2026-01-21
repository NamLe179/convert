"use client";

import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";
import { type Unit, type UnitSymbolModifiersType } from "@orbat-mapper/msdllib";

// Components
import DescriptionItem from "@/components/DescriptionItem"; 
import DescriptionList from "@/components/DescriptionList"; 

interface Props {
  item: Unit;
}

// Static configuration
const dlItems: { label: string; value: keyof UnitSymbolModifiersType }[] = [
  { label: "Echelon", value: "echelon" },
  { label: "Unique designation", value: "uniqueDesignation" },
  { label: "Reinforced/reduced", value: "reinforcedReduced" },
  { label: "Staff comments", value: "staffComments" },
  { label: "Additional info", value: "additionalInfo" },
  { label: "Combat effectiveness", value: "combatEffectiveness" },
  { label: "Higher formation", value: "higherFormation" },
  { label: "IFF", value: "iff" },
  { label: "Special C2HQ", value: "specialC2HQ" },
];

export default function DetailsPanelUnit({ item }: Props) {
  // Access Stores
  const { msdl } = useScenarioStore();
  const revision = useScenarioStore((state) => state.revision);
  const selectStore = useSelectStore();

  // 1. Reactive Symbol Identifier Logic
  // Lấy unit mới nhất từ store dựa trên objectHandle
  const currentUnit = msdl?.getUnitOrEquipmentById(item.objectHandle) as Unit | undefined;
  const symbolIdentifier = currentUnit?.symbolIdentifier ?? null;

  // 2. Selected Name Logic
  // Ép kiểu activeItem sang Unit để lấy label (theo logic code Vue)
  const selectedName = currentUnit?.label;

  // 3. Modifiers - Use currentUnit instead of item prop for reactivity
  const modifiers = currentUnit?.symbolModifiers;

  return (
    <>
      <div className="flex items-center justify-between mt-1">
        <h4 className="text-sm font-bold">Unit item</h4>
        <div className="flex items-center gap-1">
        </div>
      </div>

      <DescriptionList className="divide-y divide-border">
        
        <DescriptionItem label="Name">
          {selectedName || "n/a"}
        </DescriptionItem>

        <DescriptionItem label="Symbol identifier">
          {symbolIdentifier}
        </DescriptionItem>

        {/* Modifiers Section */}
        {modifiers && (
          <div className="ml-6">
            {dlItems.map((dlItem) => {
              const value = modifiers[dlItem.value];
              
              // Chỉ hiển thị nếu có giá trị
              if (!value) return null;

              return (
                <DescriptionItem key={dlItem.value} label={dlItem.label}>
                  {value}
                </DescriptionItem>
              );
            })}
          </div>
        )}

        <DescriptionItem label="Object handle" ddClass="text-muted-foreground">
          {item.objectHandle}
        </DescriptionItem>

      </DescriptionList>
    </>
  );
}
"use client";

import { useScenarioStore } from "@/stores/scenarioStore";
import { useSelectStore } from "@/stores/selectStore";
import { 
  type EquipmentItem, 
  type EquipmentSymbolModifiersType 
} from "@orbat-mapper/msdllib";

// Components
import DescriptionItem from "@/components/DescriptionItem"; 
import DescriptionList from "@/components/DescriptionList"; 

interface Props {
  item: EquipmentItem;
}

// Định nghĩa static data bên ngoài component để tránh khởi tạo lại
const dlItems: { label: string; value: keyof EquipmentSymbolModifiersType }[] = [
  { label: "Quantity", value: "quantity" },
  { label: "Staff comments", value: "staffComments" },
  { label: "Additional info", value: "additionalInfo" },
  { label: "Combat effectiveness", value: "combatEffectiveness" },
  { label: "IFF", value: "iff" },
  { label: "Unique designation", value: "uniqueDesignation" },
  { label: "Equipment type", value: "equipmentType" },
  { label: "Towed sonar array", value: "towedSonarArray" },
];

export default function DetailsPanelEquipment({ item }: Props) {
  // Access Stores
  const { msdl } = useScenarioStore();
  const revision = useScenarioStore((state) => state.revision);
  const selectStore = useSelectStore();

  // 1. Reactive Symbol Identifier Logic
  // Lấy item mới nhất từ store để đảm bảo symbolIdentifier cập nhật nếu store thay đổi
  const currentItem = msdl?.getUnitOrEquipmentById(item.objectHandle) as EquipmentItem | undefined;
  const symbolIdentifier = currentItem?.symbolIdentifier ?? null;

  // 2. Selected Name Logic (Theo logic Vue gốc)
  // Cần ép kiểu vì activeItem trong store có thể là Unit hoặc Equipment
  const selectedName = currentItem?.name;

  // 3. Modifiers - Use currentItem instead of item prop for reactivity
  const modifiers = currentItem?.symbolModifiers;

  return (
    <>
      <div className="flex items-center justify-between mt-1">
        <h4 className="text-sm font-bold">Equipment item</h4>
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
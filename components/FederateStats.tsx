"use client";

import { useMemo } from "react";
import { useScenarioStore } from "@/stores/scenarioStore";
import { getUnallocatedFederate } from "@/stores/selectStore";
import type { Federate } from "@orbat-mapper/msdllib";

interface Props {
  federateHandle: string;
}

export default function FederateStats({ federateHandle }: Props) {
  // Access Store
  const { msdl } = useScenarioStore();

  // Logic tính toán Stats (thay thế computed của Vue)
  const stats = useMemo(() => {
    // 1. Get Federate or Fallback
    const federate = msdl?.getFederateById(federateHandle) ?? (getUnallocatedFederate() as Federate);

    // 2. Logic tính Units
    const units = federate === getUnallocatedFederate()
      ? msdl?.deployment?.getUnallocatedUnits() || []
      : federate.units || [];

    // 3. Logic tính Equipment
    const equipment = federate === getUnallocatedFederate()
      ? msdl?.deployment?.getUnallocatedEquipment() || []
      : federate.equipment || [];

    return [
      { name: "Units", value: units.length },
      { name: "Equipment", value: equipment.length },
    ];
  }, [msdl, federateHandle]); // Dependency array: chỉ tính lại khi 2 biến này đổi

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.name} className="px-4 py-2">
            <p className="text-sm/6 font-medium text-muted-foreground">
              {stat.name}
            </p>
            <p className="flex items-baseline gap-x-2">
              <span className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
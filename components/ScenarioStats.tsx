"use client";

import { useMemo } from "react";
import { useScenarioStore } from "@/stores/scenarioStore";

export default function ScenarioStats() {
  // Access Store
  const { msdl } = useScenarioStore();

  // Logic tính toán Stats (thay thế computed của Vue)
  const stats = useMemo(() => {
    const sidesCount = Object.keys(msdl?.forceSides ?? {}).length;
    const unitsCount = Object.keys(msdl?.unitMap ?? {}).length;
    const equipmentCount = Object.keys(msdl?.equipmentMap ?? {}).length;

    return [
      { name: "Sides/force", value: sidesCount },
      { name: "Units", value: unitsCount },
      { name: "Equipment", value: equipmentCount },
    ];
  }, [msdl]); // Chỉ tính lại khi msdl thay đổi

  return (
    <div className="">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.name} className="px-4 py-6">
              <p className="text-sm/6 font-medium text-muted-foreground">
                {stat.name}
              </p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tight">
                  {stat.value}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
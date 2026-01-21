"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, EllipsisVertical } from "lucide-react";
import { useScenarioStore } from "@/stores/scenarioStore";

interface Props {
  onCreateFederate: () => void;
}

export default function DeploymentDropdown({ onCreateFederate }: Props) {
  const { msdl } = useScenarioStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Deployment actions</DropdownMenuLabel>
        
        <DropdownMenuItem 
          onSelect={onCreateFederate} 
          disabled={!msdl}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Federate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
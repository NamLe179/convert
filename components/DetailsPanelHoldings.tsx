"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Holding,
  type EquipmentItem,
  type HoldingType,
  type Unit,
} from "@orbat-mapper/msdllib";

// Utils & Stores
import { useScenarioStore } from "@/stores/scenarioStore";
import { formatNumber } from "@/lib/utils";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Custom Components
import HoldingsEditDialog from "@/components/HoldingsEditDialog"; 

interface Props {
  item: Unit | EquipmentItem;
}

export default function HoldingsPanel({ item }: Props) {
  // 1. State
  const [showEditDialog, setShowEditDialog] = useState(false);

  // 2. Store Access
  const { msdl, modifyScenario } = useScenarioStore();

  // 3. Derived State (Replaces computed)
  // Lấy dữ liệu mới nhất từ store dựa trên objectHandle
  const currentItem = msdl?.getUnitOrEquipmentById(item?.objectHandle) ?? null;
  const holdings = currentItem?.holdings ?? [];

  // 4. Handlers
  const handleUpdate = (data: HoldingType[]) => {
    setShowEditDialog(false);
    modifyScenario.updateHoldings(item.objectHandle, data);
  };

  // Helper render tooltip text (giảm lặp code trong JSX)
  const renderCellWithTooltip = (text: string | undefined) => {
    if (!text) return null;
    
    if (text.length > 18) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block max-w-[18ch] truncate cursor-help">
                {text}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{text}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return <>{text}</>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold">Holdings</h4>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowEditDialog(true)}
          disabled={showEditDialog}
          size="sm"
        >
          Edit <Pencil className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <HoldingsEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          holdings={holdings}
          parentName={item.name}
          onCancel={() => setShowEditDialog(false)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Table Content */}
      {holdings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>NSN code</TableHead>
              <TableHead>On hand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding, i) => (
              // Sử dụng index làm key nếu holding không có ID duy nhất
              <TableRow key={`${holding.nsnCode}-${i}`}>
                <TableCell className="w-1/3">
                  {renderCellWithTooltip(holding.nsnName)}
                </TableCell>
                <TableCell className="w-1/3">
                  {renderCellWithTooltip(holding.nsnCode)}
                </TableCell>
                <TableCell className="w-1/3">
                  {formatNumber(holding.onHandQuantity, { maxDecimals: 1 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        /* Empty State */
        <div className="flex items-center justify-center py-4">
          <h4 className="text-sm font-bold text-muted-foreground">
            No holdings present
          </h4>
        </div>
      )}
    </div>
  );
}
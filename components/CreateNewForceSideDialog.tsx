"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ForceSide, type ForceSideType, type ForceSideTypeInput } from "@orbat-mapper/msdllib";
import ForceSideEditForm from "@/components/ForceSideEditForm";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Callback created thay vì emit
  onCreated: (side: Partial<ForceSideType> | undefined) => void;
}

export default function ForceSideCreationDialog({ open, onOpenChange, onCreated }: Props) {
  // State error (giữ nguyên logic Vue)
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Logic computed: Tạo instance mặc định từ model rỗng
  // Chỉ tạo trong client-side để tránh SSR error với DOMParser
  const forceSide = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return ForceSide.fromModel({} as ForceSideTypeInput);
  }, []);

  const handleCancel = () => {
    onCreated(undefined);
    onOpenChange(false);
  };

  const handleUpdate = (values: Partial<ForceSideTypeInput>) => {
    // Cast values giống logic Vue
    const sideInput: Partial<ForceSideType> = { ...values };
    onCreated(sideInput);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new Force Side</DialogTitle>
          <DialogDescription>Provide the Force Side information</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {forceSide && (
            <ForceSideEditForm 
              item={forceSide} 
              onCancel={handleCancel} 
              onUpdate={handleUpdate} 
            />
          )}
        </div>

        {isError && (
          <p className="text-sm text-destructive-foreground">
            {errorMessage}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
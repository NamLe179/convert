"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Federate, type FederateType, type FederateTypeInput } from "@orbat-mapper/msdllib";
import FederateEditForm from "@/components/FederateEditForm"; 

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (federate: Partial<FederateType> | undefined) => void;
}

export default function CreateNewFederateDialog({ 
  open, 
  onOpenChange, 
  onCreated 
}: Props) {
  // State error (giữ nguyên logic Vue)
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Logic computed: Tạo instance mặc định từ model rỗng
  // useMemo giúp object này không bị tạo lại mỗi lần re-render trừ khi dependency thay đổi
  // Chỉ tạo trong client-side để tránh SSR error với DOMParser
  const federate = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return Federate.fromModel({} as FederateTypeInput);
  }, []);

  const handleCancel = () => {
    onCreated(undefined);
    onOpenChange(false);
  };

  const handleUpdate = (values: Partial<FederateTypeInput>) => {
    // Cast values giống logic Vue
    const newFederate: Partial<FederateType> = { ...values };
    onCreated(newFederate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new Federate</DialogTitle>
          <DialogDescription>Provide the Federate name</DialogDescription>
        </DialogHeader>
        
        {/* Form Component */}
        <div className="mt-0"> 
          {federate && (
            <FederateEditForm
              item={federate}
              variant="new"
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
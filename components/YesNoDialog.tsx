"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  // Cho phép custom description (tương đương slot name="description")
  // Nếu không truyền children, nó sẽ hiển thị prop message
  children?: ReactNode; 
  onYes: () => void;
  onNo?: () => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  message,
  children,
  onYes,
  onNo,
}: Props) {
  
  const handleYes = () => {
    onYes();
    onOpenChange(false);
  };

  const handleNo = () => {
    if (onNo) onNo();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            {/* asChild giúp tránh lỗi lồng thẻ p trong p nếu children là thẻ div/p */}
            <div className="pt-2"> 
              {children || message}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={handleNo}>
            No
          </Button>
          <Button onClick={handleYes}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
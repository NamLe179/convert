"use client";

import { useEffect, type ReactNode } from "react";
import { useUIStore } from "@/stores/uiStore";
import {
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: ReactNode; 
  className?: string;
  children?: ReactNode; 
  onCancel?: () => void; 
}

export default function NewSimpleModal({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
  onCancel,
}: Props) {
  const uiStore = useUIStore();

  // Logic đồng bộ Store (tương đương onMounted, onUnmounted, watch)
  useEffect(() => {
    // Cập nhật store khi open thay đổi
    // Kiểm tra xem store dùng hàm setter hay gán trực tiếp 
    if ('setModalOpen' in uiStore) {
        (uiStore as any).setModalOpen(open);
    } else {
        (uiStore as any).modalOpen = open;
    }

    // Cleanup khi unmount (tương đương onUnmounted)
    return () => {
      if ('setModalOpen' in uiStore) {
          (uiStore as any).setModalOpen(false);
      } else {
          (uiStore as any).modalOpen = false;
      }
    };
  }, [open, uiStore]);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val && onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[calc(100%-1rem)] rounded sm:max-w-lg", // Class gốc
          "max-h-[90vh] overflow-y-auto", // Thêm vào để hỗ trợ scroll 
          className
        )}
      >
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          
          {/* Logic: Hiển thị nếu có title hoặc description */}
          {(title || description) && (
            <DialogDescription asChild={typeof description !== "string"}>
              {description ? description : null}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {/* Default Slot */}
        {children}
      </DialogContent>
    </Dialog>
  );
}
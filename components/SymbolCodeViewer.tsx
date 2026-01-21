"use client";

import { useState, useEffect } from "react";
import { Check, Pencil, X, Copy } from "lucide-react";

// Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  sidc: string;
  activePart?: string;
  onUpdate?: (data: { sidc: string }) => void;
}

export default function SymbolCodeViewer({ sidc, activePart, onUpdate }: Props) {
  // State
  const [isEditMode, setIsEditMode] = useState(false);
  const [newSidc, setNewSidc] = useState(sidc);

  // Watch effect: Khi prop sidc thay đổi, cập nhật state nội bộ
  useEffect(() => {
    setNewSidc(sidc);
  }, [sidc]);

  // Handlers
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sidc);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate({ sidc: newSidc });
    }
    // Trong Vue logic gốc: reset về prop cũ trước khi toggle (để chờ parent update lại prop)
    // Tuy nhiên trong React, ta cứ đóng form, useEffect ở trên sẽ lo việc sync lại nếu parent update
    setIsEditMode(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn submit form nếu nút nằm trong form
    setNewSidc(sidc); // Reset về giá trị ban đầu
    setIsEditMode(false);
  };

  return (
    <div className="flex items-center">
      {!isEditMode ? (
        // View Mode
        <>
          <div className="rounded border border-transparent font-mono text-base">
            <Input 
              type="text" 
              value={newSidc} 
              disabled 
              readOnly
            />
          </div>
          <Button 
            onClick={() => setIsEditMode(true)} 
            className="ml-2"
            size="icon" 
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleCopy} 
            className="ml-2"
            size="icon"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit} className="flex items-end">
          <div className="rounded border border-transparent font-mono text-base">
            <Input 
              placeholder="Symbol code"
              value={newSidc}
              onChange={(e) => setNewSidc(e.target.value)}
              autoFocus
            />
          </div>

          <Button type="submit" className="ml-2" size="icon">
            <Check className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button" 
            onClick={handleCancel} 
            className="ml-2"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
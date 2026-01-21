"use client";

import { useState, useEffect } from "react";
import { Check, Pencil, X } from "lucide-react";

// Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onUpdate: (newValue: string) => void;
}

export default function EditFieldToggle({ value, onUpdate }: Props) {
  // 1. State Management
  const [isEditMode, setIsEditMode] = useState(false);
  const [newValue, setNewValue] = useState(value);

  // 2. Watch Effect: Sync local state when prop changes
  useEffect(() => {
    setNewValue(value);
  }, [value]);

  // 3. Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(newValue);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setNewValue(value); // Reset về giá trị cũ
    setIsEditMode(false);
  };

  return (
    <div className="flex items-center">
      {!isEditMode ? (
        // View Mode
        <>
          <span>{newValue}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={() => setIsEditMode(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit} className="flex items-end">
          <div className="rounded border border-transparent font-mono text-base">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              autoFocus
              placeholder="Value" 
            />
          </div>

          <Button type="submit" className="ml-2" size="icon">
            <Check className="h-4 w-4" />
          </Button>
          
          <Button
            type="button" //type button để không submit form
            className="ml-2"
            size="icon"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
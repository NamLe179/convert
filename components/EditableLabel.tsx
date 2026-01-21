"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils"; 

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function EditableLabel({
  value,
  onValueChange,
  placeholder = "Enter text...",
  className,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus vào input ngay khi chuyển sang chế độ edit
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      setTempValue(value); // Reset temp value về giá trị hiện tại
    }
  }, [isEditing, value]);

  // Xử lý phím tắt
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onValueChange(tempValue);
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setTempValue(value); // Hủy thay đổi, quay về giá trị cũ
      setIsEditing(false);
    }
  };

  // Lưu khi click ra ngoài
  const handleBlur = () => {
    onValueChange(tempValue);
    setIsEditing(false);
  };

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "relative rounded cursor-text",
        // Các class style từ Vue gốc:
        "focus-within:ring-2 focus-within:border-ring ring-ring/50 ring-offset-4",
        // Style cho trạng thái disabled/readonly nếu cần mở rộng sau này
        "data-[disabled]:cursor-default", 
        className
      )}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        />
      ) : (
        <span
          className={cn(
            "block min-h-[1.5em] w-full", // Đảm bảo có chiều cao để click được nếu rỗng
            !value && "text-muted-foreground italic" // Style cho placeholder giả
          )}
        >
          {value || placeholder || "Click to edit"}
        </span>
      )}
    </div>
  );
}
"use client";

import { useRef, useCallback, type PointerEvent } from "react";
import { cn } from "@/lib/utils"; 

interface Props {
  width: number;
  left?: boolean;
  onUpdate: (width: number) => void;
  onDragging: (isDragging: boolean) => void;
  onReset: () => void;
}

export default function ResizeHandle({ 
  width, 
  left = false, 
  onUpdate, 
  onDragging, 
  onReset 
}: Props) {
  // Refs để lưu trữ trạng thái mà không gây re-render không cần thiết
  const isDragging = useRef(false);
  const startX = useRef(0);
  const initialWidth = useRef(0);
  const lastEmittedTime = useRef(0);

  const onPointerDown = (evt: PointerEvent<HTMLButtonElement>) => {
    const element = evt.currentTarget;
    
    initialWidth.current = width;
    startX.current = evt.clientX;
    isDragging.current = true;
    
    // Capture pointer để đảm bảo sự kiện move vẫn nhận được dù chuột ra khỏi button
    element.setPointerCapture(evt.pointerId);
    
    onDragging(true);
  };

  const onPointerUp = (evt: PointerEvent<HTMLButtonElement>) => {
    if (isDragging.current) {
      isDragging.current = false;
      evt.currentTarget.releasePointerCapture(evt.pointerId);
      onDragging(false);
    }
  };

  // Logic tính toán độ rộng mới
  const handleMove = (clientX: number) => {
    const delta = clientX - startX.current;
    const newWidth = left 
      ? initialWidth.current - delta 
      : initialWidth.current + delta;
    
    onUpdate(newWidth);
  };

  // Logic Throttling (tương đương useThrottleFn(..., 10))
  const onPointerMove = (evt: PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;

    const now = Date.now();
    // 10ms throttle
    if (now - lastEmittedTime.current >= 10) {
      handleMove(evt.clientX);
      lastEmittedTime.current = now;
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "absolute top-0 bottom-0 z-30 w-1.5 cursor-col-resize touch-none",
        "pointer-none:w-3", 
        "pointer-none:bg-accent-foreground/50",
        "pointer-fine:hover:bg-accent-foreground/50", 
        left ? "left-0" : "right-0"
      )}
      onDoubleClick={onReset}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    />
  );
}
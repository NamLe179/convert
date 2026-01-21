"use client"; 

import React, { useEffect, useRef } from "react";
import ms from "milsymbol";
import { cn } from "@/lib/utils"; 

interface MilSymbolProps {
  sidc?: string;
  size?: number;
  modifiers?: Record<string, any>;
  className?: string;
}

const MilSymbol: React.FC<MilSymbolProps> = ({
  sidc = "",
  size = 32,
  modifiers = {},
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Đảm bảo ref tồn tại
    if (!containerRef.current) return;

    // 1. Khởi tạo Symbol với logic giống hệt bên Vue
    const symb = new ms.Symbol(sidc || "", {
      size: size,
      simpleStatusModifier: true,
      outlineColor: "white",
      outlineWidth: 8,
      ...modifiers,
    });

    // 2. Lấy DOM element từ thư viện
    const element = symb.asDOM();

    // 3. Clear nội dung cũ và append nội dung mới vào container
    containerRef.current.innerHTML = "";
    
    element.classList.add("milsymbol"); 
    
    containerRef.current.appendChild(element);

  }, [sidc, size, modifiers]); // Re-render khi props thay đổi

  return (
    // Wrapper div để chứa SVG
    <div 
      ref={containerRef} 
      className={cn("inline-block align-middle", className)}
    />
  );
};

export default MilSymbol;
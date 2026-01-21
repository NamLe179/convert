"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { MilitaryScenario } from "@orbat-mapper/msdllib";
import { cn } from "@/lib/utils"; 

interface Props {
  onLoaded: (scenario: MilitaryScenario) => void;
}

export default function LoadScenarioPanel({ onLoaded }: Props) {
  // State
  const [isError, setIsError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Logic đọc file
  const readFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      const content = evt?.target?.result as string;
      setIsError(false);
      try {
        const msdl = MilitaryScenario.createFromString(content);
        onLoaded(msdl);
      } catch (e) {
        console.error("Failed to load", file.name, e);
        setIsError(true);
      }
    };
    
    reader.onerror = () => {
      setIsError(true);
    };

    reader.readAsText(file);
  };

  // Handlers
  const onFileLoad = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    readFile(files[0]);
    // Reset value để cho phép chọn lại cùng một file nếu cần
    e.target.value = ""; 
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative w-full rounded-lg border-2 border-dashed border-slate-300 p-4 ring-offset-2 focus-within:ring-2 hover:border-gray-500 dark:border-slate-600 transition-colors",
        isDragOver && "cursor-crosshair border-green-500 bg-muted"
      )}
    >
      <input
        type="file"
        id="file-upload" // Đổi ID để tránh trùng lặp
        onChange={onFileLoad}
        className="absolute h-[0.1px] w-[0.1px] opacity-0"
        accept=".xml,.msdl" // Giới hạn loại file
      />
      
      <label
        htmlFor="file-upload"
        className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-sm font-medium text-muted-foreground hover:text-accent-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1"
          stroke="currentColor"
          className="h-12 w-12 text-slate-400 dark:text-slate-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>

        <p className="mt-2 text-center">
          Drag a file here or click to select local file
        </p>
      </label>

      {isError && (
        <p className="absolute top-0 left-0 w-full text-center text-base text-destructive-foreground bg-destructive py-1 rounded-t-lg">
          Please select a valid scenario file.
        </p>
      )}
    </div>
  );
}
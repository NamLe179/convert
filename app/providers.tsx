"use client";

import { Toaster as Sonner } from "sonner";
import { useEffect } from "react";

// Store initialization will be handled differently in React
// You'll need to convert Pinia stores to Zustand or React Context

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize stores here (equivalent to entityTypeStore.init())
    // This will be implemented when converting stores
  }, []);

  return (
    <>
      {children}
      <Sonner className="pointer-events-auto" />
    </>
  );
}
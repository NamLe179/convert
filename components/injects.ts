import { createContext, useContext } from "react";
import type { MilitaryScenario } from "@orbat-mapper/msdllib";
import type { SidcModalPromise } from "@/hooks/modals"; // Đảm bảo đường dẫn đúng

// 1. Active Scenario Context 
export const ActiveScenarioContext = createContext<MilitaryScenario | undefined>(undefined);

export function useActiveScenario() {
  return useContext(ActiveScenarioContext);
}

// 2. SIDC Modal Context 

// Định nghĩa kiểu dữ liệu cho Context
interface SidcModalContextType {
  getModalSidc: SidcModalPromise;
}

// Tạo Context
export const SidcModalContext = createContext<SidcModalContextType | null>(null);

// Tạo Custom Hook để sử dụng (thay thế cho injectStrict)
export function useSidcModal() {
  const context = useContext(SidcModalContext);
  
  if (!context) {
    throw new Error("useSidcModal must be used within a SidcModalProvider");
  }
  
  return context;
}
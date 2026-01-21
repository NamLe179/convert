"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";

// UI Components
import { Button } from "@/components/ui/button";
import MainDropdownMenu from "@/components/MainDropdownMenu"; 
import EditableLabel from "@/components/EditableLabel"; 

// Logic & Stores
import { loadMSDLFromFile } from "@/lib/io";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useTourStore } from "@/stores/tourStore";

interface Props {
  onShowSearch: () => void;
}

export default function MainNavbar({ onShowSearch }: Props) {
  // 1. Hooks & Stores
  const { msdl, loadScenario, modifyScenario } = useScenarioStore();
  const { resetTour, startTour } = useTourStore();
  
  // Theme management (next-themes)
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Tránh hydration mismatch cho icon theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Handlers
  const handleLoadScenario = async () => {
    try {
      const scn = await loadMSDLFromFile();
      if (scn) loadScenario(scn);
    } catch (e) {
      // Ignore if user cancelled file picker
      if (e instanceof DOMException && e.name === 'AbortError') {
        return;
      }
      console.error(e);
    }
  };

  const handleRestartTour = (e: React.MouseEvent, startFromIndex: number = 0) => {
    // Logic tương đương @click.ctrl.exact
    // Nếu giữ Ctrl thì start từ index 9, ngược lại từ 0
    const index = e.ctrlKey ? 9 : startFromIndex;
    
    resetTour();
    startTour(index);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // 3. Computed Logic cho Scenario Name
  const scenarioName = msdl?.scenarioId?.name || "No title";

  const handleNameChange = (newName: string) => {
    if (msdl) {
      modifyScenario.updateScenarioId({ name: newName });
    }
  };

  return (
    <nav className="flex items-center justify-between p-1 border-b">
      {/* Left Side */}
      <div className="pl-2 flex items-center gap-2" id="main-dropdown-menu">
        <MainDropdownMenu />
        
        {msdl ? (
          <EditableLabel 
            value={scenarioName} 
            onValueChange={handleNameChange} // Prop thay thế cho v-model
          />
        ) : (
          <Button variant="outline" onClick={handleLoadScenario}>
            Load scenario
          </Button>
        )}
      </div>

      {/* Right Side */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onShowSearch}
          size="icon"
          title="Search units, items or commands"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          onClick={toggleTheme} 
          size="icon" 
          title="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button
          variant="outline"
          onClick={(e) => handleRestartTour(e)}
          size="icon"
          title="Start help tour"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
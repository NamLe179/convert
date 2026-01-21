"use client";

import { useState } from "react";
import { MilitaryScenario } from "@orbat-mapper/msdllib";
import { isUrl } from "@/lib/utils-msdl"; 

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoaded: (scenario: MilitaryScenario) => void;
}

export default function LoadFromUrlDialog({
  open,
  onOpenChange,
  onLoaded,
}: Props) {
  // State
  const [scenarioUrl, setScenarioUrl] = useState("");
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handlers
  const handleFetchScenario = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn reload trang 

    if (!isUrl(scenarioUrl)) {
      setIsError(true);
      setErrorMessage(`The url ${scenarioUrl} is not a valid url.`);
      return;
    }

    try {
      // Reset trạng thái lỗi trước khi fetch
      setIsError(false);
      setErrorMessage("");

      const response = await fetch(scenarioUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP Status: ${response.status}`);
      }

      const content = await response.text();
      const msdl = MilitaryScenario.createFromString(content);
      
      onLoaded(msdl);
      onOpenChange(false); // Đóng dialog
    } catch (e) {
      console.error("Failed to load", scenarioUrl);
      setIsError(true);
      setErrorMessage(`Failed to load ${scenarioUrl}: ${(e as Error).message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleFetchScenario}>
          <DialogHeader>
            <DialogTitle>Load MSDL scenario from URL</DialogTitle>
            <DialogDescription>
              Please note that the host must be configured to allow CORS requests.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="url-input">URL</Label>
              <Input
                id="url-input" // Đổi id cho ngữ nghĩa hơn
                type="text"
                value={scenarioUrl}
                onChange={(e) => {
                  setScenarioUrl(e.target.value);
                  if (isError) setIsError(false); 
                }}
                placeholder="https://example.com/scenario.xml"
              />
            </div>
          </div>

          {isError && (
            <p className="text-sm text-destructive-foreground mb-4">
              {errorMessage}
            </p>
          )}

          <DialogFooter>
            <Button type="submit">Load from URL</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect } from "react";
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
  layerType: "WMS" | "XYZ";
  onUpdatedUrl: (url: string) => void;
}

export default function CustomBaseLayerDialog({
  open,
  onOpenChange,
  layerType,
  onUpdatedUrl,
}: Props) {
  // State
  const [layerUrl, setLayerUrl] = useState("");
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setLayerUrl("");
      setIsError(false);
      setErrorMessage("");
    }
  }, [open]);

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate logic
    if (!isUrl(layerUrl)) {
      setIsError(true);
      setErrorMessage(`The url "${layerUrl}" is not a valid url.`);
      return;
    }

    // Success logic
    onUpdatedUrl(layerUrl);
    onOpenChange(false); // Close dialog on success
  };

  // Helper text generators
  const title = `Provide ${layerType} URL of a custom base layer for the map`;
  
  const exampleUrl = layerType === "XYZ" 
    ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png" 
    : "https://ows.terrestris.de/osm/service?service=WMS&request=GetMap&version=1.1.1&layers=TOPO-WMS%2COSM-Overlay-WMS&styles=&format=image%2Fpng&transparent=true&info_format=text%2Fhtml&tiled=false&srs=EPSG:3857&bbox={bbox-epsg-3857}&width=256&height=256";

  const description = `Please look at the maplibre-gl documentation for ${layerType}-url formats, e.g.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="w-full max-w-md break-words">
              {description}
              <span className="mt-2 block font-mono text-xs bg-muted p-2 rounded break-all">
                {exampleUrl}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="layer-url">Layer URL</Label>
              <Input
                id="layer-url"
                type="text"
                value={layerUrl}
                onChange={(e) => {
                    setLayerUrl(e.target.value);
                    if(isError) setIsError(false); // Clear error on type
                }}
                placeholder="https://..."
              />
            </div>
            
            {isError && (
              <p className="text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">Set baselayer url</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
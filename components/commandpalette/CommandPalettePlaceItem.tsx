"use client";

import { MapPin, Square } from "lucide-react";
import distance from "@turf/distance";
import type { Feature, Point } from "geojson";

// Types
import { type GeoSearchProperties, type PhotonSearchResult } from "@/hooks/geosearching"; 
import { formatLength } from "@/lib/utils-msdl"; 

interface Props {
  item: PhotonSearchResult;
  center?: number[] | null;
}

export default function CommandPalettePlaceItem({ item, center }: Props) {
  // Logic tính khoảng cách
  const getFromCenter = (f: Feature<Point, GeoSearchProperties>) => {
    if (!center) return "";
    
    // @turf/distance nhận tham số: from, to, options
    const length = distance(center, f.geometry.coordinates, { units: "meters" });
    return length ? formatLength(length) : "";
  };

  // Logic Dynamic Icon 
  const IconComponent = item.properties.extent ? Square : MapPin;

  return (
    <>
      {/* Cột Icon */}
      <div className="justify-center flex w-6">
        <IconComponent
          className="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>

      {/* Cột Nội dung */}
      <div className="grid grid-cols-[auto,1fr] w-full">
        <span>{item.properties.name}</span>
        
        <div className="text-sm text-muted-foreground flex justify-between w-full">
          <div className="space-x-1">
            <span className="uppercase">{item.properties.category}</span>
            {item.properties.city && <span>{item.properties.city}</span>}
            {item.properties.state && <span>{item.properties.state}</span>}
            {item.properties.country && <span>{item.properties.country}</span>}
          </div>
          <span className="">{getFromCenter(item)}</span>
        </div>
      </div>
    </>
  );
}
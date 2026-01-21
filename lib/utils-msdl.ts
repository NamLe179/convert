import React from "react";
import type { Position } from "geojson";
import { EquipmentItem, ForceSide, type MsdlEnumItem, Unit } from "@orbat-mapper/msdllib";

export function sortBy<T extends object, K extends keyof T>(
  arr: T[],
  key: K,
  ascending = true
) {
  return arr.sort((a, b) => {
    if (ascending) {
      return (a[key] || "") > (b[key] || "") ? 1 : -1;
    } else {
      return (a[key] || "") < (b[key] || "") ? 1 : -1;
    }
  });
}

export function isUrl(str: string) {
  try {
    new URL(str);
  } catch (_) {
    return false;
  }

  return true;
}

// React doesn't use Vue's inject/provide pattern
// Instead, use React Context or prop drilling
export function createStrictContext<T>(displayName: string) {
  const Context = React.createContext<T | undefined>(undefined);
  Context.displayName = displayName;

  function useStrictContext() {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(`use${displayName} must be used within ${displayName}Provider`);
    }
    return context;
  }

  return [Context.Provider, useStrictContext] as const;
}

// Note: The combineSidesToJson, isUnit, isEquipmentItem, etc. functions
// depend on @orbat-mapper/msdllib which you'll need to add to package.json

export function inputEventFilter(event: Event) {
  return !(
    ["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName) ||
    (event.target as HTMLElement).dataset?.indent
  );
}

export async function saveBlobToLocalFile(
  data: Blob | Promise<Blob> | Response,
  fileName: string,
  options: { mimeTypes?: string[]; extensions?: string[] } = {}
) {
  const { fileSave } = await import("browser-fs-access");
  try {
    return await fileSave(data, { fileName, ...options });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    } else {
      throw error;
    }
  }
}

export function formatDecimalDegrees(p?: Position, precision = 4) {
  if (!p) return "";
  const [lon, lat] = p;
  return `${Math.abs(lat).toFixed(precision)}° ${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(
    precision
  )}° ${lon >= 0 ? "E" : "W"}`;
}

export function xmlToString(element: Element): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(element);
}

export function parseFromString(xmlString: string): Element {
  if (typeof window === 'undefined') {
    throw new Error('parseFromString can only be used in browser environment');
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  return doc.documentElement;
}

export function isUnit(item: Unit | EquipmentItem | ForceSide): item is Unit {
  return item instanceof Unit;
}

export function isEquipmentItem(item: Unit | EquipmentItem | ForceSide): item is EquipmentItem {
  return item instanceof EquipmentItem;
}

export function isForceSide(item: Unit | EquipmentItem | ForceSide): item is ForceSide {
  return item instanceof ForceSide;
}

export function isUnitOrEquipment(
  item: Unit | EquipmentItem | ForceSide,
): item is Unit | EquipmentItem {
  return isUnit(item) || isEquipmentItem(item);
}

export function combineSidesToJson(
  sides: ForceSide[],
  { includeUnits = true, includeEquipment = true } = {},
) {
  const unitFeatures = sides
    .map(
      (side) =>
        side.toGeoJson({ includeUnits, includeEquipment: false, includeIdInProperties: true })
          .features,
    )
    .flat()
    .map((feature) => ({
      ...feature,
      properties: { ...feature.properties, type: "unit" },
    }));
  const equipmentFeatures = sides
    .map(
      (side) =>
        side.toGeoJson({ includeUnits: false, includeEquipment, includeIdInProperties: true })
          .features,
    )
    .flat()
    .map((feature) => ({
      ...feature,
      properties: { ...feature.properties, type: "equipment" },
    }));
  return {
    type: "FeatureCollection" as const,
    features: [...unitFeatures, ...equipmentFeatures],
  };
}

export function enum2Object(enumItems: MsdlEnumItem[]): Record<string, any> {
  return Object.fromEntries(
    enumItems.map((item) => [
      item.value,
      {
        ...item,
      },
    ]),
  );
}

export function triggerFlash(element: Element) {
  element.animate(
    [
      {
        backgroundColor: "#2b7fff",
      },
      {},
    ],
    {
      duration: 1500,
      easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
      iterations: 1,
    }
  );
}

export function htmlTagEscape(text: string) {
  return text.replace(/&/g, " ").replace(/</g, " ").replace(/>/g, " ");
}

export function groupBy<T extends object, K extends keyof T>(arr: T[], key: K) {
  return arr.reduce((acc, item) => {
    acc.set(item[key], [...(acc.get(item[key]) || []), item]);
    return acc;
  }, new Map<T[K], T[]>());
}

export function groupByObj<T extends object, K extends keyof T>(arr: T[], key: K) {
  return arr.reduce(
    (acc, item) => {
      const k = String(item[key] as unknown);
      (acc[k] = acc[k] || []).push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export type MeasurementUnit = "metric" | "imperial" | "nautical";

export function formatLength(length: number, unit: MeasurementUnit = "metric") {
  let output: string = "";
  if (unit === "metric") {
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + " km";
    } else {
      output = Math.round(length * 100) / 100 + " m";
    }
  } else if (unit === "imperial") {
    const miles = length * 0.000621371192;
    if (miles > 0.1) {
      output = miles.toFixed(2) + " mi";
    } else {
      output = (miles * 5280).toFixed(2) + " ft";
    }
  } else if (unit === "nautical") {
    const nm = length * 0.000539956803;
    if (nm > 0.1) {
      output = nm.toFixed(2) + " nm";
    } else {
      output = nm.toFixed(3) + " nm";
    }
  }
  return output;
}
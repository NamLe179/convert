"use client";

// This file contains I/O operations for MSDL files
// Note: These are client-side only operations due to file system access
import type { TacticalJson } from "@orbat-mapper/msdllib/dist/lib/common";
import type { MilitaryScenario } from "@orbat-mapper/msdllib";
import type { Root } from "@tmcw/togeojson";
import type { FeatureCollection, Point } from "geojson";
import { saveBlobToLocalFile } from "@/lib/utils-msdl";
import { progress } from "@/lib/progress";
import { combineSidesToJson } from "@/lib/utils-msdl";
import ms from "milsymbol";

/**
 * Load MSDL file from user's file system
 */
export async function loadMSDLFromFile(): Promise<MilitaryScenario> {
  const { fileOpen } = await import("browser-fs-access");
  const { MilitaryScenario } = await import("@orbat-mapper/msdllib");
  
  try {
    const file = await fileOpen({ extensions: [".xml"] });
    const text = await file.text();
    
    await progress.start();
    return MilitaryScenario.createFromString(text);
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await progress.done();
  }
}

export type ExportSettings = {
  includeUnits: boolean;
  includeFeatures: boolean;
  embedIcons: boolean;
  useShortName: boolean;
  oneFolderPerSide: boolean;
};

/**
 * Create KML string from scenario
 */
async function createKMLString(
  scenario: MilitaryScenario, 
  sidcs: string[]
): Promise<string> {
  const includeUnits = true;
  const includeEquipment = true;
  const { foldersToKML } = await import("@/lib/tokml");
  const root: Root = { type: "root", children: [] };

  function createFolder(
    units: FeatureCollection<Point | null, TacticalJson>, 
    name: string
  ) {
    root.children.push({
      type: "folder",
      meta: { name },
      children: units.features.map((unit) => {
        const { label, sidc } = unit.properties;
        return {
          ...unit,
          properties: {
            name: label,
            styleUrl: `#sidc${sidc}`,
          },
        };
      }),
    });
  }

  if (includeUnits) {
    for (const side of scenario.sides) {
      const units = side.toGeoJson({ includeUnits, includeEquipment });
      createFolder(units, side.name);
    }
  }
  
  return foldersToKML(root, sidcs);
}

/**
 * Download scenario as KMZ file
 */
export async function downloadAsKMZ(scenario: MilitaryScenario) {
  const { zipSync } = await import("fflate");
  
  const data: Record<string, Uint8Array> = {};
  const usedSidcs = new Set<string>();
  
  // Combine all sides to JSON features
  const combinedJson = combineSidesToJson(scenario.sides);
  
  // Create symbol icons
  for (const unitFeature of combinedJson.features) {
    const { sidc } = unitFeature.properties;
    if (!sidc) continue;
    
    const cacheKey = sidc.replaceAll("#", "");
    if (!usedSidcs.has(cacheKey)) {
      const symb = new ms.Symbol(sidc);
      usedSidcs.add(cacheKey);
      
      const blob: Blob | null = await new Promise((resolve) => 
        symb.asCanvas().toBlob(resolve)
      );
      
      if (blob) {
        data[`icons/${cacheKey}.png`] = new Uint8Array(
          await blob.arrayBuffer()
        );
      }
    }
  }

  const kmlString = await createKMLString(scenario, [...usedSidcs]);
  data["doc.kml"] = new TextEncoder().encode(kmlString);

  const zipData = zipSync(data);
  return await saveBlobToLocalFile(
    new Blob([zipData as BlobPart], {
      type: "application/octet-stream",
    }),
    "scenario.kmz",
  );
}

/**
 * Download scenario as MSDL XML file
 */
export async function downloadAsMSDL(scenario: MilitaryScenario) {
  const blob = new Blob([scenario.toString()], { type: "text/xml" });
  return await saveBlobToLocalFile(
    blob, 
    "scenario.xml", 
    { extensions: [".xml"] }
  );
}
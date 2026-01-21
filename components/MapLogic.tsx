"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { GeoJSONSource, Map as MlMap, MapLayerMouseEvent, MapMouseEvent } from "maplibre-gl";
import { centroid } from "@turf/centroid";
import { featureCollection as createFeatureCollection } from "@turf/helpers";
import ms from "milsymbol";

// Types
import type { EquipmentItem, ForceSide, Unit } from "@orbat-mapper/msdllib";
import type { MapContextMenuEvent } from "@/components/types";
import type { Feature, Geometry } from "geojson";

// Stores & Utils
import { combineSidesToJson, isUnitOrEquipment, sortBy } from "@/lib/utils-msdl";
import { useLayerStore, useMapSettingsStore } from "@/stores/layerStore";
import { useSelectStore } from "@/stores/selectStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useUIStore } from "@/stores/uiStore";
import { useMapLayerStore, getStyleForBaseLayer } from "@/stores/mapLayerStore";
import { useMapDrop } from "@/hooks/mapDrop";

// Components
import MapContextMenu from "@/components/MapContextMenu";

interface Props {
  mlMap: MlMap;
}

export default function MapLogic({ mlMap }: Props) {
  // 1. Stores
  const msdl = useScenarioStore((state) => state.msdl);
  const revision = useScenarioStore((state) => state.revision);
  const layerStore = useLayerStore();
  const mapSettings = useMapSettingsStore();
  const selectStore = useSelectStore();
  const uiStore = useUIStore();
  const mapLayerStore = useMapLayerStore();

  // 2. Local State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mapEventData, setMapEventData] = useState<MapContextMenuEvent>();
  
  // Custom Hook
  const { isDragging, formattedPosition } = useMapDrop(mlMap);

  // 3. Computed Data (Sides)
  const sides = useMemo(() => {
    return sortBy(msdl?.sides ?? [], "name").filter(
      (side) => side.subordinates.length > 0 || side.equipment.length > 0
    );
  }, [msdl, revision]);

  // 4. Helper Functions
  const checkIfSymbolCode = (id: string) => {
    return /^[A-Z0-9\-*]+$/.test(id);
  };

  const setTextField = useCallback(() => {
    if (!mlMap.getLayer("msdl-sides")) return;
    
    if (layerStore.showLabels) {
      mlMap.setLayoutProperty("msdl-sides", "text-field", ["get", "label"]);
    } else {
      mlMap.setLayoutProperty("msdl-sides", "text-field", null);
    }
  }, [mlMap, layerStore.showLabels]);

  const updateActiveItem = useCallback((
    newItem: ForceSide | Unit | EquipmentItem | null
  ) => {
    const source = mlMap.getSource("msdl-selected-items") as GeoJSONSource;
    if (!source) return;

    if (newItem && isUnitOrEquipment(newItem)) {
      const rawGeoJson = newItem.toGeoJson();
      const geoJson = rawGeoJson as unknown as Feature<Geometry, any>;
      geoJson.properties.sidc = `sel-${newItem.sidc}`;
      geoJson.properties.label = newItem.label;
      geoJson.properties.id = newItem.objectHandle;
      source.setData(createFeatureCollection([geoJson]) as any);
    } else {
      source.setData(createFeatureCollection([]) as any);
    }
  }, [mlMap]);

  // 5. Initialize Map Layers & Sources (Run Once)
  useEffect(() => {
    if (!mlMap) return;

    const initMap = () => {
      // Create GeoJSON Data
      const featureCollection = combineSidesToJson(sides, {
        includeUnits: layerStore.showUnits,
        includeEquipment: layerStore.showEquipment,
      });

      // Add Sources
      if (!mlMap.getSource("msdl-selected-items")) {
        mlMap.addSource("msdl-selected-items", {
          type: "geojson",
          data: createFeatureCollection([]),
        });
      }

      if (!mlMap.getSource("msdl-sides")) {
        mlMap.addSource("msdl-sides", {
          type: "geojson",
          data: featureCollection as any,
          promoteId: "id",
        });
      }

      // Add Layers
      if (!mlMap.getLayer("msdl-sides")) {
        mlMap.addLayer({
          id: "msdl-sides",
          type: "symbol",
          source: "msdl-sides",
          layout: {
            "icon-image": ["case", ["==", ["get", "sidc"], ""], "10011500002201000000", ["get", "sidc"]],
            "text-font": ["Noto Sans Italic"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
            "text-size": 12,
            "icon-allow-overlap": true,
            "text-allow-overlap": false,
            "text-optional": true,
          },
        });
      }

      if (!mlMap.getLayer("msdl-selected-items")) {
        mlMap.addLayer({
          id: "msdl-selected-items",
          type: "symbol",
          source: "msdl-selected-items",
          layout: {
            "icon-image": ["case", ["==", ["get", "sidc"], ""], "10011500002201000000", ["get", "sidc"]],
            "text-font": ["Noto Sans Italic"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
            "text-size": 12,
            "icon-allow-overlap": true,
            "text-allow-overlap": true,
            "text-optional": false,
            "text-field": ["get", "label"],
          },
        });
      }

      // Handle Image Missing (MilSymbol Generation)
      const handleImageMissing = (e: any) => {
        const isSelected = e.id.startsWith("sel-");
        const symbolCode = isSelected ? e.id.slice(4) : e.id;

        const options = isSelected
          ? { outlineWidth: 20, outlineColor: "yellow" }
          : { outlineWidth: layerStore.showSymbolOutline ? 7 : 0 };
        
        const symb = new ms.Symbol(symbolCode, {
          size: layerStore.symbolSize ?? 20,
          ...options,
        });

        const { width, height } = symb.getSize();
        const data = symb
          .asCanvas(2)
          ?.getContext("2d")
          ?.getImageData(0, 0, 2 * width, 2 * height);
        
        if (data) {
          if (!mlMap.hasImage(e.id)) {
             mlMap.addImage(e.id, data, { pixelRatio: 2 });
          }
        }
      };
      mlMap.on("styleimagemissing", handleImageMissing);

      // Handle Interactions
      const handleClick = (e: MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0) return;
        if (e.features[0].geometry.type !== "Point") return;

        const activeItemId = e.features[0].properties?.id as string;
        if (!activeItemId) return;
        
        const item = msdl?.getUnitOrEquipmentById(activeItemId) ?? null;
        if(selectStore.setActiveItem) selectStore.setActiveItem(item);
        else selectStore.activeItem = item; 
      };

      const handleMouseEnter = () => {
        if (!uiStore.hoverEnabled) return;
        mlMap.getCanvas().style.cursor = "pointer";
      };

      const handleMouseLeave = () => {
        if (!uiStore.hoverEnabled) return;
        mlMap.getCanvas().style.cursor = "";
      };

      const handleContextMenu = (ev: MapMouseEvent) => {
        const features = mlMap.queryRenderedFeatures(ev.point, {
          layers: ["msdl-sides"],
        });

        const mapEvent: MapContextMenuEvent = {
          x: ev.point.x,
          y: ev.point.y,
          position: [ev.lngLat.lng, ev.lngLat.lat],
          zoomLevel: Math.round(mlMap.getZoom()),
          units: features
            ?.filter((f) => f.properties?.type === "unit")
            .map((f) => ({
              id: f.properties?.id,
              label: f.properties?.label,
              sidc: f.properties?.sidc,
            })) || [],
          equipment: features
            ?.filter((f) => f.properties?.type === "equipment")
            .map((f) => ({
              id: f.properties?.id,
              label: f.properties?.label,
              sidc: f.properties?.sidc,
            })) || [],
        };

        setMapEventData(mapEvent);
        setIsMenuOpen(true);
        ev.preventDefault();
      };

      mlMap.on("click", "msdl-sides", handleClick);
      mlMap.on("mouseenter", "msdl-sides", handleMouseEnter);
      mlMap.on("mouseleave", "msdl-sides", handleMouseLeave);
      mlMap.on("contextmenu", handleContextMenu);

      // Initial FlyTo
      setTimeout(() => {
        try {
          const center = centroid(featureCollection as any);
          mlMap.flyTo({ center: center.geometry.coordinates as [number, number], zoom: 3 });
        } catch {}
      }, 600);
      
      // Cleanup listeners on unmount (hoặc khi map đổi style mạnh)
      return () => {
         mlMap.off("styleimagemissing", handleImageMissing);
         mlMap.off("click", "msdl-sides", handleClick);
         mlMap.off("mouseenter", "msdl-sides", handleMouseEnter);
         mlMap.off("mouseleave", "msdl-sides", handleMouseLeave);
         mlMap.off("contextmenu", handleContextMenu);
      };
    };

    // Wait for map to be ready before initializing
    if (mlMap.loaded()) {
      initMap();
    } else {
      const handleLoad = () => {
        initMap();
        mlMap.off("load", handleLoad);
      };
      mlMap.on("load", handleLoad);
      
      return () => {
        mlMap.off("load", handleLoad);
      };
    }
  }, [mlMap, msdl]); // Re-run if map instance changes, but logic mostly internal

  // 6. Reactive Updates (Watchers)

  // Update Data Source
  useEffect(() => {
    const visibleSides = sides.filter((side) => layerStore.layers.has(side.objectHandle));
    const featureCollection = combineSidesToJson(visibleSides, {
      includeUnits: layerStore.showUnits,
      includeEquipment: layerStore.showEquipment,
    });
    const source = mlMap.getSource("msdl-sides") as GeoJSONSource;
    if (source) {
      source.setData(featureCollection as any);
    }
  }, [sides, layerStore.layers, layerStore.showUnits, layerStore.showEquipment, mlMap]);

  // Update Map Settings
  useEffect(() => {
    mlMap.showCollisionBoxes = mapSettings.showCollisionBoxes;
    mlMap.showPadding = mapSettings.showPadding;
    mlMap.showTileBoundaries = mapSettings.showTileBoundaries;
    mlMap.showOverdrawInspector = mapSettings.showOverdrawInspector;
  }, [
    mapSettings.showCollisionBoxes, 
    mapSettings.showPadding, 
    mapSettings.showTileBoundaries, 
    mapSettings.showOverdrawInspector, 
    mlMap
  ]);

  // Update Base Layer & Custom Tiles
  useEffect(() => {
    const tileUrl = mapLayerStore.getCustomTileUrl();
    const newStyle = getStyleForBaseLayer(mapLayerStore.baseLayer, tileUrl);
    
    let hasExecuted = false;
    
    // Handler to re-add sources and layers after style loads
    const handleStyleLoad = () => {
      if (hasExecuted) return; // Prevent double execution
      hasExecuted = true;
      
      console.log("Re-adding sources and layers after style change to:", mapLayerStore.baseLayer);
      
      // Wait a bit for style to be fully ready
      setTimeout(() => {
        // Re-create GeoJSON Data
        const featureCollection = combineSidesToJson(sides, {
          includeUnits: layerStore.showUnits,
          includeEquipment: layerStore.showEquipment,
        });

        // Re-add Sources
        if (!mlMap.getSource("msdl-selected-items")) {
          mlMap.addSource("msdl-selected-items", {
            type: "geojson",
            data: createFeatureCollection([]) as any,
          });
        }

        if (!mlMap.getSource("msdl-sides")) {
          mlMap.addSource("msdl-sides", {
            type: "geojson",
            data: featureCollection as any,
            promoteId: "id",
          });
        }

      // Re-add Layers
      if (!mlMap.getLayer("msdl-sides")) {
        mlMap.addLayer({
          id: "msdl-sides",
          type: "symbol",
          source: "msdl-sides",
          layout: {
            "icon-image": ["case", ["==", ["get", "sidc"], ""], "10011500002201000000", ["get", "sidc"]],
            "text-font": ["Noto Sans Italic"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
            "text-size": 12,
            "icon-allow-overlap": true,
            "text-allow-overlap": false,
            "text-optional": true,
          },
        });
      }

      if (!mlMap.getLayer("msdl-selected-items")) {
        mlMap.addLayer({
          id: "msdl-selected-items",
          type: "symbol",
          source: "msdl-selected-items",
          layout: {
            "icon-image": ["case", ["==", ["get", "sidc"], ""], "10011500002201000000", ["get", "sidc"]],
            "text-font": ["Noto Sans Italic"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
            "text-size": 12,
            "icon-allow-overlap": true,
            "text-allow-overlap": true,
            "text-optional": false,
            "text-field": ["get", "label"],
          },
        });
      }

      // Re-add icon anchors if enabled
      if (layerStore.showIconAnchors && !mlMap.getLayer("msdl-points")) {
        mlMap.addLayer({
          id: "msdl-points",
          type: "circle",
          source: "msdl-sides",
          paint: {
            "circle-radius": 5,
            "circle-color": "#3b4fe4",
          },
        });
      }

      // Re-apply labels if enabled
      if (layerStore.showLabels) {
        setTextField();
      }

      // Re-update active item
      if (selectStore.activeItem) {
        const item = msdl?.getUnitOrEquipmentById(selectStore.activeItem.objectHandle);
        if (item) updateActiveItem(item);
      }
      
      console.log("Finished re-adding layers");
      }, 100); // Wait 100ms for style to be ready

      // Cleanup listeners after running
      mlMap.off("styledata", handleStyleLoad);
      mlMap.off("idle", handleStyleLoad);
    };

    // Listen for multiple events to ensure it works with all base layers
    mlMap.once("styledata", handleStyleLoad);
    mlMap.once("idle", handleStyleLoad);
    
    // Fallback timeout in case events don't fire 
    const fallbackTimeout = setTimeout(() => {
      if (!hasExecuted) {
        console.log("Fallback: Re-adding layers after timeout for:", mapLayerStore.baseLayer);
        handleStyleLoad();
      }
    }, 3000); // Increased to 3 seconds
    
    // Change style
    mlMap.setStyle(newStyle);

    // Cleanup listeners
    return () => {
      clearTimeout(fallbackTimeout);
      mlMap.off("styledata", handleStyleLoad);
      mlMap.off("idle", handleStyleLoad);
    };
  }, [mapLayerStore.baseLayer, mapLayerStore.customWMS, mapLayerStore.customXYZ, mlMap]);

  // Update Text Field (Labels)
  useEffect(() => {
    setTextField();
  }, [layerStore.showLabels, setTextField]);

  // Update Icon Anchors (Points)
  useEffect(() => {
    const hasLayer = !!mlMap.getLayer("msdl-points");
    if (!layerStore.showIconAnchors) {
      if (hasLayer) mlMap.removeLayer("msdl-points");
    } else {
      if (hasLayer) return;
      if (mlMap.getSource("msdl-sides")) {
        mlMap.addLayer({
            id: "msdl-points",
            type: "circle",
            source: "msdl-sides",
            paint: {
            "circle-radius": 5,
            "circle-color": "#3b4fe4",
            },
        });
      }
    }
  }, [layerStore.showIconAnchors, mlMap]);

  // Update Area of Interest
  useEffect(() => {
    const hasLayer = !!mlMap.getLayer("msdl-area-of-interest");
    const hasSource = !!mlMap.getSource("msdl-bbox");
    const hasSidesLayer = !!mlMap.getLayer("msdl-sides");
    const areaOfInterest = msdl?.environment?.areaOfInterest?.toGeoJson();

    if (!layerStore.showAreaOfInterest || !areaOfInterest) {
      if (hasLayer) mlMap.removeLayer("msdl-area-of-interest");
      if (hasSource) mlMap.removeSource("msdl-bbox");
    } else {
      if (hasLayer) return;
      // Add Source
      if (!hasSource) {
          mlMap.addSource("msdl-bbox", {
            type: "geojson",
            data: areaOfInterest,
          });
      }
      // Add Layer
      mlMap.addLayer(
        {
          id: "msdl-area-of-interest",
          type: "line",
          source: "msdl-bbox",
          paint: {
            "line-color": "blue",
            "line-dasharray": [10, 10],
            "line-width": 2,
          },
        },
        hasSidesLayer ? "msdl-sides" : undefined
      );
    }
  }, [msdl, layerStore.showAreaOfInterest, mlMap]);

  // Clear Symbol Cache when settings change
  useEffect(() => {
    if (!mlMap.isStyleLoaded()) return;
    
    mlMap
      .listImages()
      .filter(checkIfSymbolCode)
      .forEach((i) => {
        mlMap.removeImage(i);
      });
      // Force redraw 
      mlMap.triggerRepaint();
  }, [layerStore.showSymbolOutline, layerStore.symbolSize, mlMap]);

  // Sync Active Item Selection
  useEffect(() => {
    updateActiveItem(selectStore.activeItem);
  }, [selectStore.activeItem, updateActiveItem]);

  // Check updateActiveItem when MSDL changes deeply (Refetch item ref)
  useEffect(() => {
      if (!msdl || !selectStore.activeItem) return;
      const item = msdl.getUnitOrEquipmentById(selectStore.activeItem.objectHandle);
      if (!item) return;
      updateActiveItem(item);
  }, [msdl, revision, updateActiveItem]); // Add revision to trigger update when properties change

  return (
    <>
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 border-4 border-dashed border-blue-700 z-[1000]">
          <p className="absolute bottom-1 left-2 rounded bg-white px-1 text-base tracking-tighter text-gray-800 tabular-nums shadow-md">
            {formattedPosition}
          </p>
        </div>
      )}
      
      <MapContextMenu 
        open={isMenuOpen} 
        onOpenChange={setIsMenuOpen} 
        event={mapEventData} 
      />
    </>
  );
}
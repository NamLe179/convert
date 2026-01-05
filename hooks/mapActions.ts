"use client";

import maplibregl, {
  type LngLatBoundsLike,
  type LngLatLike,
} from "maplibre-gl";
import bbox from "@turf/bbox";
import type { GeoJSON } from "geojson";
import type { PhotonSearchResult } from "@/hooks/geosearching";
import { fixExtent } from "@/lib/geoConvert";
import {
  type EquipmentItem,
  ForceSide,
  type Unit,
} from "@orbat-mapper/msdllib";
import { isForceSide, isUnitOrEquipment } from "@/lib/utils-msdl";

/**
 * Fly map to Unit / Equipment / ForceSide
 */
export function flyToItem(
  item: EquipmentItem | Unit | ForceSide,
  mlMap: maplibregl.Map,
  { zoom = 16 }: { zoom?: number } = {},
) {
  if (!mlMap) return;

  if (isUnitOrEquipment(item)) {
    const coordinates = item.location as LngLatLike | undefined;
    if (!coordinates) return;

    mlMap.flyTo({
      center: coordinates,
      zoom,
    });
    return;
  }

  if (isForceSide(item)) {
    const geoJson = item.toGeoJson({
      includeEquipment: true,
      includeUnits: true,
    }) as GeoJSON;

    const bounds = bbox(geoJson);

    // turf returns Infinity if geometry invalid
    if (bounds.some((v) => !Number.isFinite(v))) return;

    mlMap.fitBounds(bounds as LngLatBoundsLike, {
      padding: {
        top: 50,
        bottom: 50,
        left: 200,
        right: 200,
      },
    });
  }
}

/**
 * Fly map to place search result
 */
export function flyToPlace(
  item: PhotonSearchResult,
  mlMap: maplibregl.Map,
) {
  if (!mlMap) return;

  const extent = fixExtent(item.properties.extent);

  if (extent) {
    mlMap.fitBounds(extent as LngLatBoundsLike, {
      maxZoom: 15,
      duration: 1500,
    });
    return;
  }

  mlMap.flyTo({
    center: item.geometry.coordinates as LngLatLike,
    zoom: 15,
    duration: 1500,
  });
}

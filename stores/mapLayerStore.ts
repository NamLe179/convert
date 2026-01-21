import { create } from "zustand";
import { persist } from "zustand/middleware"; 
import type { StyleSpecification } from "maplibre-gl";

// 1. Cập nhật Types
export type BaseLayer = "none" | "osm" | "satellite" | "default" | "demo" | "wms" | "xyz";

export interface EnumItem<T = string> {
  value: T;
  label: string;
  layerType: "default" | "custom"; // Thêm field để phân loại
}

// 2. danh sách Providers
export const mapProviders: EnumItem<BaseLayer>[] = [
  { value: "default", label: "OpenFreeMap", layerType: "default" },
  { value: "osm", label: "OpenStreetMap (raster)", layerType: "default" },
  { value: "satellite", label: "ESRI World imagery (raster)", layerType: "default" },
  { value: "demo", label: "Demo tiles", layerType: "default" },
  { value: "wms", label: "Custom WMS", layerType: "custom" },
  { value: "xyz", label: "Custom XYZ", layerType: "custom" },
];

// 3. Logic lấy Style cho Custom Layer (WMS/XYZ)
export function getCustomStyleForBaseLayer(
  baseLayer: BaseLayer,
  tileUrl: string,
): string | StyleSpecification {
  switch (baseLayer) {
    case "wms":
      return {
        version: 8,
        sources: {
          wms: {
            type: "raster",
            tiles: [tileUrl],
            tileSize: 256,
            attribution: `Custom WMS (${tileUrl})`,
          },
        },
        layers: [
          {
            id: "wms",
            type: "raster",
            source: "wms",
          },
        ],
      };
    case "xyz":
      return {
        version: 8,
        sources: {
          xyz: {
            type: "raster",
            tiles: [tileUrl],
            tileSize: 256,
            attribution: `Custom XYZ (${tileUrl})`,
          },
        },
        layers: [
          {
            id: "xyz",
            type: "raster",
            source: "xyz",
          },
        ],
      };
    default:
      return "https://tiles.openfreemap.org/styles/positron";
  }
}

// 4. Logic lấy Style mặc định
export function getDefaultStyleForBaseLayer(baseLayer?: BaseLayer): string | StyleSpecification {
  switch (baseLayer) {
    case "osm":
      return {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      };
    case "satellite":
      return {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
          },
        ],
      };
    case "demo":
      return "https://demotiles.maplibre.org/style.json";
    default:
      return "https://tiles.openfreemap.org/styles/positron";
  }
}

// 5. Hàm lấy Style dựa trên baseLayer và tileUrl
export function getStyleForBaseLayer(
  baseLayer?: BaseLayer,
  tileUrl?: string,
): string | StyleSpecification {
  const mapProvider = mapProviders.find((mp) => mp.value === baseLayer);
  
  if (baseLayer && tileUrl && mapProvider?.layerType === "custom") {
    return getCustomStyleForBaseLayer(baseLayer, tileUrl);
  } else {
    return getDefaultStyleForBaseLayer(baseLayer);
  }
}

// 6. Định nghĩa State và Actions cho Store
interface MapLayerState {
  baseLayer: BaseLayer;
  customWMS: string;
  customXYZ: string;
  
  setBaseLayer: (layer: BaseLayer) => void;
  setCustomWMSUrl: (wmsUrl: string) => void;
  setCustomXYZUrl: (xyzUrl: string) => void;
  getCustomTileUrl: () => string;
}

// 7. Tạo Store với LocalStorage
export const useMapLayerStore = create<MapLayerState>()(
  persist(
    (set, get) => ({
      baseLayer: "default",
      
      // Giá trị mặc định giống bản Vue
      customWMS: "https://ows.terrestris.de/osm/service?service=WMS&request=GetMap&version=1.1.1&layers=TOPO-WMS%2COSM-Overlay-WMS&styles=&format=image%2Fpng&transparent=true&info_format=text%2Fhtml&tiled=false&srs=EPSG:3857&bbox={bbox-epsg-3857}&width=256&height=256",
      customXYZ: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

      setBaseLayer: (layer) => set({ baseLayer: layer }),
      
      setCustomWMSUrl: (wmsUrl) => set({ customWMS: wmsUrl }),
      
      setCustomXYZUrl: (xyzUrl) => set({ customXYZ: xyzUrl }),
      
      getCustomTileUrl: () => {
        const state = get();
        return state.baseLayer === "wms" ? state.customWMS : state.customXYZ;
      },
    }),
    {
      name: "map-layer-settings", // Tên key trong localStorage
    }
  )
);
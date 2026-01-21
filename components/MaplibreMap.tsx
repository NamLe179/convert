"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Import Store và helper
import { useMapLayerStore, getStyleForBaseLayer } from "@/stores/mapLayerStore";

interface Props {
  onReady?: (map: MlMap) => void;
}

export default function MaplibreMap({ onReady }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MlMap | null>(null);

  // 1. Lấy baseLayer hiện tại từ Store
  const baseLayer = useMapLayerStore((state) => state.baseLayer);

  // Effect 1: Khởi tạo Map (Chạy 1 lần duy nhất)
  useEffect(() => {
    if (mapInstance.current) return;
    if (!mapContainerRef.current) return;

    // 2. Truyền baseLayer vào hàm getStyleForBaseLayer
    const map = new MlMap({
      container: mapContainerRef.current,
      style: getStyleForBaseLayer(baseLayer),
      center: [0, 0],
      zoom: 3,
    });

    map.addControl(new maplibregl.GlobeControl());
    
    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true,
      })
    );

    map.on("style.load", () => {
      try {
        map.setProjection({
          type: "globe",
        });
      } catch (e) {
        console.warn("Projection set failed or style not ready", e);
      }
    });

    map.on("load", () => {
      if (onReady) {
        onReady(map);
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []); // Dependency rỗng để chỉ khởi tạo 1 lần

  // Effect 2: Cập nhật Style khi baseLayer trong store thay đổi (Reactive)
  useEffect(() => {
    if (mapInstance.current) {
      const newStyle = getStyleForBaseLayer(baseLayer);
      mapInstance.current.setStyle(newStyle);
    }
  }, [baseLayer]); // Chạy lại khi baseLayer thay đổi

  return (
    <div 
      ref={mapContainerRef} 
      className="h-full w-full relative" 
    />
  );
}
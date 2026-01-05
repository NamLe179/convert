"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import type { Position } from "geojson";
import { useUIStore } from "@/stores/uiStore";

/**
 * Options
 */
export interface UseGetMapLocationOptions {
  cancelOnClickOutside?: boolean;
  stopPropagationOnClickOutside?: boolean;
  changeCursor?: boolean;
}

/**
 * Return type
 */
export interface UseGetMapLocationReturn {
  isActive: boolean;
  start: () => void;
  cancel: () => void;
  onStart: (cb: () => void) => () => void;
  onGetLocation: (cb: (pos: Position) => void) => () => void;
  onCancel: (cb: () => void) => () => void;
}

export function useGetMapLocation(
  map: MapLibreMap,
  options: UseGetMapLocationOptions = {},
): UseGetMapLocationReturn {
  const {
    cancelOnClickOutside = true,
    stopPropagationOnClickOutside = true,
    changeCursor = true,
  } = options;

  const [isActive, setIsActive] = useState(false);
  const uiStore = useUIStore();

  const prevCursorRef = useRef<string>(
    map.getCanvas().style.cursor || "",
  );

  const clickListenerRef = useRef<((e: MapMouseEvent) => void) | null>(null);
  const escListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const clickOutsideListenerRef = useRef<((e: MouseEvent) => void) | null>(null);

  /** --------------------
   * Simple event hooks
   * -------------------*/
  const onStartCbs = useRef(new Set<() => void>());
  const onCancelCbs = useRef(new Set<() => void>());
  const onGetLocationCbs = useRef(new Set<(pos: Position) => void>());

  const triggerStart = () => onStartCbs.current.forEach((cb) => cb());
  const triggerCancel = () => onCancelCbs.current.forEach((cb) => cb());
  const triggerGetLocation = (pos: Position) =>
    onGetLocationCbs.current.forEach((cb) => cb(pos));

  /** --------------------
   * Cleanup
   * -------------------*/
  const cleanUp = useCallback(() => {
    const canvas = map.getCanvas();

    if (changeCursor) {
      uiStore.hoverEnabled = true;
      canvas.style.cursor = prevCursorRef.current;
    }

    setIsActive(false);

    if (clickListenerRef.current) {
      map.off("click", clickListenerRef.current);
      clickListenerRef.current = null;
    }

    if (escListenerRef.current) {
      document.removeEventListener("keydown", escListenerRef.current);
      escListenerRef.current = null;
    }

    if (clickOutsideListenerRef.current) {
      document.removeEventListener("mousedown", clickOutsideListenerRef.current);
      clickOutsideListenerRef.current = null;
    }
  }, [map, changeCursor, uiStore]);

  /** --------------------
   * Cancel
   * -------------------*/
  const cancel = useCallback(() => {
    cleanUp();
    triggerCancel();
  }, [cleanUp]);

  /** --------------------
   * Start
   * -------------------*/
  const start = useCallback(() => {
    setIsActive(true);
    triggerStart();

    const canvas = map.getCanvas();

    if (changeCursor) {
      uiStore.hoverEnabled = false;
      prevCursorRef.current = canvas.style.cursor;
      canvas.style.cursor = "crosshair";
    }

    if (cancelOnClickOutside) {
      clickOutsideListenerRef.current = (e: MouseEvent) => {
        if (!map.getContainer().contains(e.target as Node)) {
          if (stopPropagationOnClickOutside) e.stopPropagation();
          cancel();
        }
      };
      document.addEventListener("mousedown", clickOutsideListenerRef.current);
    }

    escListenerRef.current = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    document.addEventListener("keydown", escListenerRef.current);

    clickListenerRef.current = (event: MapMouseEvent) => {
      event.originalEvent.stopPropagation();
      cleanUp();
      triggerGetLocation([event.lngLat.lng, event.lngLat.lat]);
    };

    map.once("click", clickListenerRef.current);
  }, [
    map,
    cancel,
    cleanUp,
    changeCursor,
    cancelOnClickOutside,
    stopPropagationOnClickOutside,
    uiStore,
  ]);

  /** --------------------
   * Unmount
   * -------------------*/
  useEffect(() => {
    return () => cleanUp();
  }, [cleanUp]);

  /** --------------------
   * Public API
   * -------------------*/
  return {
    isActive,
    start,
    cancel,
    onStart: (cb) => {
      onStartCbs.current.add(cb);
      return () => onStartCbs.current.delete(cb);
    },
    onGetLocation: (cb) => {
      onGetLocationCbs.current.add(cb);
      return () => onGetLocationCbs.current.delete(cb);
    },
    onCancel: (cb) => {
      onCancelCbs.current.add(cb);
      return () => onCancelCbs.current.delete(cb);
    },
  };
}

"use client";

import { useEffect, useState, type RefObject } from "react";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import {
  containsFiles,
  getFiles,
} from "@atlaskit/pragmatic-drag-and-drop/external/file";

export interface UseFileDropZoneReturn {
  isOverDropZone: boolean;
}

export function useFileDropZone(
  target: RefObject<HTMLElement | null>,
  onDropHandler?: (files: File[] | null) => void,
): UseFileDropZoneReturn {
  const [isOverDropZone, setIsOverDropZone] = useState(false);

  useEffect(() => {
    if (!target.current) return;

    const cleanup = dropTargetForExternal({
      element: target.current,
      canDrop: containsFiles,
      onDragEnter: () => setIsOverDropZone(true),
      onDragLeave: () => setIsOverDropZone(false),
      onDrop({ source }) {
        const files = getFiles({ source });
        setIsOverDropZone(false);
        onDropHandler?.(files.length === 0 ? null : files);
      },
    });

    return () => {
      cleanup();
    };
  }, [target, onDropHandler]);

  return {
    isOverDropZone,
  };
}

"use client";

import React, { useMemo, useCallback } from "react";
import TreeItemDND from "./TreeItemDND"; 
import { useScenarioStore } from "@/stores/scenarioStore";
import { useExpandedStore } from "@/stores/expandedStore";
import { mapItem } from "@/components/orbat/utils";
import type { OrbatTreeItem } from "@/components/orbat/types";

interface Props {
  sideObjectHandle: string;
}

export interface FlattenedItem<T> {
  item: T;
  _id: string;
  level: number;
  index: number;
  hasChildren: boolean;
  childrenCount: number;
  parentItem?: FlattenedItem<T>;
  value: T; 
}

export default function OrbatTree({ sideObjectHandle }: Props) {
  const { msdl } = useScenarioStore();
  const revision = useScenarioStore((state) => state.revision);
  const expandedStore = useExpandedStore();

  // 1. Lấy dữ liệu gốc 
  const rootItems = useMemo(() => {
    const side = msdl?.getForceSideById(sideObjectHandle);
    if (!side) return [];
    // Combine subordinates & equipment
    return [...side.subordinates, ...side.equipment].map(mapItem);
  }, [msdl, sideObjectHandle, revision]);

  // 2. Xử lý logic Expanded 
  // Lấy danh sách các ID đang mở của Side hiện tại
  const expandedIds = useMemo(() => {
    return expandedStore.expandedItems.get(sideObjectHandle) || [];
  }, [expandedStore.expandedItems, sideObjectHandle]);

  // Hàm toggle (được truyền xuống con)
  const handleToggle = useCallback((itemId: string) => {
    const currentExpanded = expandedStore.expandedItems.get(sideObjectHandle) || [];
    let newExpanded: string[];

    if (currentExpanded.includes(itemId)) {
      newExpanded = currentExpanded.filter((id) => id !== itemId);
    } else {
      newExpanded = [...currentExpanded, itemId];
    }

    const newMap = new Map(expandedStore.expandedItems);
    newMap.set(sideObjectHandle, newExpanded);
    expandedStore.setExpandedItems(newMap); 
    
  }, [expandedStore, sideObjectHandle]);

  // 3. Flatten Tree Logic 
  const flattenedItems = useMemo(() => {
    const result: FlattenedItem<OrbatTreeItem>[] = [];

    const flatten = (
      items: OrbatTreeItem[],
      level: number,
      parent?: FlattenedItem<OrbatTreeItem>
    ) => {
      items.forEach((item, index) => {
        const children = [
          ...(item.subordinates ?? []), 
          ...(item.equipment ?? [])
        ].map(mapItem);
        
        const hasChildren = children.length > 0;
        const isExpanded = expandedIds.includes(item.objectHandle);

        const flattenedNode: FlattenedItem<OrbatTreeItem> = {
          item: item,
          value: item, 
          _id: item.objectHandle, 
          level: level,
          index: index,
          hasChildren: hasChildren,
          childrenCount: children.length,
          parentItem: parent,
        };

        result.push(flattenedNode);

        // Đệ quy nếu đang expanded
        if (hasChildren && isExpanded) {
          flatten(children, level + 1, flattenedNode);
        }
      });
    };

    flatten(rootItems, 0);
    return result;
  }, [rootItems, expandedIds]);

  return (
    <div className="flex w-full">
      <div className="list-none select-none rounded-md p-2 text-sm font-medium w-full">
        {flattenedItems.map((item) => (
          <TreeItemDND
            key={item._id}
            item={item}
            // Truyền trạng thái mở rộng và hàm toggle xuống component con
            isExpanded={expandedIds.includes(item._id)}
            onToggle={() => handleToggle(item._id)}
          />
        ))}
      </div>
    </div>
  );
}
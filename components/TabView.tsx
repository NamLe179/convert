"use client";

import React, { useState, useEffect, ReactNode, isValidElement, ReactElement } from "react";
import { cn } from "@/lib/utils";
import { type TabItemProps } from "@/components/TabItem"; 

interface TabViewProps {
  currentTab?: number;
  onCurrentTabChange?: (index: number) => void; // Tương đương emit('update:current-tab')
  extraClass?: string;
  tabClass?: string; // Class áp dụng cho tất cả nội dung tab con
  gap?: string;
  children: ReactNode;
  extraContent?: ReactNode; // Tương đương slot name="extra"
}

export default function TabView({
  currentTab = 0,
  onCurrentTabChange,
  extraClass,
  tabClass,
  gap = "gap-x-8",
  children,
  extraContent,
}: TabViewProps) {
  // State quản lý tab hiện tại
  const [selectedIndex, setSelectedIndex] = useState(currentTab);

  // Sync prop currentTab vào state (giống watch props.currentTab trong Vue)
  useEffect(() => {
    setSelectedIndex(currentTab);
  }, [currentTab]);

  const handleTabClick = (index: number) => {
    setSelectedIndex(index);
    if (onCurrentTabChange) {
      onCurrentTabChange(index);
    }
  };

  // Lọc children để đảm bảo chỉ xử lý các React Element hợp lệ
  const tabs = React.Children.toArray(children).filter((child) =>
    isValidElement(child)
  ) as ReactElement<TabItemProps>[];

  return (
    <div className="flex h-full flex-col">
      {/* Header Section */}
      <header className="shrink-0">
        <div
          className={cn(
            "border-b border-gray-300 dark:border-gray-400",
            extraClass
          )}
        >
          <div className="flex justify-between">
            {/* Navigation Tabs */}
            <nav className={cn("-mb-px flex", gap)} aria-label="Tabs">
              {tabs.map((tab, index) => {
                const isSelected = index === selectedIndex;
                const label = tab.props.label; // Đọc prop label từ con

                return (
                  <button
                    key={index}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors",
                      isSelected
                        ? "border-army text-army dark:border-amber-600 dark:text-amber-600" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
                    )}
                    aria-current={isSelected ? "page" : undefined}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Extra Slot Content */}
            <div className="">{extraContent}</div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <div className="flex-auto overflow-y-auto">
        {tabs.map((tab, index) => {
          // Clone element con để tự động truyền prop isActive và className xuống
          return React.cloneElement(tab, {
            isActive: index === selectedIndex,
            // Merge class từ TabView (tabClass) và class riêng của TabItem
            className: cn(tab.props.className, tabClass), 
            key: index,
          });
        })}
      </div>
    </div>
  );
}
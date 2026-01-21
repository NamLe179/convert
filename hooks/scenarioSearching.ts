"use client";

import { useCallback, useMemo } from "react";
import { useScenarioStore } from "@/stores/scenarioStore";
import fuzzysort from "fuzzysort";
import { groupBy, htmlTagEscape } from "@/lib/utils-msdl";
import type { ScenarioAction } from "@/hooks/scenarioActions";

import {
  Download,
  Grid3X3,
  ListTree,
  Upload,
} from "lucide-react";

import type { ComponentType } from "react";

/* =====================
 * Types
 * ===================== */

export type UnitSearchResult = {
  label: string;
  sidc: string;
  id: string;
  category: "Units";
  score: number;
  highlight: string;
};

export type EquipmentSearchResult = {
  label: string;
  sidc: string;
  id: string;
  category: "Equipment";
  score: number;
  highlight: string;
};

export type ActionItem = {
  action: ScenarioAction;
  label: string;
  icon?: ComponentType<any>;
  shortcut?: string;
};

export type ActionSearchResult = ActionItem & {
  id: string;
  category: "Actions";
  score: number;
  highlight: string;
};

/* =====================
 * Static action list
 * ===================== */

const actionItems: ActionItem[] = [
  {
    action: "LocateInOrbat",
    label: "Locate active item in ORBAT",
    shortcut: "l",
    icon: ListTree,
  },
  {
    action: "CollapseOrbat",
    label: "Collapse all ORBAT items",
    icon: ListTree,
  },
  {
    action: "CreateNewMSDL",
    label: "Create new MSDL scenario ...",
  },
  {
    action: "LoadMSDLFromFile",
    label: "Load MSDL scenario from file ...",
    icon: Upload,
  },
  {
    action: "DownloadMSDL",
    label: "Download MSDL",
    icon: Download,
  },
  {
    action: "ExportKML",
    label: "Export scenario as KMZ",
    icon: Download,
  },
  {
    action: "LoadFromUrl",
    label: "Load scenario from URL ...",
    icon: Upload,
  },
  {
    action: "EditAssociations",
    label: "Show and edit associations ...",
    icon: Grid3X3,
  },
];

/* =====================
 * Hook
 * ===================== */

export function useScenarioSearch() {
  const msdl = useScenarioStore((s) => s.msdl);

  const searchUnits = useCallback((query: string): UnitSearchResult[] => {
    const q = query.trim();
    if (!q || !msdl) return [];

    const hits = fuzzysort.go(
      q,
      Object.values(msdl.unitMap ?? {}),
      {
        key: ["label"],
        limit: 100,
      },
    );

    return hits.slice(0, 7).map((u) => ({
      label: u.obj.label,
      sidc: u.obj.sidc,
      id: u.obj.objectHandle,
      category: "Units",
      score: u.score,
      highlight:
        fuzzysort.highlight({
          ...u,
          target: htmlTagEscape(u.target),
        }) ?? "",
    }));
  }, [msdl]);

  const searchEquipmentItems = useCallback((query: string): EquipmentSearchResult[] => {
    const q = query.trim();
    if (!q || !msdl) return [];

    const hits = fuzzysort.go(
      q,
      Object.values(msdl.equipmentMap ?? {}),
      {
        key: ["label"],
        limit: 100,
      },
    );

    return hits.slice(0, 5).map((u) => ({
      label: u.obj.label,
      sidc: u.obj.sidc,
      id: u.obj.objectHandle,
      category: "Equipment",
      score: u.score,
      highlight:
        fuzzysort.highlight({
          ...u,
          target: htmlTagEscape(u.target),
        }) ?? "",
    }));
  }, [msdl]);

  const searchActions = useCallback((query: string): ActionSearchResult[] => {
    const q = query.trim();
    if (!q) return [];

    const hits = fuzzysort.go(q, actionItems, {
      key: ["label"],
    });

    return hits.map((u) => ({
      id: u.obj.action,
      action: u.obj.action,
      label: u.obj.label,
      icon: u.obj.icon,
      category: "Actions",
      score: u.score,
      highlight:
        fuzzysort.highlight({
          ...u,
          target: htmlTagEscape(u.target),
        }) ?? "",
    }));
  }, []);

  const search = useCallback((query: string) => {
    const unitHits = searchUnits(query);
    const equipmentHits = searchEquipmentItems(query);
    const actionHits = searchActions(query);

    return groupBy(
      combineHits([unitHits, equipmentHits, actionHits]),
      "category",
    );
  }, [searchUnits, searchEquipmentItems, searchActions]);

  const memoizedActionItems = useMemo(() => 
    actionItems.map(
      (a): ActionSearchResult => ({
        ...a,
        id: a.action,
        category: "Actions",
        score: 0,
        highlight: "",
      }),
    ), []);

  return {
    search,
    searchActions,
    actionItems: memoizedActionItems,
  };
}

/* =====================
 * Utils
 * ===================== */

function combineHits(
  hits: (
    | UnitSearchResult[]
    | EquipmentSearchResult[]
    | ActionSearchResult[]
  )[],
) {
  const combinedHits = hits.sort((a, b) => {
    const scoreA = a[0]?.score ?? 1000;
    const scoreB = b[0]?.score ?? 1000;
    return scoreB - scoreA;
  });

  return combinedHits.flat();
}

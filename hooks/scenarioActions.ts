"use client";

import { useCallback } from "react";
import {
  downloadAsKMZ,
  downloadAsMSDL,
  loadMSDLFromFile,
} from "@/lib/io";

import { useScenarioStore } from "@/stores/scenarioStore";
import { useDialogStore } from "@/stores/dialogStore";
import { useExpandedStore } from "@/stores/expandedStore";
import { useSelectStore } from "@/stores/selectStore";

import { toast } from "sonner";

import {
  ForceSide,
  type EquipmentItem,
  type Unit,
} from "@orbat-mapper/msdllib";

import { triggerFlash } from "@/lib/utils-msdl";
import { flyToItem } from "@/hooks/mapActions";
import type maplibregl from "maplibre-gl";

/* =====================
 * Types
 * ===================== */

export type ScenarioAction =
  | "CreateNewMSDL"
  | "LoadMSDLFromFile"
  | "DownloadMSDL"
  | "ExportKML"
  | "LoadFromUrl"
  | "EditAssociations"
  | "LocateInOrbat"
  | "CollapseOrbat"
  | "ZoomToActiveItem";

/* =====================
 * Hook
 * ===================== */

export function useScenarioActions(mlMap?: maplibregl.Map) {
  const msdl = useScenarioStore((state) => state.msdl);
  const loadScenario = useScenarioStore((state) => state.loadScenario);
  
  const setCreateMSDLDialog = useDialogStore((state) => state.setCreateMSDLDialog);
  const setUrlDialog = useDialogStore((state) => state.setUrlDialog);
  const setAssociationDialog = useDialogStore((state) => state.setAssociationDialog);
  
  const activeItem = useSelectStore((state) => state.activeItem);
  
  const openSideItems = useExpandedStore((state) => state.openSideItems);
  const expandedItems = useExpandedStore((state) => state.expandedItems);
  const setOpenSideItems = useExpandedStore((state) => state.setOpenSideItems);
  const setExpandedItems = useExpandedStore((state) => state.setExpandedItems);

  const dispatchAction = useCallback(async (action: ScenarioAction) => {
    switch (action) {
      case "CreateNewMSDL": {
        setCreateMSDLDialog(true);
        break;
      }

      case "DownloadMSDL": {
        if (!msdl) return;

        const res = await downloadAsMSDL(msdl);
        if (res?.name) {
          toast.success(`Scenario downloaded as "${res.name}"`);
        }
        break;
      }

      case "ExportKML": {
        if (!msdl) return;

        const kmzRes = await downloadAsKMZ(msdl);
        if (kmzRes?.name) {
          toast.success(`Scenario exported as "${kmzRes.name}"`);
        } else if (kmzRes !== undefined) {
          toast.success("Scenario exported as KMZ");
        }
        break;
      }

      case "LoadMSDLFromFile": {
        try {
          const scn = await loadMSDLFromFile();
          loadScenario(scn);
          toast.success(`Scenario "${scn.scenarioId.name}" loaded`);
        } catch (e) {
          console.error(e);
        }
        break;
      }

      case "LoadFromUrl": {
        setUrlDialog(true);
        break;
      }

      case "EditAssociations": {
        setAssociationDialog(true);
        break;
      }

      case "LocateInOrbat": {
        if (!msdl || !activeItem) return;

        const { forceSide, hierarchy } =
          msdl.getItemHierarchy(activeItem, {
            includeItem: true,
          });

        const sideToOpen = forceSide[0];
        if (
          sideToOpen &&
          !openSideItems.includes(
            sideToOpen.objectHandle,
          )
        ) {
          setOpenSideItems([...openSideItems, sideToOpen.objectHandle]);
        }

        const expanded = new Set(
          expandedItems.get(
            sideToOpen.objectHandle,
          ) ?? [],
        );

        for (const item of hierarchy) {
          if (item instanceof ForceSide) continue;
          expanded.add(item.objectHandle);
        }

        const newExpandedItems = new Map(expandedItems);
        newExpandedItems.set(
          sideToOpen.objectHandle,
          [...expanded],
        );
        setExpandedItems(newExpandedItems);

        // wait for DOM update
        setTimeout(() => {
          const el = document.getElementById(
            `oi-${activeItem?.objectHandle}`,
          );
          if (el) {
            el.scrollIntoView({
              behavior: "auto",
              block: "center",
            });
            triggerFlash(el);
          } else {
            console.warn(
              `Element oi-${activeItem?.objectHandle} not found`,
            );
          }
        }, 250);

        break;
      }

      case "CollapseOrbat": {
        setOpenSideItems([]);
        setExpandedItems(new Map());
        break;
      }

      case "ZoomToActiveItem": {
        if (!mlMap || !msdl || !activeItem) return;
        flyToItem(activeItem, mlMap);
        break;
      }

      default: {
        console.error(`Unknown action: ${action}`);
      }
    }
  }, [msdl, loadScenario, setCreateMSDLDialog, setUrlDialog, setAssociationDialog, activeItem, openSideItems, expandedItems, setOpenSideItems, setExpandedItems, mlMap]);

  return { dispatchAction };
}

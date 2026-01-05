"use client";

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
  const { msdl, loadScenario } = useScenarioStore();
  const dialogStore = useDialogStore();
  const expandedStore = useExpandedStore();
  const selectStore = useSelectStore();

  const dispatchAction = async (action: ScenarioAction) => {
    switch (action) {
      case "CreateNewMSDL": {
        dialogStore.setCreateMSDLDialog(true);
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
        dialogStore.setUrlDialog(true);
        break;
      }

      case "EditAssociations": {
        dialogStore.setAssociationDialog(true);
        break;
      }

      case "LocateInOrbat": {
        if (!msdl || !selectStore.activeItem) return;

        const { forceSide, hierarchy } =
          msdl.getItemHierarchy(selectStore.activeItem, {
            includeItem: true,
          });

        const sideToOpen = forceSide[0];
        if (
          sideToOpen &&
          !expandedStore.openSideItems.includes(
            sideToOpen.objectHandle,
          )
        ) {
          expandedStore.openSideItems.push(
            sideToOpen.objectHandle,
          );
        }

        const expanded = new Set(
          expandedStore.expandedItems.get(
            sideToOpen.objectHandle,
          ) ?? [],
        );

        for (const item of hierarchy) {
          if (item instanceof ForceSide) continue;
          expanded.add(item.objectHandle);
        }

        expandedStore.expandedItems.set(
          sideToOpen.objectHandle,
          [...expanded],
        );

        // wait for DOM update
        setTimeout(() => {
          const el = document.getElementById(
            `oi-${selectStore.activeItem?.objectHandle}`,
          );
          if (el) {
            el.scrollIntoView({
              behavior: "auto",
              block: "center",
            });
            triggerFlash(el);
          } else {
            console.warn(
              `Element oi-${selectStore.activeItem?.objectHandle} not found`,
            );
          }
        }, 250);

        break;
      }

      case "CollapseOrbat": {
        expandedStore.openSideItems = [];
        expandedStore.expandedItems.clear();
        break;
      }

      case "ZoomToActiveItem": {
        if (!mlMap || !msdl || !selectStore.activeItem) return;
        flyToItem(selectStore.activeItem, mlMap);
        break;
      }

      default: {
        console.error(`Unknown action: ${action}`);
      }
    }
  };

  return { dispatchAction };
}

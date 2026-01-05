"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SymbolItem, SymbolValue, NormalizedNode } from "@/symbology/types";
import {
  statusValuesB,
  dimensionValuesAPP6B,
  dimensionValues2525B,
  dimensionValues2525C,
  HQTFDummyValuesB,
  echelonValuesB,
  mobilityValuesB,
  towedArrayValuesB,
  installationModifiersB,
} from "@/symbology/valuesB";
import { SidcB } from "@/symbology/sidc";
import { useSymbologyDataAdapter } from "@/hooks/symbolDatasetAdapter";
import { useScenarioStore } from "@/stores/scenarioStore";
import { SymbologyStandard } from "@orbat-mapper/msdllib/dist/lib/enums";
import { toast } from "sonner";

/* =====================
 * Global symbology state
 * ===================== */

let cachedSymbology: NormalizedNode[] | undefined;
let cachedStandard: SymbologyStandard | undefined;

/* =====================
 * useSymbologyData
 * ===================== */

export function useSymbologyData() {
  const msdl = useScenarioStore((s) => s.msdl);
  const symbologyStandard = msdl?.msdlOptions.standardName;
  const { normalizeRevB } = useSymbologyDataAdapter();

  const [symbology, setSymbology] = useState<NormalizedNode[] | undefined>(
    cachedSymbology,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoaded(false);

    try {
      if (symbologyStandard === "NATO_APP") {
        const { app6b } = await import("@/symbology/standards/app6b");
        cachedSymbology = normalizeRevB(app6b);
        cachedStandard = "NATO_APP";
      } else if (symbologyStandard === "MILSTD_2525B") {
        const { ms2525b } = await import("@/symbology/standards/milstd2525b");
        cachedSymbology = normalizeRevB(ms2525b);
        cachedStandard = "MILSTD_2525B";
      } else if (symbologyStandard === "MILSTD_2525C") {
        const { ms2525c } = await import("@/symbology/standards/milstd2525c");
        cachedSymbology = normalizeRevB(ms2525c);
        cachedStandard = "MILSTD_2525C";
      } else {
        toast.warning("Symbology Standard not recognized");
        throw new Error("Symbology Standard not recognized");
      }

      setSymbology(cachedSymbology);
      setIsLoaded(true);
    } catch (e) {
      console.error(e);
    }
  }, [normalizeRevB, symbologyStandard]);

  return {
    symbology,
    isLoaded,
    loadData,
    currentSymbologyStandard: cachedStandard,
  };
}

/* =====================
 * useSymbolValues
 * ===================== */

function useSymbolValues(sidc: string) {
  const sidcRef = useRef(new SidcB(sidc));

  const [codingSchemeValue, setCodingScheme] = useState(sidcRef.current.codingScheme);
  const [affiliationValue, setAffiliation] = useState(sidcRef.current.affiliation);
  const [battleDimensionValue, setBattleDimension] = useState(
    sidcRef.current.battleDimension,
  );
  const [statusValue, setStatus] = useState(sidcRef.current.status);
  const [functionIdValue, setFunctionId] = useState(sidcRef.current.functionId);
  const [contextValue, setContext] = useState(sidcRef.current.context);
  const [modifier1Value, setModifier1] = useState(sidcRef.current.modifier1);
  const [modifier2Value, setModifier2] = useState(sidcRef.current.modifier2);
  const [echelonValue, setEchelon] = useState(sidcRef.current.echelon);

  const setValues = useCallback((value: string) => {
    const s = new SidcB(value);
    setCodingScheme(s.codingScheme);
    setAffiliation(s.affiliation);
    setBattleDimension(s.battleDimension);
    setStatus(s.status);
    setFunctionId(s.functionId);
    setModifier1(s.modifier1);
    setModifier2(s.modifier2);
    setEchelon(s.echelon);
    setContext(s.context);
  }, []);

  useEffect(() => {
    setValues(sidc);
  }, [sidc, setValues]);

  const csidc = useMemo(
    () =>
      codingSchemeValue +
      affiliationValue +
      battleDimensionValue +
      statusValue +
      functionIdValue +
      modifier1Value +
      modifier2Value +
      echelonValue +
      contextValue +
      "-",
    [
      codingSchemeValue,
      affiliationValue,
      battleDimensionValue,
      statusValue,
      functionIdValue,
      modifier1Value,
      modifier2Value,
      echelonValue,
      contextValue,
    ],
  );

  return {
    codingSchemeValue,
    affiliationValue,
    battleDimensionValue,
    statusValue,
    functionIdValue,
    contextValue,
    modifier1Value,
    modifier2Value,
    echelonValue,
    csidc,
    setValues,
  };
}

/* =====================
 * useSymbolItems
 * ===================== */

export function useSymbolItems(sidc: string) {
  const symbolValues = useSymbolValues(sidc);
  const { symbology, isLoaded, loadData, currentSymbologyStandard } =
    useSymbologyData();

  const {
    affiliationValue,
    codingSchemeValue,
    battleDimensionValue,
    statusValue,
    functionIdValue,
    modifier1Value,
    modifier2Value,
  } = symbolValues;

  const battleDimensionItems = useMemo<SymbolItem[]>(() => {
    if (!symbology) return [];

    let values: SymbolValue[] = [];
    if (currentSymbologyStandard === "NATO_APP") values = dimensionValuesAPP6B;
    else if (currentSymbologyStandard === "MILSTD_2525B") values = dimensionValues2525B;
    else if (currentSymbologyStandard === "MILSTD_2525C") values = dimensionValues2525C;

    return values.map(({ code, text }) => ({
      code,
      text,
      sidc: code[0] + affiliationValue + code.slice(2, 11) + "----",
    }));
  }, [symbology, currentSymbologyStandard, affiliationValue]);

  const statusItems = useMemo<SymbolItem[]>(() => {
    if (!symbology) return [];

    const modifier = isGroundInstallation() ? "H" : "-";

    return statusValuesB.map(({ code, text }) => ({
      code,
      text,
      sidc:
        codingSchemeValue +
        affiliationValue +
        battleDimensionValue +
        code +
        functionIdValue +
        modifier +
        "----",
    }));
  }, [
    symbology,
    codingSchemeValue,
    affiliationValue,
    battleDimensionValue,
    functionIdValue,
  ]);

  const echelonItems = useMemo<SymbolItem[]>(() => {
    if (!symbology) return [];

    let values: SymbolValue[];
    if (isGroundUnit() || isSOF()) values = echelonValuesB;
    else if (isGroundEquipment()) values = mobilityValuesB;
    else if (isGroundInstallation()) values = installationModifiersB;
    else if (isSeaSurface() || isSeaSubsurface()) values = towedArrayValuesB;
    else values = [{ code: "-", text: "Unspecified" }];

    return values.map(({ code, text }) => ({
      code,
      text,
      sidc:
        codingSchemeValue +
        affiliationValue +
        battleDimensionValue +
        statusValue +
        functionIdValue +
        modifier1Value +
        code +
        "---",
    }));
  }, [
    symbology,
    codingSchemeValue,
    affiliationValue,
    battleDimensionValue,
    statusValue,
    functionIdValue,
    modifier1Value,
  ]);

  const hqtfdItems = useMemo<SymbolItem[]>(() => {
    if (!symbology) return [];

    const values =
      isGroundEquipment() ||
      isGroundInstallation() ||
      isSeaSurface() ||
      isSeaSubsurface() ||
      isGraphics()
        ? [{ code: modifier1Value, text: "Not applicable" }]
        : HQTFDummyValuesB;

    return values.map(({ code, text }) => ({
      code,
      text,
      sidc:
        codingSchemeValue +
        affiliationValue +
        battleDimensionValue +
        statusValue +
        functionIdValue +
        code +
        modifier2Value +
        "---",
    }));
  }, [
    symbology,
    codingSchemeValue,
    affiliationValue,
    battleDimensionValue,
    statusValue,
    functionIdValue,
    modifier1Value,
    modifier2Value,
  ]);

  function isGroundUnit() {
    return (
      codingSchemeValue === "S" &&
      battleDimensionValue === "G" &&
      (functionIdValue[0] === "U" || functionIdValue[0] === "-")
    );
  }

  function isGroundEquipment() {
    return battleDimensionValue === "G" && functionIdValue[0] === "E";
  }

  function isGroundInstallation() {
    return battleDimensionValue === "G" && functionIdValue[0] === "I";
  }

  function isSeaSurface() {
    return codingSchemeValue === "S" && battleDimensionValue === "S";
  }

  function isSeaSubsurface() {
    return codingSchemeValue === "S" && battleDimensionValue === "U";
  }

  function isGraphics() {
    return codingSchemeValue === "G";
  }

  function isSOF() {
    return codingSchemeValue === "S" && battleDimensionValue === "F";
  }

  return {
    ...symbolValues,
    battleDimensionItems,
    statusItems,
    echelonItems,
    hqtfdItems,
    isLoaded,
    loadData,
  };
}

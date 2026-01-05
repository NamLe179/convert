"use client";

import fuzzysort from "fuzzysort";
import { groupBy, htmlTagEscape } from "@/lib/utils-msdl";
import { useSymbologyData } from "@/hooks/symbolDataB";

/* =====================
 * Types
 * ===================== */

export interface SymbolSearchResult {
  text: string;
  name: string;
  score: number;
  index: number;
  highlight: string;
  sidc: string;
  category: "WARFIGHTING" | "TACTICAL GRAPHICS";
}

/* =====================
 * Hook
 * ===================== */

export function useSymbologySearch(sidValue: string) {
  const { symbology } = useSymbologyData();

  function searchMainIcons(query: string): SymbolSearchResult[] {
    if (!query || !symbology?.length) return [];

    const hits = fuzzysort.go(query, symbology, {
      key: "text",
      limit: 10,
    });

    return hits.map((e, index) => {
      const { obj, ...rest } = e;

      return {
        text: obj.text,
        name: obj.name,
        score: e.score,
        index,
        highlight:
          fuzzysort.highlight({
            ...rest,
            target: htmlTagEscape(rest.target),
          }) ?? "",
        sidc:
          obj.codingscheme +
          sidValue +
          obj.battledimension +
          "-" +
          obj.functionid +
          "-----",
        category: obj.category,
      };
    });
  }

  function search(query: string) {
    const mainIconHits = searchMainIcons(query);

    return {
      numberOfHits: mainIconHits.length,
      groups: groupBy(mainIconHits, "category"),
    };
  }

  return { search };
}

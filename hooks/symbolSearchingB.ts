"use client";

import { useCallback } from "react";
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

  const search = useCallback(
    (query: string) => {
      function searchMainIcons(q: string): SymbolSearchResult[] {
        if (!q || !symbology?.length) return [];

        const hits = fuzzysort.go(q, symbology, {
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
          } as SymbolSearchResult;
        });
      }

      const mainIconHits = searchMainIcons(query);
      
      // Lấy kết quả dạng Map từ hàm groupBy
      const groupsMap = groupBy(mainIconHits, "category");

      // Chuyển đổi Map thành Plain Object (Record)
      const groupsObj = Object.fromEntries(groupsMap);

      return {
        numberOfHits: mainIconHits.length,
        groups: groupsObj as Record<string, SymbolSearchResult[]>, // Ép kiểu về Record để khớp với State
      };
    },
    [symbology, sidValue]
  );

  return { search };
}
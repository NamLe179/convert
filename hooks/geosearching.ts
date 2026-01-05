"use client";

import { useCallback, useState } from "react";
import type { Feature, FeatureCollection, Point } from "geojson";

/* =====================
 * Types
 * ===================== */

export interface GeoSearchOptions {
  mapCenter?: number[] | null;
  limit?: number;
  lang?: string;
}

export interface PhotonFeatureProperties {
  name: string;
  country?: string;
  city?: string;
  state?: string;
  extent?: number[];
  osm_key?: string;
}

export interface GeoSearchProperties {
  name: string;
  country?: string;
  city?: string;
  state?: string;
  extent?: number[];
  category?: string;
  distance?: number;
}

export type PhotonSearchResult = Feature<Point, GeoSearchProperties>;

export interface ExtendedPhotonSearchResult extends PhotonSearchResult {
  category: "Places";
}

/* =====================
 * Hook
 * ===================== */

export function useGeoSearch() {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const photonSearch = useCallback(
    async (
      q: string,
      options: GeoSearchOptions = {},
    ): Promise<PhotonSearchResult[]> => {
      const { mapCenter, limit = 10, lang = "en" } = options;

      try {
        setIsFetching(true);
        setError(null);

        let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          q,
        )}&limit=${limit}&lang=${lang}`;

        if (mapCenter) {
          const [lon, lat] = mapCenter;
          url += `&lon=${lon}&lat=${lat}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Photon API error: ${res.status}`);
        }

        const data =
          (await res.json()) as FeatureCollection<
            Point,
            PhotonFeatureProperties
          >;

        if (!data?.features) return [];

        return data.features.map((item) => ({
          ...item,
          properties: {
            name: item.properties.name,
            country: item.properties.country,
            city: item.properties.city,
            state: item.properties.state,
            extent: item.properties.extent,
            category: item.properties.osm_key,
          },
        }));
      } catch (err) {
        setError(err);
        return [];
      } finally {
        setIsFetching(false);
      }
    },
    [],
  );

  return {
    isFetching,
    photonSearch,
    error,
  };
}

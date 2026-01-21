"use client";

import { useCallback, useRef, useState } from "react";

/* =====================
 * Types
 * ===================== */

export interface ModalSidcOptions {
  title: string;
  initialTab: number;
}

export interface ModalSidcReturn {
  sidc: string;
}

type Resolver =
  | ((value: ModalSidcReturn | undefined) => void)
  | null;

/* =====================
 * Hook
 * ===================== */

export function useSidcModal() {
  const [isRevealed, setIsRevealed] = useState(false);

  const [initialSidcModalValue, setInitialSidcModalValue] =
    useState("SFGPU----------");
  const [sidcModalTitle, setSidcModalTitle] =
    useState("Select symbol");
  const [initialTab, setInitialTab] = useState(0);

  const resolverRef = useRef<Resolver>(null);

  /**
   * Open modal & wait for result
   */
  const getModalSidc = useCallback(
    (
      initialValue: string,
      options: Partial<ModalSidcOptions> = {},
    ): Promise<ModalSidcReturn | undefined> => {
      setInitialSidcModalValue(initialValue);
      setSidcModalTitle(options.title ?? "Symbol picker");
      setInitialTab(options.initialTab ?? 0);

      setIsRevealed(true);

      return new Promise((resolve) => {
        resolverRef.current = resolve;
      });
    },
    [],
  );

  /**
   * Confirm
   */
  const confirmSidcModal = useCallback((sidc: string) => {
    setIsRevealed(false);
    resolverRef.current?.({ sidc });
    resolverRef.current = null;
  }, []);

  /**
   * Cancel
   */
  const cancelSidcModal = useCallback(() => {
    setIsRevealed(false);
    resolverRef.current?.(undefined);
    resolverRef.current = null;
  }, []);

  return {
    // state
    isRevealed,
    showSidcModal: isRevealed,

    // data
    initialSidcModalValue,
    sidcModalTitle,
    initialTab,

    // setters (if UI needs them)
    setInitialSidcModalValue,
    setSidcModalTitle,
    setInitialTab,
    setShowSidcModal: setIsRevealed,

    // actions
    getModalSidc,
    revealSidcModal: () => setIsRevealed(true),
    confirmSidcModal,
    cancelSidcModal,
  };
}

/**
 * Same helper type as Vue version
 */
export type SidcModalPromise =
  ReturnType<typeof useSidcModal>["getModalSidc"];

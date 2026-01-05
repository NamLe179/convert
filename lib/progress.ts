import { useEffect, useRef } from "react";

// For React, we'll create a hook-based approach instead of composable
// Install: npm install trickling

let progressInstance: any = null;

async function getProgress() {
  if (!progressInstance) {
    const { createTrickling } = await import("trickling");
    progressInstance = createTrickling({
      // Options can be customized here
    });
  }
  return progressInstance;
}

// Export singleton instance getter
export const getProgressInstance = async () => {
  return await getProgress();
};

// React hook for progress management
export function useProgress() {
  const progressRef = useRef<any>(null);

  useEffect(() => {
    getProgress().then((instance) => {
      progressRef.current = instance;
    });
  }, []);

  const start = () => {
    progressRef.current?.start();
  };

  const done = () => {
    progressRef.current?.done();
  };

  const set = (value: number) => {
    progressRef.current?.set(value);
  };

  return { start, done, set };
}

// For non-hook usage (like in utility functions)
export const progress = {
  start: async () => {
    const instance = await getProgress();
    instance.start();
  },
  done: async () => {
    const instance = await getProgress();
    instance.done();
  },
  set: async (value: number) => {
    const instance = await getProgress();
    instance.set(value);
  },
};
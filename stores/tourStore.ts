import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourState {
  doNotShowTourAnymore: boolean;
  isTourActive: boolean;
  activeIndex: number;
  
  startTour: (startFromIndex?: number) => void;
  finishTour: () => void;
  resetTour: () => void;
  setActiveIndex: (index: number) => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      doNotShowTourAnymore: false,
      isTourActive: false,
      activeIndex: 0,
      
      startTour: (startFromIndex = 0) => {
        const { isTourActive, doNotShowTourAnymore } = get();
        
        if (isTourActive) {
          console.log("Tour is already active");
          return;
        }
        
        if (doNotShowTourAnymore) {
          console.log("User does not want to see the tour anymore");
          return;
        }
        
        set({ isTourActive: true, activeIndex: startFromIndex });
        console.log("Set tour to active");
      },
      
      finishTour: () => {
        set({ doNotShowTourAnymore: true, isTourActive: false });
        console.log("Finish tour");
      },
      
      resetTour: () => {
        set({ doNotShowTourAnymore: false, isTourActive: false });
        console.log("Reset tour");
      },
      
      setActiveIndex: (index) => set({ activeIndex: index }),
    }),
    {
      name: "tour-storage",
      partialize: (state) => ({ 
        doNotShowTourAnymore: state.doNotShowTourAnymore 
      }),
    }
  )
);
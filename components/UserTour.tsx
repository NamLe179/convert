"use client";

import { useEffect, useRef } from "react";
import { driver, type Config, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

// Stores & Events
import { useTourStore } from "@/stores/tourStore";
import { useSelectStore } from "@/stores/selectStore";
import { eventBus, MSDL_EDITOR_EVENT } from "@/lib/eventBus"; 

interface ClickConfig {
  element: string;
  fcn: () => void;
  index: number;
}

export default function UserTour() {
  // 1. Stores
  const { isTourActive, activeIndex, finishTour, setActiveIndex } = useTourStore();
  const selectStore = useSelectStore();

  // 2. Refs (để giữ state mutable không gây re-render)
  const driverObj = useRef<ReturnType<typeof driver> | null>(null);
  const currentResumeEvent = useRef<string | undefined>(undefined);
  const clickListenerCleanup = useRef<(() => void) | undefined>(undefined);

  // 3. Helper Functions
  
  const pauseTour = (resumeEvent?: string) => {
    if (resumeEvent) {
      currentResumeEvent.current = resumeEvent;
    }
    // Lưu index hiện tại vào store trước khi destroy
    if (driverObj.current) {
      setActiveIndex(driverObj.current.getActiveIndex() || 0);
      driverObj.current.destroy();
    }
  };

  const resumeTour = () => {
    // Tăng index lên 1 để sang bước tiếp theo
    if (driverObj.current) {
        setActiveIndex((activeIndex || 0) + 1);
    }
  };

  const setupClickListener = (cc: ClickConfig) => {
    // Cleanup listener cũ nếu có
    if (clickListenerCleanup.current) {
      clickListenerCleanup.current();
      clickListenerCleanup.current = undefined;
    }

    const elm = document.querySelector(cc.element);
    if (!elm) {
      console.warn(`Cannot find element ${cc.element}`);
      return;
    }

    const handler = () => {
        // Check index hiện tại của driver
       const currentIndex = driverObj.current?.getActiveIndex();
       if (currentIndex === cc.index) {
         cc.fcn();
       } else {
         console.log(`Wanted index ${cc.index} !== current ${currentIndex}`);
       }
    };

    elm.addEventListener("click", handler);
    
    // Lưu cleanup function
    clickListenerCleanup.current = () => {
      elm.removeEventListener("click", handler);
    };

    // Update store index để đồng bộ
    if (driverObj.current) {
        setActiveIndex(driverObj.current.getActiveIndex() || 0);
    }
  };

  // 4. Tour Configuration
  const tourSteps: DriveStep[] = [
    {
      element: "header nav",
      popover: {
        showButtons: ["next", "close"],
        title: "Welcome to the MSDL editor",
        description:
          "This tour will get you started with the application. It provides a step-by-step guide for creating an MSDL scenario.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#main-dropdown-menu > button",
      popover: {
        showButtons: ["close"],
        title: "Create a new MSDL file",
        description: "Click to open the menu, then select 'File' > 'Create new MSDL...'",
        onPopoverRender: () => {
          setupClickListener({
            element: "#main-dropdown-menu > button",
            fcn: () => pauseTour("created-new-msdl"),
            index: 1,
          });
        },
      },
    },
    {
      element: "button#create-force-side",
      popover: {
        showButtons: ["close"],
        title: "Create a Force Side",
        description: "First, we need to create a Force Side to add units to. For example, BLUEFOR",
        onPopoverRender: () => {
          setupClickListener({
            element: "button#create-force-side",
            fcn: () => pauseTour("created-force-side"),
            index: 2,
          });
        },
      },
    },
    {
      element: undefined, // Center screen
      popover: {
        showButtons: ["next", "close"],
        title: "Create a unit",
        description: "Right-click on the map and select 'Create new > Unit'",
        nextBtnText: "OK",
        onNextClick: () => pauseTour("created-unit"),
      },
    },
    {
      element: undefined,
      popover: {
        showButtons: ["next", "close"],
        title: "Edit the unit",
        description: "Click the unit on the map or in the ORBAT tree to edit its properties",
        nextBtnText: "OK",
        onNextClick: () => pauseTour("selected-item"),
      },
    },
    {
      element: "button#edit-item-details",
      popover: {
        showButtons: ["next", "close"],
        title: "Edit the unit name and symbol",
        description:
          "Click the pencil to open the unit editor to change the name and the symbol of the unit",
        nextBtnText: "OK",
        onNextClick: () => pauseTour("symbol-updated"),
      },
    },
    {
      element: "span#unit-model-tab",
      popover: {
        showButtons: ["next", "close"],
        title: "Edit other unit details",
        description: "Browse through the tabs to edit the unit's model, holdings, etc.",
      },
    },
    {
      element: "button#show-all-federates",
      popover: {
        showButtons: ["close"],
        title: "Add a federate to the MSDL scenario",
        description: "Click the 'Show all federates' button.",
        onPopoverRender: (popover, opts) => {
          setupClickListener({
            element: "button#show-all-federates",
            fcn: opts.driver.moveNext,
            index: 7,
          });
        },
      },
    },
    {
      element: "#create-deployment > button",
      popover: {
        showButtons: ["close"],
        title: "Add a deployment",
        description: "Click the button to create a deployment",
        onPopoverRender: (popover, opts) => {
          setupClickListener({
            element: "#create-deployment > button",
            fcn: opts.driver.moveNext,
            index: 8,
          });
        },
      },
    },
    {
      element: "#create-new-federate > button",
      popover: {
        showButtons: ["close"],
        title: "Add a federate",
        description: "Click the button to add a federate",
        onPopoverRender: () => {
           setupClickListener({
            element: "#create-new-federate > button",
            fcn: () => pauseTour("created-federate"),
            index: 9,
          });
        },
      },
    },
    {
      element: "#federates-overview-area header button",
      popover: {
        showButtons: ["next", "close"],
        title: "Show items assigned to federates",
        description:
          "Click the button to show the number of assigned units and equipment items for each federate.",
      },
    },
    {
      element: "#orbat-sides-container",
      popover: {
        showButtons: ["next", "close"],
        title: "Assign units to federates",
        description:
          "Drag a unit or equipment-item to a federate in the panel on the right, in order to assign it to that federate. Holding the 'SHIFT'-key while dragging also assigns all underlying items",
        nextBtnText: "OK",
        onNextClick: () => pauseTour("assigned-federate"),
      },
    },
    {
      element: "#main-dropdown-menu > button",
      popover: {
        showButtons: ["next", "close"],
        title: "Save or load MSDL files",
        description:
          "Open the menu to download the existing MSDL as a file, or to load existing MSDL-files from your machine.",
      },
    },
    {
      element: undefined,
      popover: {
        showButtons: ["close", "next"],
        title: "Finished the tour",
        description:
          "The tour has guided you through the main process of creating an MSDL file. You can always restart the tour by clicking the question mark icon in the top right navigation bar",
      },
    },
  ];

  // 5. Effects
  
  // Init Driver on Mount
  useEffect(() => {
    const config: Config = {
      showProgress: true,
      steps: tourSteps,
      allowClose: false,
      onCloseClick: () => {
        driverObj.current?.destroy();
        finishTour();
      },
    };
    
    driverObj.current = driver(config);

    // Event Bus Handler
    const handleEvent = (payload: any) => {
        // Payload có thể là string hoặc object tùy implementation eventBus
        const eventName = typeof payload === 'string' ? payload : payload?.type; 
        
        if (currentResumeEvent.current && currentResumeEvent.current === eventName) {
            currentResumeEvent.current = undefined; // Clear event wait
            
            setActiveIndex((useTourStore.getState().activeIndex || 0) + 1);
        }
    };

    eventBus.on(MSDL_EDITOR_EVENT, handleEvent);

    return () => {
      eventBus.off(MSDL_EDITOR_EVENT, handleEvent);
      if (clickListenerCleanup.current) clickListenerCleanup.current();
      driverObj.current?.destroy();
    };
  }, [finishTour, setActiveIndex]); // Empty deps array mostly, or stable store functions


  // Watch isTourActive & activeIndex changes
  useEffect(() => {
    if (isTourActive) {
      driverObj.current?.drive(activeIndex || 0);
    } else {
      if (clickListenerCleanup.current) {
        clickListenerCleanup.current();
        clickListenerCleanup.current = undefined;
      }
      // console.log("User tour is not active");
      driverObj.current?.destroy();
    }
  }, [isTourActive, activeIndex]);

  return null; 
}
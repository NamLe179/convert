import { create } from "zustand";

interface DialogState {
  isUrlDialogOpen: boolean;
  isAssociationDialogOpen: boolean;
  isCreateMSDLDialogOpen: boolean;
  isCreateForceSideDialogOpen: boolean;
  isCreateFederateDialogOpen: boolean;
  isWMSBaseLayerDialogOpen: boolean;
  isXYZBaseLayerDialogOpen:  boolean;
  
  toggleUrlDialog: () => void;
  toggleAssociationDialog: () => void;
  toggleCreateMSDLDialog: () => void;
  toggleCreateForceSideDialog: () => void;
  toggleCreateFederateDialog: () => void;
  toggleWMSBaseLayerDialog: () => void;
  toggleXYZBaseLayerDialog: () => void;
  
  setUrlDialog: (open: boolean) => void;
  setAssociationDialog: (open: boolean) => void;
  setCreateMSDLDialog: (open: boolean) => void;
  setCreateForceSideDialog: (open: boolean) => void;
  setCreateFederateDialog: (open: boolean) => void;
  setWMSBaseLayerDialog: (open: boolean) => void;
  setXYZBaseLayerDialog: (open: boolean) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isUrlDialogOpen: false,
  isAssociationDialogOpen: false,
  isCreateMSDLDialogOpen: false,
  isCreateForceSideDialogOpen: false,
  isCreateFederateDialogOpen: false,
  isWMSBaseLayerDialogOpen:  false,
  isXYZBaseLayerDialogOpen: false,
  
  toggleUrlDialog: () => 
    set((state) => ({ isUrlDialogOpen: !state.isUrlDialogOpen })),
  toggleAssociationDialog: () => 
    set((state) => ({ isAssociationDialogOpen: !state.isAssociationDialogOpen })),
  toggleCreateMSDLDialog: () => 
    set((state) => ({ isCreateMSDLDialogOpen: !state.isCreateMSDLDialogOpen })),
  toggleCreateForceSideDialog: () => 
    set((state) => ({ isCreateForceSideDialogOpen: !state.isCreateForceSideDialogOpen })),
  toggleCreateFederateDialog: () => 
    set((state) => ({ isCreateFederateDialogOpen: !state.isCreateFederateDialogOpen })),
   toggleWMSBaseLayerDialog: () => 
    set((state) => ({ isWMSBaseLayerDialogOpen:  !state.isWMSBaseLayerDialogOpen })),
  toggleXYZBaseLayerDialog: () => 
    set((state) => ({ isXYZBaseLayerDialogOpen: !state.isXYZBaseLayerDialogOpen })),
  
  setUrlDialog: (open) => set({ isUrlDialogOpen: open }),
  setAssociationDialog: (open) => set({ isAssociationDialogOpen: open }),
  setCreateMSDLDialog: (open) => set({ isCreateMSDLDialogOpen: open }),
  setCreateForceSideDialog: (open) => set({ isCreateForceSideDialogOpen: open }),
  setCreateFederateDialog: (open) => set({ isCreateFederateDialogOpen: open }),
  setWMSBaseLayerDialog: (open) => set({ isWMSBaseLayerDialogOpen: open }),
  setXYZBaseLayerDialog: (open) => set({ isXYZBaseLayerDialogOpen: open }),
}));
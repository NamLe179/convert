import { create } from "zustand";

interface DialogState {
  isUrlDialogOpen: boolean;
  isAssociationDialogOpen: boolean;
  isCreateMSDLDialogOpen: boolean;
  isCreateForceSideDialogOpen: boolean;
  isCreateFederateDialogOpen: boolean;
  
  toggleUrlDialog: () => void;
  toggleAssociationDialog: () => void;
  toggleCreateMSDLDialog: () => void;
  toggleCreateForceSideDialog: () => void;
  toggleCreateFederateDialog: () => void;
  
  setUrlDialog: (open: boolean) => void;
  setAssociationDialog: (open: boolean) => void;
  setCreateMSDLDialog: (open: boolean) => void;
  setCreateForceSideDialog: (open: boolean) => void;
  setCreateFederateDialog: (open: boolean) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isUrlDialogOpen: false,
  isAssociationDialogOpen: false,
  isCreateMSDLDialogOpen: false,
  isCreateForceSideDialogOpen: false,
  isCreateFederateDialogOpen: false,
  
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
  
  setUrlDialog: (open) => set({ isUrlDialogOpen: open }),
  setAssociationDialog: (open) => set({ isAssociationDialogOpen: open }),
  setCreateMSDLDialog: (open) => set({ isCreateMSDLDialogOpen: open }),
  setCreateForceSideDialog: (open) => set({ isCreateForceSideDialogOpen: open }),
  setCreateFederateDialog: (open) => set({ isCreateFederateDialogOpen: open }),
}));
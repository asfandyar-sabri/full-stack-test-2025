// src/stores/ui.ts
import { create } from 'zustand';

type UiState = {
  sidebarOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

export const useUi = create<UiState>((set) => ({
  sidebarOpen: false,                 // default false; we'll set initial per viewport in ChatLayout
  toggle: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  open:   () => set({ sidebarOpen: true }),
  close:  () => set({ sidebarOpen: false }),
}));

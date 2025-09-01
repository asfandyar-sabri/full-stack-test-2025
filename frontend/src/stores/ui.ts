// src/stores/ui.ts
import { create } from 'zustand';

type UiState = { sidebarOpen: boolean; toggle: () => void; close: () => void };
export const useUi = create<UiState>((set) => ({
  sidebarOpen: false,
  toggle: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  close: () => set({ sidebarOpen: false }),
}));

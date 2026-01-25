/**
 * Zustand store for UI state ONLY
 * Phase 1: Theme, modals, sidebar state
 * 
 * IMPORTANT:
 * - NO server data in this store
 * - NO user data in this store
 * - Client-side UI state only
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Modals (example - add more as needed)
  modals: {
    [key: string]: boolean;
  };
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Modals
      modals: {},
      openModal: (key) =>
        set((state) => ({
          modals: { ...state.modals, [key]: true },
        })),
      closeModal: (key) =>
        set((state) => ({
          modals: { ...state.modals, [key]: false },
        })),
    }),
    {
      name: "ressourcefy-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

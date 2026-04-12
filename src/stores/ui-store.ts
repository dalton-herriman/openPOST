import { create } from "zustand";

export type SidebarTab = "collections" | "history" | "environments";
export type RequestTab = "params" | "headers" | "body";
export type ResponseTab = "body" | "headers" | "raw";

interface UiStore {
  sidebarTab: SidebarTab;
  requestTab: RequestTab;
  responseTab: ResponseTab;
  sidebarCollapsed: boolean;

  setSidebarTab: (tab: SidebarTab) => void;
  setRequestTab: (tab: RequestTab) => void;
  setResponseTab: (tab: ResponseTab) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarTab: "collections",
  requestTab: "params",
  responseTab: "body",
  sidebarCollapsed: false,

  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  setRequestTab: (requestTab) => set({ requestTab }),
  setResponseTab: (responseTab) => set({ responseTab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));

// Copyright (C) 2026 openPOST contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

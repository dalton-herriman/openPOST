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
import type { HistoryEntry } from "../types";
import { api } from "../lib/tauri";

interface HistoryStore {
  entries: HistoryEntry[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (entry: HistoryEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const entries = await api.listHistory();
      set({ entries });
    } finally {
      set({ loading: false });
    }
  },

  add: async (entry) => {
    await api.addHistoryEntry(entry);
    await get().fetch();
  },

  remove: async (id) => {
    await api.deleteHistoryEntry(id);
    await get().fetch();
  },

  clear: async () => {
    await api.clearHistory();
    set({ entries: [] });
  },
}));

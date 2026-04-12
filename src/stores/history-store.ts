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

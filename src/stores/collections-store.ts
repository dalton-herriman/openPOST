import { create } from "zustand";
import type { Collection, RequestData } from "../types";
import { api } from "../lib/tauri";

interface CollectionsStore {
  collections: Collection[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (name: string) => Promise<Collection>;
  update: (collection: Collection) => Promise<void>;
  remove: (id: string) => Promise<void>;
  addItem: (collectionId: string, request: RequestData) => Promise<void>;
  removeItem: (collectionId: string, itemId: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsStore>((set, get) => ({
  collections: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const collections = await api.listCollections();
      set({ collections });
    } finally {
      set({ loading: false });
    }
  },

  create: async (name) => {
    const collection = await api.createCollection(name);
    await get().fetch();
    return collection;
  },

  update: async (collection) => {
    await api.updateCollection(collection);
    await get().fetch();
  },

  remove: async (id) => {
    await api.deleteCollection(id);
    await get().fetch();
  },

  addItem: async (collectionId, request) => {
    await api.createCollectionItem(collectionId, request);
    await get().fetch();
  },

  removeItem: async (collectionId, itemId) => {
    await api.deleteCollectionItem(collectionId, itemId);
    await get().fetch();
  },
}));

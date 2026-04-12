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

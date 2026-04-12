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

import { invoke } from "@tauri-apps/api/core";
import type {
  RequestData,
  ResponseData,
  Collection,
  Environment,
  HistoryEntry,
} from "../types";

export const api = {
  sendRequest: (request: RequestData) =>
    invoke<ResponseData>("send_request", { request }),

  listCollections: () => invoke<Collection[]>("list_collections"),
  getCollection: (id: string) => invoke<Collection>("get_collection", { id }),
  createCollection: (name: string) =>
    invoke<Collection>("create_collection", { name }),
  updateCollection: (collection: Collection) =>
    invoke<Collection>("update_collection", { collection }),
  deleteCollection: (id: string) =>
    invoke<void>("delete_collection", { id }),
  createCollectionItem: (collectionId: string, request: RequestData) =>
    invoke<Collection>("create_collection_item", { collectionId, request }),
  deleteCollectionItem: (collectionId: string, itemId: string) =>
    invoke<Collection>("delete_collection_item", { collectionId, itemId }),

  listHistory: () => invoke<HistoryEntry[]>("list_history"),
  addHistoryEntry: (entry: HistoryEntry) =>
    invoke<void>("add_history_entry", { entry }),
  deleteHistoryEntry: (id: string) =>
    invoke<void>("delete_history_entry", { id }),
  clearHistory: () => invoke<void>("clear_history"),

  listEnvironments: () => invoke<Environment[]>("list_environments"),
  getEnvironment: (id: string) =>
    invoke<Environment>("get_environment", { id }),
  createEnvironment: (name: string) =>
    invoke<Environment>("create_environment", { name }),
  updateEnvironment: (environment: Environment) =>
    invoke<Environment>("update_environment", { environment }),
  deleteEnvironment: (id: string) =>
    invoke<void>("delete_environment", { id }),
  getActiveEnvironmentId: () =>
    invoke<string | null>("get_active_environment_id"),
  setActiveEnvironment: (id: string | null) =>
    invoke<void>("set_active_environment", { id }),
};

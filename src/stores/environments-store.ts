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
import type { Environment } from "../types";
import { api } from "../lib/tauri";

interface EnvironmentsStore {
  environments: Environment[];
  activeEnvironmentId: string | null;
  loading: boolean;
  fetch: () => Promise<void>;
  create: (name: string) => Promise<Environment>;
  update: (environment: Environment) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setActive: (id: string | null) => Promise<void>;
  getActiveVariables: () => Environment["variables"];
}

export const useEnvironmentsStore = create<EnvironmentsStore>((set, get) => ({
  environments: [],
  activeEnvironmentId: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const [environments, activeId] = await Promise.all([
        api.listEnvironments(),
        api.getActiveEnvironmentId(),
      ]);
      set({ environments, activeEnvironmentId: activeId });
    } finally {
      set({ loading: false });
    }
  },

  create: async (name) => {
    const env = await api.createEnvironment(name);
    await get().fetch();
    return env;
  },

  update: async (environment) => {
    await api.updateEnvironment(environment);
    await get().fetch();
  },

  remove: async (id) => {
    await api.deleteEnvironment(id);
    await get().fetch();
  },

  setActive: async (id) => {
    await api.setActiveEnvironment(id);
    set({ activeEnvironmentId: id });
  },

  getActiveVariables: () => {
    const { environments, activeEnvironmentId } = get();
    if (!activeEnvironmentId) return [];
    const env = environments.find((e) => e.id === activeEnvironmentId);
    return env?.variables ?? [];
  },
}));

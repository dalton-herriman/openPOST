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

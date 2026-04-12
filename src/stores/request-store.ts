import { create } from "zustand";
import type { RequestData, HttpMethod, BodyType, KeyValuePair } from "../types";
import { v4 as uuidv4 } from "uuid";

interface RequestStore {
  activeRequest: RequestData;
  isLoading: boolean;
  error: string | null;

  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: KeyValuePair[]) => void;
  setQueryParams: (params: KeyValuePair[]) => void;
  setBodyType: (bodyType: BodyType) => void;
  setBodyRaw: (body: string) => void;
  setBodyFormData: (data: KeyValuePair[]) => void;
  setName: (name: string) => void;
  loadRequest: (request: RequestData) => void;
  resetRequest: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const createDefaultRequest = (): RequestData => ({
  id: uuidv4(),
  name: "Untitled Request",
  method: "Get",
  url: "",
  headers: [{ key: "", value: "", enabled: true }],
  queryParams: [{ key: "", value: "", enabled: true }],
  bodyType: "None",
  bodyRaw: null,
  bodyFormData: null,
});

export const useRequestStore = create<RequestStore>((set) => ({
  activeRequest: createDefaultRequest(),
  isLoading: false,
  error: null,

  setMethod: (method) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, method } })),
  setUrl: (url) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, url } })),
  setHeaders: (headers) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, headers } })),
  setQueryParams: (queryParams) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, queryParams } })),
  setBodyType: (bodyType) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, bodyType } })),
  setBodyRaw: (bodyRaw) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, bodyRaw } })),
  setBodyFormData: (bodyFormData) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, bodyFormData } })),
  setName: (name) =>
    set((s) => ({ activeRequest: { ...s.activeRequest, name } })),
  loadRequest: (request) => set({ activeRequest: { ...request }, error: null }),
  resetRequest: () =>
    set({ activeRequest: createDefaultRequest(), error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

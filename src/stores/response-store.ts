import { create } from "zustand";
import type { ResponseData } from "../types";

interface ResponseStore {
  response: ResponseData | null;
  setResponse: (response: ResponseData | null) => void;
  clear: () => void;
}

export const useResponseStore = create<ResponseStore>((set) => ({
  response: null,
  setResponse: (response) => set({ response }),
  clear: () => set({ response: null }),
}));

export type HttpMethod = "Get" | "Post" | "Put" | "Patch" | "Delete" | "Head" | "Options";
export type BodyType = "None" | "Json" | "FormData" | "RawText" | "FormUrlEncoded";

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  bodyType: BodyType;
  bodyRaw: string | null;
  bodyFormData: KeyValuePair[] | null;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
  contentType: string | null;
  elapsedMs: number;
  sizeBytes: number;
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
}

export type CollectionItem =
  | { type: "request"; id: string; request: RequestData }
  | { type: "folder"; id: string; name: string; items: CollectionItem[] };

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

export interface EnvVariable {
  key: string;
  value: string;
  enabled: boolean;
}

export interface HistoryEntry {
  id: string;
  request: RequestData;
  response: ResponseData | null;
  timestamp: string;
}

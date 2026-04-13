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

export type HttpMethod = "Get" | "Post" | "Put" | "Patch" | "Delete" | "Head" | "Options";
export type BodyType = "None" | "Json" | "FormData" | "RawText" | "FormUrlEncoded";

export interface KeyValuePair {
  id: string;
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
  id: string;
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

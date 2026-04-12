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

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export const METHOD_COLORS: Record<string, string> = {
  Get: "text-green-400",
  Post: "text-yellow-400",
  Put: "text-blue-400",
  Patch: "text-orange-400",
  Delete: "text-red-400",
  Head: "text-purple-400",
  Options: "text-pink-400",
};

export const METHOD_BG_COLORS: Record<string, string> = {
  Get: "bg-green-400/10 text-green-400",
  Post: "bg-yellow-400/10 text-yellow-400",
  Put: "bg-blue-400/10 text-blue-400",
  Patch: "bg-orange-400/10 text-orange-400",
  Delete: "bg-red-400/10 text-red-400",
  Head: "bg-purple-400/10 text-purple-400",
  Options: "bg-pink-400/10 text-pink-400",
};

export function statusColor(status: number): string {
  if (status < 300) return "text-green-400";
  if (status < 400) return "text-yellow-400";
  if (status < 500) return "text-orange-400";
  return "text-red-400";
}

export function statusBgColor(status: number): string {
  if (status < 300) return "bg-green-400/10 text-green-400";
  if (status < 400) return "bg-yellow-400/10 text-yellow-400";
  if (status < 500) return "bg-orange-400/10 text-orange-400";
  return "bg-red-400/10 text-red-400";
}

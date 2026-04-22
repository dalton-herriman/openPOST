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

import { Send, Loader2 } from "lucide-react";
import { useRequestStore } from "../../stores/request-store";
import { useResponseStore } from "../../stores/response-store";
import { useHistoryStore } from "../../stores/history-store";
import { useEnvironmentsStore } from "../../stores/environments-store";
import { api } from "../../lib/tauri";
import { substituteVariables } from "../../lib/env-substitution";
import { cn, METHOD_COLORS } from "../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import type { HttpMethod } from "../../types";

const METHODS: HttpMethod[] = [
  "Get",
  "Post",
  "Put",
  "Patch",
  "Delete",
  "Head",
  "Options",
];

export function UrlBar() {
  const { activeRequest, setMethod, setUrl, isLoading, setLoading, setError } =
    useRequestStore();
  const setResponse = useResponseStore((s) => s.setResponse);
  const addHistory = useHistoryStore((s) => s.add);
  const getActiveVariables = useEnvironmentsStore((s) => s.getActiveVariables);

  const handleSend = async () => {
    if (!activeRequest.url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const variables = getActiveVariables();
      const resolvedRequest = substituteVariables(activeRequest, variables);
      const response = await api.sendRequest(resolvedRequest);
      setResponse(response);
      await addHistory({
        id: uuidv4(),
        request: resolvedRequest,
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-zinc-800">
      <select
        value={activeRequest.method}
        onChange={(e) => setMethod(e.target.value as HttpMethod)}
        className={cn(
          "bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs font-bold outline-none cursor-pointer min-w-[90px]",
          METHOD_COLORS[activeRequest.method],
        )}
      >
        {METHODS.map((m) => (
          <option key={m} value={m} className="text-zinc-200">
            {m.toUpperCase()}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={activeRequest.url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter URL..."
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500/50 font-mono"
      />

      <button
        onClick={handleSend}
        disabled={isLoading || !activeRequest.url.trim()}
        className={cn(
          "flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium transition-colors",
          isLoading || !activeRequest.url.trim()
            ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-500",
        )}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
        Send
      </button>
    </div>
  );
}

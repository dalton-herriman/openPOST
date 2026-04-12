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

import { useEffect } from "react";
import { Clock, Trash2 } from "lucide-react";
import { useHistoryStore } from "../../stores/history-store";
import { useRequestStore } from "../../stores/request-store";
import { useResponseStore } from "../../stores/response-store";
import { EmptyState } from "../shared/EmptyState";
import { cn, METHOD_COLORS } from "../../lib/utils";

export function HistoryPanel() {
  const { entries, fetch, remove, clear } = useHistoryStore();
  const loadRequest = useRequestStore((s) => s.loadRequest);
  const setResponse = useResponseStore((s) => s.setResponse);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleLoad = (entry: (typeof entries)[0]) => {
    loadRequest(entry.request);
    if (entry.response) {
      setResponse(entry.response);
    }
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={24} />}
        title="No history"
        description="Requests you send will appear here"
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400">History</span>
        <button
          onClick={clear}
          className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto px-1 py-1">
        {entries.map((entry) => (
          <div
            key={entry.id}
            onClick={() => handleLoad(entry)}
            className="flex items-center gap-1.5 group px-2 py-1.5 hover:bg-zinc-800/50 rounded cursor-pointer"
          >
            <span
              className={cn(
                "text-[10px] font-bold w-10 shrink-0",
                METHOD_COLORS[entry.request.method],
              )}
            >
              {entry.request.method.toUpperCase().slice(0, 3)}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-zinc-300 truncate block">
                {entry.request.url}
              </span>
              <span className="text-[10px] text-zinc-600">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                remove(entry.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

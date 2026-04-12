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

import { useResponseStore } from "../../stores/response-store";
import { useRequestStore } from "../../stores/request-store";
import { Tabs } from "../shared/Tabs";
import { ResponseBody } from "./ResponseBody";
import { ResponseHeaders } from "./ResponseHeaders";
import { EmptyState } from "../shared/EmptyState";
import { useUiStore, type ResponseTab } from "../../stores/ui-store";
import { formatBytes, formatMs, statusBgColor, cn } from "../../lib/utils";
import { Send, AlertCircle } from "lucide-react";

const RESPONSE_TABS: { value: ResponseTab; label: string }[] = [
  { value: "body", label: "Body" },
  { value: "headers", label: "Headers" },
  { value: "raw", label: "Raw" },
];

export function ResponsePanel() {
  const response = useResponseStore((s) => s.response);
  const { isLoading, error } = useRequestStore();
  const { responseTab, setResponseTab } = useUiStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-500">Sending request...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="flex flex-col items-center gap-2 max-w-md px-4">
          <AlertCircle size={24} className="text-red-400" />
          <span className="text-sm font-medium text-red-400">Request Failed</span>
          <span className="text-xs text-zinc-500 text-center break-all">
            {error}
          </span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-zinc-900 h-full">
        <EmptyState
          icon={<Send size={32} />}
          title="No response yet"
          description="Send a request to see the response here"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-zinc-800">
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-bold",
            statusBgColor(response.status),
          )}
        >
          {response.status} {response.statusText}
        </span>
        <span className="text-xs text-zinc-500">
          {formatMs(response.elapsedMs)}
        </span>
        <span className="text-xs text-zinc-500">
          {formatBytes(response.sizeBytes)}
        </span>
      </div>
      <Tabs
        tabs={RESPONSE_TABS}
        active={responseTab}
        onChange={setResponseTab}
      />
      <div className="flex-1 overflow-hidden">
        {responseTab === "body" && <ResponseBody response={response} />}
        {responseTab === "headers" && (
          <ResponseHeaders headers={response.headers} />
        )}
        {responseTab === "raw" && (
          <pre className="p-3 text-xs text-zinc-300 font-mono overflow-auto h-full whitespace-pre-wrap break-all">
            {response.body}
          </pre>
        )}
      </div>
    </div>
  );
}

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

import { UrlBar } from "./UrlBar";
import { KeyValueEditor } from "./KeyValueEditor";
import { BodyEditor } from "./BodyEditor";
import { Tabs } from "../shared/Tabs";
import { useUiStore, type RequestTab } from "../../stores/ui-store";
import { useRequestStore } from "../../stores/request-store";

const REQUEST_TABS: { value: RequestTab; label: string }[] = [
  { value: "params", label: "Params" },
  { value: "headers", label: "Headers" },
  { value: "body", label: "Body" },
];

export function RequestPanel() {
  const { requestTab, setRequestTab } = useUiStore();
  const { activeRequest, setQueryParams, setHeaders } = useRequestStore();

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <UrlBar />
      <Tabs tabs={REQUEST_TABS} active={requestTab} onChange={setRequestTab} />
      <div className="flex-1 overflow-hidden">
        {requestTab === "params" && (
          <KeyValueEditor
            pairs={activeRequest.queryParams}
            onChange={setQueryParams}
            keyPlaceholder="Parameter"
            valuePlaceholder="Value"
          />
        )}
        {requestTab === "headers" && (
          <KeyValueEditor
            pairs={activeRequest.headers}
            onChange={setHeaders}
            keyPlaceholder="Header"
            valuePlaceholder="Value"
          />
        )}
        {requestTab === "body" && <BodyEditor />}
      </div>
    </div>
  );
}

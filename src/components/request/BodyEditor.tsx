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

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { useRequestStore } from "../../stores/request-store";
import { KeyValueEditor } from "./KeyValueEditor";
import type { BodyType } from "../../types";
import { cn } from "../../lib/utils";

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: "None", label: "None" },
  { value: "Json", label: "JSON" },
  { value: "RawText", label: "Raw" },
  { value: "FormUrlEncoded", label: "Form URL Encoded" },
  { value: "FormData", label: "Form Data" },
];

export function BodyEditor() {
  const { activeRequest, setBodyType, setBodyRaw, setBodyFormData } =
    useRequestStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-zinc-800">
        {BODY_TYPES.map((bt) => (
          <button
            key={bt.value}
            onClick={() => setBodyType(bt.value)}
            className={cn(
              "px-2 py-0.5 text-xs rounded transition-colors",
              activeRequest.bodyType === bt.value
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {bt.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        {activeRequest.bodyType === "None" && (
          <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
            This request does not have a body
          </div>
        )}
        {(activeRequest.bodyType === "Json" ||
          activeRequest.bodyType === "RawText") && (
          <CodeMirror
            value={activeRequest.bodyRaw ?? ""}
            onChange={setBodyRaw}
            extensions={
              activeRequest.bodyType === "Json" ? [json()] : []
            }
            theme="dark"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              bracketMatching: true,
              closeBrackets: true,
            }}
            className="h-full text-sm"
          />
        )}
        {(activeRequest.bodyType === "FormUrlEncoded" ||
          activeRequest.bodyType === "FormData") && (
          <KeyValueEditor
            pairs={
              activeRequest.bodyFormData ?? [
                { key: "", value: "", enabled: true },
              ]
            }
            onChange={setBodyFormData}
          />
        )}
      </div>
    </div>
  );
}

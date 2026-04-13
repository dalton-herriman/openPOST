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

import { useMemo, useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { xml } from "@codemirror/lang-xml";
import { Copy, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ResponseData } from "../../types";

interface ResponseBodyProps {
  response: ResponseData;
}

export function ResponseBody({ response }: ResponseBodyProps) {
  const [copied, setCopied] = useState(false);

  const { formattedBody, extensions, languageLabel } = useMemo(() => {
    const ct = response.contentType?.toLowerCase() ?? "";

    if (ct.includes("json")) {
      let formatted = response.body;
      try {
        formatted = JSON.stringify(JSON.parse(response.body), null, 2);
      } catch {
        // Body isn't valid JSON, show as-is
      }
      return { formattedBody: formatted, extensions: [json()], languageLabel: "JSON" };
    }

    if (ct.includes("html")) {
      return { formattedBody: response.body, extensions: [html()], languageLabel: "HTML" };
    }

    if (ct.includes("xml")) {
      return { formattedBody: response.body, extensions: [xml()], languageLabel: "XML" };
    }

    return { formattedBody: response.body, extensions: [], languageLabel: "Text" };
  }, [response]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formattedBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [formattedBody]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
        <span className="text-xs text-zinc-500">{languageLabel}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={cn(
              "p-1 rounded transition-colors",
              copied
                ? "text-green-400"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
            )}
            title="Copy response body"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <CodeMirror
        value={formattedBody}
        readOnly
        editable={false}
        extensions={extensions}
        theme="dark"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
        }}
        className="flex-1 overflow-hidden text-sm"
      />
    </div>
  );
}

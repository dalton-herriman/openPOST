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

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { xml } from "@codemirror/lang-xml";
import type { ResponseData } from "../../types";

interface ResponseBodyProps {
  response: ResponseData;
}

export function ResponseBody({ response }: ResponseBodyProps) {
  const { formattedBody, extensions } = useMemo(() => {
    const ct = response.contentType?.toLowerCase() ?? "";

    if (ct.includes("json")) {
      let formatted = response.body;
      try {
        formatted = JSON.stringify(JSON.parse(response.body), null, 2);
      } catch {
        // Body isn't valid JSON, show as-is
      }
      return { formattedBody: formatted, extensions: [json()] };
    }

    if (ct.includes("html")) {
      return { formattedBody: response.body, extensions: [html()] };
    }

    if (ct.includes("xml")) {
      return { formattedBody: response.body, extensions: [xml()] };
    }

    return { formattedBody: response.body, extensions: [] };
  }, [response]);

  return (
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
      className="h-full text-sm"
    />
  );
}

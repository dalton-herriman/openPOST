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

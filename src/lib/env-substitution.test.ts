import { describe, it, expect } from "vitest";
import { substituteVariables } from "./env-substitution";
import type { RequestData, EnvVariable } from "../types";

function makeRequest(overrides: Partial<RequestData> = {}): RequestData {
  return {
    id: "test-id",
    name: "Test Request",
    method: "Get",
    url: "https://example.com",
    headers: [],
    queryParams: [],
    bodyType: "None",
    bodyRaw: null,
    bodyFormData: null,
    ...overrides,
  };
}

function makeVar(key: string, value: string, enabled = true): EnvVariable {
  return { id: `var-${key}`, key, value, enabled };
}

describe("substituteVariables", () => {
  it("replaces variables in URL", () => {
    const req = makeRequest({ url: "https://{{host}}/api" });
    const result = substituteVariables(req, [makeVar("host", "example.com")]);
    expect(result.url).toBe("https://example.com/api");
  });

  it("replaces multiple variables in URL", () => {
    const req = makeRequest({ url: "{{baseUrl}}/{{version}}/users" });
    const vars = [makeVar("baseUrl", "https://api.test"), makeVar("version", "v2")];
    const result = substituteVariables(req, vars);
    expect(result.url).toBe("https://api.test/v2/users");
  });

  it("replaces variables in header keys and values", () => {
    const req = makeRequest({
      headers: [{ id: "h1", key: "{{headerName}}", value: "{{headerValue}}", enabled: true }],
    });
    const vars = [makeVar("headerName", "Authorization"), makeVar("headerValue", "Bearer tok")];
    const result = substituteVariables(req, vars);
    expect(result.headers[0].key).toBe("Authorization");
    expect(result.headers[0].value).toBe("Bearer tok");
  });

  it("replaces variables in query params", () => {
    const req = makeRequest({
      queryParams: [{ id: "q1", key: "{{paramKey}}", value: "{{paramVal}}", enabled: true }],
    });
    const vars = [makeVar("paramKey", "search"), makeVar("paramVal", "test")];
    const result = substituteVariables(req, vars);
    expect(result.queryParams[0].key).toBe("search");
    expect(result.queryParams[0].value).toBe("test");
  });

  it("replaces variables in bodyRaw", () => {
    const req = makeRequest({ bodyRaw: '{"token":"{{apiKey}}"}' });
    const result = substituteVariables(req, [makeVar("apiKey", "abc123")]);
    expect(result.bodyRaw).toBe('{"token":"abc123"}');
  });

  it("replaces variables in bodyFormData", () => {
    const req = makeRequest({
      bodyFormData: [{ id: "f1", key: "{{field}}", value: "{{val}}", enabled: true }],
    });
    const vars = [makeVar("field", "username"), makeVar("val", "admin")];
    const result = substituteVariables(req, vars);
    expect(result.bodyFormData![0].key).toBe("username");
    expect(result.bodyFormData![0].value).toBe("admin");
  });

  it("ignores disabled variables", () => {
    const req = makeRequest({ url: "{{host}}/api" });
    const result = substituteVariables(req, [makeVar("host", "example.com", false)]);
    expect(result.url).toBe("{{host}}/api");
  });

  it("leaves null bodyRaw as null", () => {
    const req = makeRequest({ bodyRaw: null });
    const result = substituteVariables(req, [makeVar("x", "y")]);
    expect(result.bodyRaw).toBeNull();
  });

  it("leaves null bodyFormData as null", () => {
    const req = makeRequest({ bodyFormData: null });
    const result = substituteVariables(req, [makeVar("x", "y")]);
    expect(result.bodyFormData).toBeNull();
  });

  it("returns request unchanged with empty variables", () => {
    const req = makeRequest({ url: "{{host}}/api" });
    const result = substituteVariables(req, []);
    expect(result.url).toBe("{{host}}/api");
  });

  it("leaves unmatched placeholders in place", () => {
    const req = makeRequest({ url: "{{unknown}}/api" });
    const result = substituteVariables(req, [makeVar("other", "value")]);
    expect(result.url).toBe("{{unknown}}/api");
  });

  it("replaces multiple occurrences of the same variable", () => {
    const req = makeRequest({ url: "{{host}}/{{host}}" });
    const result = substituteVariables(req, [makeVar("host", "x")]);
    expect(result.url).toBe("x/x");
  });
});

import type { RequestData, EnvVariable } from "../types";

export function substituteVariables(
  request: RequestData,
  variables: EnvVariable[],
): RequestData {
  const enabledVars = variables.filter((v) => v.enabled);

  const replace = (input: string): string => {
    return enabledVars.reduce((str, v) => {
      return str.replaceAll(`{{${v.key}}}`, v.value);
    }, input);
  };

  return {
    ...request,
    url: replace(request.url),
    headers: request.headers.map((h) => ({
      ...h,
      key: replace(h.key),
      value: replace(h.value),
    })),
    queryParams: request.queryParams.map((p) => ({
      ...p,
      key: replace(p.key),
      value: replace(p.value),
    })),
    bodyRaw: request.bodyRaw ? replace(request.bodyRaw) : null,
    bodyFormData:
      request.bodyFormData?.map((f) => ({
        ...f,
        key: replace(f.key),
        value: replace(f.value),
      })) ?? null,
  };
}

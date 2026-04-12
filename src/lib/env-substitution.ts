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

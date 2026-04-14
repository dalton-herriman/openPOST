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

use serde::{Deserialize, Serialize};
use super::request::RequestData;
use super::response::ResponseData;

const REDACTED_VALUE: &str = "[REDACTED]";

const SENSITIVE_HEADERS: &[&str] = &[
    "authorization",
    "proxy-authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "api-key",
    "x-auth-token",
    "x-csrf-token",
];

fn is_sensitive_header(name: &str) -> bool {
    let lower = name.to_ascii_lowercase();
    SENSITIVE_HEADERS.iter().any(|h| *h == lower)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    pub id: String,
    pub request: RequestData,
    pub response: Option<ResponseData>,
    pub timestamp: String,
}

impl HistoryEntry {
    /// Replace values of sensitive headers with a redacted placeholder.
    /// Called before persisting so credentials never hit disk in plaintext.
    pub fn redacted(mut self) -> Self {
        for header in self.request.headers.iter_mut() {
            if is_sensitive_header(&header.key) {
                header.value = REDACTED_VALUE.to_string();
            }
        }
        if let Some(response) = self.response.as_mut() {
            for (name, value) in response.headers.iter_mut() {
                if is_sensitive_header(name) {
                    *value = REDACTED_VALUE.to_string();
                }
            }
        }
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::{BodyType, HttpMethod, KeyValuePair, RequestData};
    use crate::models::response::ResponseData;

    fn kv(key: &str, value: &str) -> KeyValuePair {
        KeyValuePair {
            id: key.into(),
            key: key.into(),
            value: value.into(),
            enabled: true,
        }
    }

    fn entry(request_headers: Vec<KeyValuePair>, response_headers: Vec<(String, String)>) -> HistoryEntry {
        HistoryEntry {
            id: "entry-1".into(),
            request: RequestData {
                id: "req-1".into(),
                name: "Test".into(),
                method: HttpMethod::Get,
                url: "https://example.com".into(),
                headers: request_headers,
                query_params: vec![],
                body_type: BodyType::None,
                body_raw: None,
                body_form_data: None,
            },
            response: Some(ResponseData {
                status: 200,
                status_text: "OK".into(),
                headers: response_headers,
                body: String::new(),
                content_type: None,
                elapsed_ms: 0,
                size_bytes: 0,
            }),
            timestamp: "2026-01-01T00:00:00Z".into(),
        }
    }

    #[test]
    fn redacts_authorization_in_request() {
        let e = entry(vec![kv("Authorization", "Bearer secret-token")], vec![]);
        let redacted = e.redacted();
        assert_eq!(redacted.request.headers[0].key, "Authorization");
        assert_eq!(redacted.request.headers[0].value, "[REDACTED]");
    }

    #[test]
    fn redacts_cookie_in_request() {
        let e = entry(vec![kv("Cookie", "session=abc123")], vec![]);
        let redacted = e.redacted();
        assert_eq!(redacted.request.headers[0].value, "[REDACTED]");
    }

    #[test]
    fn redacts_set_cookie_in_response() {
        let e = entry(vec![], vec![("Set-Cookie".into(), "session=xyz; HttpOnly".into())]);
        let redacted = e.redacted();
        let response = redacted.response.unwrap();
        assert_eq!(response.headers[0].0, "Set-Cookie");
        assert_eq!(response.headers[0].1, "[REDACTED]");
    }

    #[test]
    fn redaction_is_case_insensitive() {
        let e = entry(
            vec![kv("authorization", "Bearer x"), kv("X-API-KEY", "k")],
            vec![],
        );
        let redacted = e.redacted();
        assert_eq!(redacted.request.headers[0].value, "[REDACTED]");
        assert_eq!(redacted.request.headers[1].value, "[REDACTED]");
    }

    #[test]
    fn preserves_non_sensitive_headers() {
        let e = entry(
            vec![
                kv("Content-Type", "application/json"),
                kv("Accept", "*/*"),
                kv("Authorization", "Bearer s"),
            ],
            vec![("Content-Length".into(), "42".into())],
        );
        let redacted = e.redacted();
        assert_eq!(redacted.request.headers[0].value, "application/json");
        assert_eq!(redacted.request.headers[1].value, "*/*");
        assert_eq!(redacted.request.headers[2].value, "[REDACTED]");
        let response = redacted.response.unwrap();
        assert_eq!(response.headers[0].1, "42");
    }

    #[test]
    fn preserves_header_name_when_redacting() {
        let e = entry(vec![kv("Authorization", "Bearer s")], vec![]);
        let redacted = e.redacted();
        assert_eq!(redacted.request.headers[0].key, "Authorization");
    }

    #[test]
    fn handles_entry_without_response() {
        let mut e = entry(vec![kv("Authorization", "Bearer s")], vec![]);
        e.response = None;
        let redacted = e.redacted();
        assert_eq!(redacted.request.headers[0].value, "[REDACTED]");
        assert!(redacted.response.is_none());
    }

    #[test]
    fn redacts_all_sensitive_header_names() {
        let headers: Vec<KeyValuePair> = SENSITIVE_HEADERS
            .iter()
            .map(|name| kv(name, "secret-value"))
            .collect();
        let e = entry(headers, vec![]);
        let redacted = e.redacted();
        for header in redacted.request.headers {
            assert_eq!(header.value, "[REDACTED]", "{} was not redacted", header.key);
        }
    }
}

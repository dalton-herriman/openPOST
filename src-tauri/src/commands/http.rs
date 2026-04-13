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

use crate::models::request::{BodyType, HttpMethod, RequestData};
use crate::models::response::ResponseData;
use std::time::{Duration, Instant};

fn build_request(
    client: &reqwest::Client,
    request: &RequestData,
) -> Result<reqwest::Request, String> {
    let method = match request.method {
        HttpMethod::Get => reqwest::Method::GET,
        HttpMethod::Post => reqwest::Method::POST,
        HttpMethod::Put => reqwest::Method::PUT,
        HttpMethod::Patch => reqwest::Method::PATCH,
        HttpMethod::Delete => reqwest::Method::DELETE,
        HttpMethod::Head => reqwest::Method::HEAD,
        HttpMethod::Options => reqwest::Method::OPTIONS,
    };

    let mut req_builder = client.request(method, &request.url);

    // Add headers
    for header in &request.headers {
        if header.enabled && !header.key.is_empty() {
            req_builder = req_builder.header(&header.key, &header.value);
        }
    }

    // Add query params
    let enabled_params: Vec<(&str, &str)> = request
        .query_params
        .iter()
        .filter(|p| p.enabled && !p.key.is_empty())
        .map(|p| (p.key.as_str(), p.value.as_str()))
        .collect();
    if !enabled_params.is_empty() {
        req_builder = req_builder.query(&enabled_params);
    }

    // Add body
    match request.body_type {
        BodyType::Json => {
            if let Some(ref body) = request.body_raw {
                req_builder = req_builder
                    .header("Content-Type", "application/json")
                    .body(body.clone());
            }
        }
        BodyType::RawText => {
            if let Some(ref body) = request.body_raw {
                req_builder = req_builder.body(body.clone());
            }
        }
        BodyType::FormUrlEncoded => {
            if let Some(ref form_data) = request.body_form_data {
                let params: Vec<(&str, &str)> = form_data
                    .iter()
                    .filter(|p| p.enabled && !p.key.is_empty())
                    .map(|p| (p.key.as_str(), p.value.as_str()))
                    .collect();
                req_builder = req_builder.form(&params);
            }
        }
        BodyType::FormData => {
            if let Some(ref form_data) = request.body_form_data {
                let mut form = reqwest::multipart::Form::new();
                for pair in form_data.iter().filter(|p| p.enabled && !p.key.is_empty()) {
                    form = form.text(pair.key.clone(), pair.value.clone());
                }
                req_builder = req_builder.multipart(form);
            }
        }
        BodyType::None => {}
    }

    req_builder.build().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn send_request(request: RequestData) -> Result<ResponseData, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .connect_timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let req = build_request(&client, &request)?;

    let start = Instant::now();
    let response = client.execute(req).await.map_err(|e| e.to_string())?;
    let elapsed = start.elapsed().as_millis() as u64;

    let status = response.status().as_u16();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("Unknown")
        .to_string();
    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let headers: Vec<(String, String)> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();
    let body = response.text().await.map_err(|e| e.to_string())?;
    let size_bytes = body.len();

    Ok(ResponseData {
        status,
        status_text,
        headers,
        body,
        content_type,
        elapsed_ms: elapsed,
        size_bytes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::KeyValuePair;

    fn client() -> reqwest::Client {
        reqwest::Client::new()
    }

    fn kv(key: &str, value: &str, enabled: bool) -> KeyValuePair {
        KeyValuePair {
            id: key.to_string(),
            key: key.to_string(),
            value: value.to_string(),
            enabled,
        }
    }

    fn base_request() -> RequestData {
        RequestData {
            id: "test".into(),
            name: "Test".into(),
            method: HttpMethod::Get,
            url: "https://example.com".into(),
            headers: vec![],
            query_params: vec![],
            body_type: BodyType::None,
            body_raw: None,
            body_form_data: None,
        }
    }

    #[test]
    fn test_method_mapping() {
        let methods = vec![
            (HttpMethod::Get, "GET"),
            (HttpMethod::Post, "POST"),
            (HttpMethod::Put, "PUT"),
            (HttpMethod::Patch, "PATCH"),
            (HttpMethod::Delete, "DELETE"),
            (HttpMethod::Head, "HEAD"),
            (HttpMethod::Options, "OPTIONS"),
        ];
        let c = client();
        for (method, expected) in methods {
            let mut req = base_request();
            req.method = method;
            let built = build_request(&c, &req).unwrap();
            assert_eq!(built.method().as_str(), expected);
        }
    }

    #[test]
    fn test_url_is_set() {
        let c = client();
        let req = base_request();
        let built = build_request(&c, &req).unwrap();
        assert_eq!(built.url().as_str(), "https://example.com/");
    }

    #[test]
    fn test_enabled_headers_included() {
        let c = client();
        let mut req = base_request();
        req.headers = vec![
            kv("x-custom", "hello", true),
            kv("x-other", "world", true),
        ];
        let built = build_request(&c, &req).unwrap();
        assert_eq!(built.headers().get("x-custom").unwrap(), "hello");
        assert_eq!(built.headers().get("x-other").unwrap(), "world");
    }

    #[test]
    fn test_disabled_headers_excluded() {
        let c = client();
        let mut req = base_request();
        req.headers = vec![
            kv("x-included", "yes", true),
            kv("x-excluded", "no", false),
        ];
        let built = build_request(&c, &req).unwrap();
        assert!(built.headers().get("x-included").is_some());
        assert!(built.headers().get("x-excluded").is_none());
    }

    #[test]
    fn test_empty_key_headers_excluded() {
        let c = client();
        let mut req = base_request();
        req.headers = vec![kv("", "value", true)];
        let built = build_request(&c, &req).unwrap();
        // Only default headers from client, no custom ones
        assert!(built.headers().is_empty() || built.headers().get("").is_none());
    }

    #[test]
    fn test_query_params_appended() {
        let c = client();
        let mut req = base_request();
        req.query_params = vec![
            kv("page", "1", true),
            kv("limit", "10", true),
        ];
        let built = build_request(&c, &req).unwrap();
        let url = built.url().to_string();
        assert!(url.contains("page=1"));
        assert!(url.contains("limit=10"));
    }

    #[test]
    fn test_disabled_query_params_excluded() {
        let c = client();
        let mut req = base_request();
        req.query_params = vec![
            kv("included", "yes", true),
            kv("excluded", "no", false),
        ];
        let built = build_request(&c, &req).unwrap();
        let url = built.url().to_string();
        assert!(url.contains("included=yes"));
        assert!(!url.contains("excluded"));
    }

    #[test]
    fn test_json_body() {
        let c = client();
        let mut req = base_request();
        req.method = HttpMethod::Post;
        req.body_type = BodyType::Json;
        req.body_raw = Some(r#"{"key":"value"}"#.into());
        let built = build_request(&c, &req).unwrap();
        assert_eq!(
            built.headers().get("content-type").unwrap(),
            "application/json"
        );
        let body = built.body().unwrap().as_bytes().unwrap();
        assert_eq!(body, br#"{"key":"value"}"#);
    }

    #[test]
    fn test_raw_text_body() {
        let c = client();
        let mut req = base_request();
        req.method = HttpMethod::Post;
        req.body_type = BodyType::RawText;
        req.body_raw = Some("hello world".into());
        let built = build_request(&c, &req).unwrap();
        let body = built.body().unwrap().as_bytes().unwrap();
        assert_eq!(body, b"hello world");
    }

    #[test]
    fn test_form_urlencoded_body() {
        let c = client();
        let mut req = base_request();
        req.method = HttpMethod::Post;
        req.body_type = BodyType::FormUrlEncoded;
        req.body_form_data = Some(vec![
            kv("username", "admin", true),
            kv("password", "secret", true),
            kv("disabled", "skip", false),
        ]);
        let built = build_request(&c, &req).unwrap();
        let body = std::str::from_utf8(built.body().unwrap().as_bytes().unwrap()).unwrap();
        assert!(body.contains("username=admin"));
        assert!(body.contains("password=secret"));
        assert!(!body.contains("disabled"));
    }

    #[test]
    fn test_multipart_content_type() {
        let c = client();
        let mut req = base_request();
        req.method = HttpMethod::Post;
        req.body_type = BodyType::FormData;
        req.body_form_data = Some(vec![kv("field", "value", true)]);
        let built = build_request(&c, &req).unwrap();
        let ct = built.headers().get("content-type").unwrap().to_str().unwrap();
        assert!(ct.starts_with("multipart/form-data"));
    }

    #[test]
    fn test_none_body_has_no_body() {
        let c = client();
        let req = base_request();
        let built = build_request(&c, &req).unwrap();
        assert!(built.body().is_none());
    }

    #[test]
    fn test_json_body_none_when_body_raw_missing() {
        let c = client();
        let mut req = base_request();
        req.body_type = BodyType::Json;
        req.body_raw = None;
        let built = build_request(&c, &req).unwrap();
        assert!(built.body().is_none());
    }
}

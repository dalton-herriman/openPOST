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
use std::time::Instant;

#[tauri::command]
pub async fn send_request(request: RequestData) -> Result<ResponseData, String> {
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| e.to_string())?;

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

    let start = Instant::now();
    let response = req_builder.send().await.map_err(|e| e.to_string())?;
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

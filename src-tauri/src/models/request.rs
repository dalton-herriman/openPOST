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
use uuid::Uuid;

fn generate_id() -> String {
    Uuid::new_v4().to_string()
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Head,
    Options,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum BodyType {
    None,
    Json,
    FormData,
    RawText,
    FormUrlEncoded,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyValuePair {
    #[serde(default = "generate_id")]
    pub id: String,
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestData {
    pub id: String,
    pub name: String,
    pub method: HttpMethod,
    pub url: String,
    pub headers: Vec<KeyValuePair>,
    pub query_params: Vec<KeyValuePair>,
    pub body_type: BodyType,
    pub body_raw: Option<String>,
    pub body_form_data: Option<Vec<KeyValuePair>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_request() -> RequestData {
        RequestData {
            id: "test-id".into(),
            name: "Test".into(),
            method: HttpMethod::Get,
            url: "https://example.com".into(),
            headers: vec![],
            query_params: vec![KeyValuePair {
                id: "kv-1".into(),
                key: "page".into(),
                value: "1".into(),
                enabled: true,
            }],
            body_type: BodyType::None,
            body_raw: None,
            body_form_data: None,
        }
    }

    #[test]
    fn test_request_data_camel_case_keys() {
        let req = make_request();
        let json: serde_json::Value = serde_json::to_value(&req).unwrap();
        let obj = json.as_object().unwrap();

        // camelCase keys must be present
        assert!(obj.contains_key("queryParams"));
        assert!(obj.contains_key("bodyType"));
        assert!(obj.contains_key("bodyRaw"));
        assert!(obj.contains_key("bodyFormData"));

        // snake_case keys must NOT be present
        assert!(!obj.contains_key("query_params"));
        assert!(!obj.contains_key("body_type"));
        assert!(!obj.contains_key("body_raw"));
        assert!(!obj.contains_key("body_form_data"));
    }

    #[test]
    fn test_request_data_round_trip() {
        let req = make_request();
        let json = serde_json::to_string(&req).unwrap();
        let deserialized: RequestData = serde_json::from_str(&json).unwrap();
        assert_eq!(req, deserialized);
    }
}

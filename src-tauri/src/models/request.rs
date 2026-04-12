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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Head,
    Options,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BodyType {
    None,
    Json,
    FormData,
    RawText,
    FormUrlEncoded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyValuePair {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

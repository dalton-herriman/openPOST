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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub items: Vec<CollectionItem>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum CollectionItem {
    Request {
        id: String,
        request: RequestData,
    },
    Folder {
        id: String,
        name: String,
        items: Vec<CollectionItem>,
    },
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::{BodyType, HttpMethod};

    #[test]
    fn test_collection_item_request_tagged() {
        let item = CollectionItem::Request {
            id: "r1".into(),
            request: RequestData {
                id: "r1".into(),
                name: "Test".into(),
                method: HttpMethod::Get,
                url: "https://example.com".into(),
                headers: vec![],
                query_params: vec![],
                body_type: BodyType::None,
                body_raw: None,
                body_form_data: None,
            },
        };
        let json: serde_json::Value = serde_json::to_value(&item).unwrap();
        assert_eq!(json["type"], "request");
    }

    #[test]
    fn test_collection_item_folder_tagged() {
        let item = CollectionItem::Folder {
            id: "f1".into(),
            name: "My Folder".into(),
            items: vec![],
        };
        let json: serde_json::Value = serde_json::to_value(&item).unwrap();
        assert_eq!(json["type"], "folder");
    }
}

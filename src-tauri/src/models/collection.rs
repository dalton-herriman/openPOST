use serde::{Deserialize, Serialize};
use super::request::RequestData;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub items: Vec<CollectionItem>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

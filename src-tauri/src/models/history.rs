use serde::{Deserialize, Serialize};
use super::request::RequestData;
use super::response::ResponseData;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    pub id: String,
    pub request: RequestData,
    pub response: Option<ResponseData>,
    pub timestamp: String,
}

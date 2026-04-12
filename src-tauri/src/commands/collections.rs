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

use crate::models::collection::{Collection, CollectionItem};
use crate::models::request::RequestData;
use crate::persistence::storage::{
    delete_json_file, get_data_dir, list_json_dir, read_json_file, write_json_file,
};
use chrono::Utc;
use tauri::AppHandle;
use uuid::Uuid;

fn collections_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = get_data_dir(app)?.join("collections");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

#[tauri::command]
pub fn list_collections(app: AppHandle) -> Result<Vec<Collection>, String> {
    let dir = collections_dir(&app)?;
    let mut collections: Vec<Collection> = list_json_dir(&dir)?;
    collections.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(collections)
}

#[tauri::command]
pub fn get_collection(app: AppHandle, id: String) -> Result<Collection, String> {
    let path = collections_dir(&app)?.join(format!("{}.json", id));
    read_json_file(&path)
}

#[tauri::command]
pub fn create_collection(app: AppHandle, name: String) -> Result<Collection, String> {
    let now = Utc::now().to_rfc3339();
    let collection = Collection {
        id: Uuid::new_v4().to_string(),
        name,
        items: vec![],
        created_at: now.clone(),
        updated_at: now,
    };
    let path = collections_dir(&app)?.join(format!("{}.json", collection.id));
    write_json_file(&path, &collection)?;
    Ok(collection)
}

#[tauri::command]
pub fn update_collection(app: AppHandle, collection: Collection) -> Result<Collection, String> {
    let mut updated = collection;
    updated.updated_at = Utc::now().to_rfc3339();
    let path = collections_dir(&app)?.join(format!("{}.json", updated.id));
    write_json_file(&path, &updated)?;
    Ok(updated)
}

#[tauri::command]
pub fn delete_collection(app: AppHandle, id: String) -> Result<(), String> {
    let path = collections_dir(&app)?.join(format!("{}.json", id));
    delete_json_file(&path)
}

#[tauri::command]
pub fn create_collection_item(
    app: AppHandle,
    collection_id: String,
    request: RequestData,
) -> Result<Collection, String> {
    let path = collections_dir(&app)?.join(format!("{}.json", collection_id));
    let mut collection: Collection = read_json_file(&path)?;
    let item = CollectionItem::Request {
        id: Uuid::new_v4().to_string(),
        request,
    };
    collection.items.push(item);
    collection.updated_at = Utc::now().to_rfc3339();
    write_json_file(&path, &collection)?;
    Ok(collection)
}

#[tauri::command]
pub fn delete_collection_item(
    app: AppHandle,
    collection_id: String,
    item_id: String,
) -> Result<Collection, String> {
    let path = collections_dir(&app)?.join(format!("{}.json", collection_id));
    let mut collection: Collection = read_json_file(&path)?;
    remove_item_recursive(&mut collection.items, &item_id);
    collection.updated_at = Utc::now().to_rfc3339();
    write_json_file(&path, &collection)?;
    Ok(collection)
}

fn remove_item_recursive(items: &mut Vec<CollectionItem>, id: &str) {
    items.retain(|item| match item {
        CollectionItem::Request { id: item_id, .. } => item_id != id,
        CollectionItem::Folder { id: item_id, .. } => item_id != id,
    });
    for item in items.iter_mut() {
        if let CollectionItem::Folder { items: children, .. } = item {
            remove_item_recursive(children, id);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::{BodyType, HttpMethod, RequestData};

    fn make_request(id: &str) -> RequestData {
        RequestData {
            id: id.to_string(),
            name: "test".into(),
            method: HttpMethod::Get,
            url: "https://example.com".into(),
            headers: vec![],
            query_params: vec![],
            body_type: BodyType::None,
            body_raw: None,
            body_form_data: None,
        }
    }

    fn request_item(id: &str) -> CollectionItem {
        CollectionItem::Request {
            id: id.to_string(),
            request: make_request(id),
        }
    }

    fn folder_item(id: &str, name: &str, children: Vec<CollectionItem>) -> CollectionItem {
        CollectionItem::Folder {
            id: id.to_string(),
            name: name.to_string(),
            items: children,
        }
    }

    #[test]
    fn test_remove_top_level_request() {
        let mut items = vec![request_item("a"), request_item("b"), request_item("c")];
        remove_item_recursive(&mut items, "b");
        assert_eq!(items.len(), 2);
    }

    #[test]
    fn test_remove_top_level_folder() {
        let mut items = vec![
            folder_item("f1", "Folder", vec![]),
            request_item("r1"),
        ];
        remove_item_recursive(&mut items, "f1");
        assert_eq!(items.len(), 1);
    }

    #[test]
    fn test_remove_nested_request() {
        let mut items = vec![
            folder_item("f1", "Folder", vec![request_item("r1"), request_item("r2")]),
        ];
        remove_item_recursive(&mut items, "r1");
        assert_eq!(items.len(), 1); // folder still there
        if let CollectionItem::Folder { items: children, .. } = &items[0] {
            assert_eq!(children.len(), 1);
        } else {
            panic!("expected folder");
        }
    }

    #[test]
    fn test_remove_nonexistent_id() {
        let mut items = vec![request_item("a"), request_item("b")];
        remove_item_recursive(&mut items, "nonexistent");
        assert_eq!(items.len(), 2);
    }

    #[test]
    fn test_remove_deeply_nested() {
        let mut items = vec![
            folder_item("f1", "Outer", vec![
                folder_item("f2", "Inner", vec![request_item("deep")]),
            ]),
        ];
        remove_item_recursive(&mut items, "deep");
        // Both folders remain
        assert_eq!(items.len(), 1);
        if let CollectionItem::Folder { items: outer, .. } = &items[0] {
            assert_eq!(outer.len(), 1);
            if let CollectionItem::Folder { items: inner, .. } = &outer[0] {
                assert!(inner.is_empty());
            } else {
                panic!("expected inner folder");
            }
        } else {
            panic!("expected outer folder");
        }
    }
}

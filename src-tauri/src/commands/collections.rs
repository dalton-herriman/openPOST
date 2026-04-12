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

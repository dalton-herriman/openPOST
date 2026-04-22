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

use serde::{de::DeserializeOwned, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub fn get_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

pub fn read_json_file<T: DeserializeOwned>(path: &PathBuf) -> Result<T, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

pub fn write_json_file<T: Serialize>(path: &PathBuf, data: &T) -> Result<(), String> {
    let content = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(path, content).map_err(|e| e.to_string())
}

pub fn list_json_dir<T: DeserializeOwned>(dir: &PathBuf) -> Result<Vec<T>, String> {
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut items = Vec::new();
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            match read_json_file::<T>(&path) {
                Ok(item) => items.push(item),
                Err(err) => {
                    log::warn!(
                        "Skipping unreadable JSON file at {}: {}",
                        path.display(),
                        err
                    );
                }
            }
        }
    }
    Ok(items)
}

pub fn delete_json_file(path: &PathBuf) -> Result<(), String> {
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};
    use tempfile::TempDir;

    #[derive(Debug, PartialEq, Serialize, Deserialize)]
    struct TestItem {
        name: String,
        count: u32,
    }

    #[test]
    fn test_write_and_read_json() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("item.json");
        let item = TestItem { name: "test".into(), count: 42 };
        write_json_file(&path, &item).unwrap();
        let loaded: TestItem = read_json_file(&path).unwrap();
        assert_eq!(loaded, item);
    }

    #[test]
    fn test_read_nonexistent_file() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("nope.json");
        let result = read_json_file::<TestItem>(&path);
        assert!(result.is_err());
    }

    #[test]
    fn test_write_creates_parent_dirs() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("a").join("b").join("c").join("item.json");
        let item = TestItem { name: "nested".into(), count: 1 };
        write_json_file(&path, &item).unwrap();
        let loaded: TestItem = read_json_file(&path).unwrap();
        assert_eq!(loaded, item);
    }

    #[test]
    fn test_list_json_dir_empty() {
        let dir = TempDir::new().unwrap();
        let items: Vec<TestItem> = list_json_dir(&dir.path().to_path_buf()).unwrap();
        assert!(items.is_empty());
    }

    #[test]
    fn test_list_json_dir_with_items() {
        let dir = TempDir::new().unwrap();
        for i in 0..3 {
            let path = dir.path().join(format!("item{}.json", i));
            write_json_file(&path, &TestItem { name: format!("item{}", i), count: i }).unwrap();
        }
        // Write a non-json file that should be skipped
        fs::write(dir.path().join("readme.txt"), "not json").unwrap();

        let items: Vec<TestItem> = list_json_dir(&dir.path().to_path_buf()).unwrap();
        assert_eq!(items.len(), 3);
    }

    #[test]
    fn test_list_json_dir_skips_invalid_json_files() {
        let dir = TempDir::new().unwrap();
        write_json_file(
            &dir.path().join("valid.json"),
            &TestItem {
                name: "valid".into(),
                count: 1,
            },
        )
        .unwrap();
        fs::write(dir.path().join("invalid.json"), "{not valid json").unwrap();

        let items: Vec<TestItem> = list_json_dir(&dir.path().to_path_buf()).unwrap();
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].name, "valid");
    }

    #[test]
    fn test_list_json_dir_nonexistent() {
        let dir = TempDir::new().unwrap();
        let missing = dir.path().join("does_not_exist");
        let items: Vec<TestItem> = list_json_dir(&missing).unwrap();
        assert!(items.is_empty());
    }

    #[test]
    fn test_delete_existing_file() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("item.json");
        write_json_file(&path, &TestItem { name: "x".into(), count: 0 }).unwrap();
        assert!(path.exists());
        delete_json_file(&path).unwrap();
        assert!(!path.exists());
    }

    #[test]
    fn test_delete_nonexistent_is_ok() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("nope.json");
        assert!(delete_json_file(&path).is_ok());
    }
}

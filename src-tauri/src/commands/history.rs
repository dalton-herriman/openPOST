use crate::models::history::HistoryEntry;
use crate::persistence::storage::{get_data_dir, read_json_file, write_json_file};
use tauri::AppHandle;

const MAX_HISTORY: usize = 500;

fn history_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    Ok(get_data_dir(app)?.join("history.json"))
}

fn load_history(app: &AppHandle) -> Result<Vec<HistoryEntry>, String> {
    let path = history_path(app)?;
    if !path.exists() {
        return Ok(vec![]);
    }
    read_json_file(&path)
}

fn save_history(app: &AppHandle, history: &Vec<HistoryEntry>) -> Result<(), String> {
    let path = history_path(app)?;
    write_json_file(&path, history)
}

#[tauri::command]
pub fn list_history(app: AppHandle) -> Result<Vec<HistoryEntry>, String> {
    load_history(&app)
}

#[tauri::command]
pub fn add_history_entry(app: AppHandle, entry: HistoryEntry) -> Result<(), String> {
    let mut history = load_history(&app)?;
    history.insert(0, entry);
    if history.len() > MAX_HISTORY {
        history.truncate(MAX_HISTORY);
    }
    save_history(&app, &history)
}

#[tauri::command]
pub fn delete_history_entry(app: AppHandle, id: String) -> Result<(), String> {
    let mut history = load_history(&app)?;
    history.retain(|e| e.id != id);
    save_history(&app, &history)
}

#[tauri::command]
pub fn clear_history(app: AppHandle) -> Result<(), String> {
    save_history(&app, &vec![])
}

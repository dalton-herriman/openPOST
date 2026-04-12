use crate::models::environment::Environment;
use crate::persistence::storage::{
    delete_json_file, get_data_dir, list_json_dir, read_json_file, write_json_file,
};
use tauri::AppHandle;
use uuid::Uuid;

fn environments_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = get_data_dir(app)?.join("environments");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn settings_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    Ok(get_data_dir(app)?.join("settings.json"))
}

#[derive(serde::Serialize, serde::Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct Settings {
    active_environment_id: Option<String>,
}

fn load_settings(app: &AppHandle) -> Settings {
    let path = settings_path(app).unwrap_or_default();
    read_json_file(&path).unwrap_or_default()
}

fn save_settings(app: &AppHandle, settings: &Settings) -> Result<(), String> {
    let path = settings_path(app)?;
    write_json_file(&path, settings)
}

#[tauri::command]
pub fn list_environments(app: AppHandle) -> Result<Vec<Environment>, String> {
    let dir = environments_dir(&app)?;
    let mut envs: Vec<Environment> = list_json_dir(&dir)?;
    envs.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(envs)
}

#[tauri::command]
pub fn get_environment(app: AppHandle, id: String) -> Result<Environment, String> {
    let path = environments_dir(&app)?.join(format!("{}.json", id));
    read_json_file(&path)
}

#[tauri::command]
pub fn create_environment(app: AppHandle, name: String) -> Result<Environment, String> {
    let env = Environment {
        id: Uuid::new_v4().to_string(),
        name,
        variables: vec![],
    };
    let path = environments_dir(&app)?.join(format!("{}.json", env.id));
    write_json_file(&path, &env)?;
    Ok(env)
}

#[tauri::command]
pub fn update_environment(app: AppHandle, environment: Environment) -> Result<Environment, String> {
    let path = environments_dir(&app)?.join(format!("{}.json", environment.id));
    write_json_file(&path, &environment)?;
    Ok(environment)
}

#[tauri::command]
pub fn delete_environment(app: AppHandle, id: String) -> Result<(), String> {
    let path = environments_dir(&app)?.join(format!("{}.json", id));
    delete_json_file(&path)?;
    // Clear active if this was it
    let mut settings = load_settings(&app);
    if settings.active_environment_id.as_deref() == Some(&id) {
        settings.active_environment_id = None;
        save_settings(&app, &settings)?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_active_environment_id(app: AppHandle) -> Result<Option<String>, String> {
    Ok(load_settings(&app).active_environment_id)
}

#[tauri::command]
pub fn set_active_environment(app: AppHandle, id: Option<String>) -> Result<(), String> {
    let mut settings = load_settings(&app);
    settings.active_environment_id = id;
    save_settings(&app, &settings)
}

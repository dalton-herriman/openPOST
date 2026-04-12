mod commands;
mod models;
mod persistence;

use commands::{collections, environments, history, http};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            http::send_request,
            collections::list_collections,
            collections::get_collection,
            collections::create_collection,
            collections::update_collection,
            collections::delete_collection,
            collections::create_collection_item,
            collections::delete_collection_item,
            history::list_history,
            history::add_history_entry,
            history::delete_history_entry,
            history::clear_history,
            environments::list_environments,
            environments::get_environment,
            environments::create_environment,
            environments::update_environment,
            environments::delete_environment,
            environments::get_active_environment_id,
            environments::set_active_environment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running openPOST");
}

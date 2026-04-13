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

mod commands;
mod models;
mod persistence;

use commands::{collections, environments, history, http};

pub struct HistoryLock(pub std::sync::Mutex<()>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(HistoryLock(std::sync::Mutex::new(())))
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

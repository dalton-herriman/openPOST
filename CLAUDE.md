# openPOST

Open source, cross-platform desktop app for API testing. Like Postman without cloud integrations.

## Tech Stack

- **Backend:** Tauri v2 (Rust) — HTTP execution via `reqwest`, persistence via JSON files in OS app data dir
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (dark theme, zinc palette)
- **State:** Zustand stores
- **Editors:** CodeMirror 6 (`@uiw/react-codemirror`)
- **Layout:** `react-resizable-panels` (v4 — uses `Group`/`Separator`/`Panel`, NOT `PanelGroup`/`PanelResizeHandle`)

## Project Structure

```
src/                        # React frontend
  components/
    layout/                 # TitleBar, StatusBar
    sidebar/                # CollectionsPanel, HistoryPanel, EnvironmentsPanel
    request/                # UrlBar, RequestPanel, KeyValueEditor, BodyEditor
    response/               # ResponsePanel, ResponseBody, ResponseHeaders
    shared/                 # Tabs, EmptyState
  stores/                   # Zustand stores (request, response, collections, history, environments, ui)
  lib/                      # tauri.ts (IPC wrappers), utils.ts, env-substitution.ts
  types/                    # TypeScript interfaces mirroring Rust models
src-tauri/                  # Rust backend
  src/
    commands/               # Tauri commands: http, collections, history, environments
    models/                 # Data models: request, response, collection, environment, history
    persistence/            # JSON file read/write helpers (storage.rs)
    lib.rs                  # App entry — plugin + command registration
    main.rs                 # Desktop entry point
```

## Commands

```bash
npm run tauri dev           # Dev mode with hot reload
npx tauri build             # Production build
npx tsc --noEmit            # TypeScript type check
cargo check                 # Rust type check (run from src-tauri/)
npm test                    # Frontend unit tests (Vitest)
cd src-tauri && cargo test  # Backend unit tests
```

## Architecture Notes

- All HTTP requests go through the Rust backend (`commands/http.rs` → `reqwest`), which bypasses CORS
- Frontend never touches the filesystem directly — all persistence goes through Tauri IPC commands
- Data is stored as JSON files in the OS app data dir (`~/Library/Application Support/com.openpost.app/` on macOS)
- History is capped at 500 entries
- Environment variable substitution (`{{VAR}}`) happens on the frontend before sending to the Rust backend
- Serde uses `#[serde(rename_all = "camelCase")]` on Rust models so field names match TypeScript conventions

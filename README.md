# openPOST

Open source, cross-platform desktop app for API testing. Like Postman — without the cloud.

No accounts. No telemetry. No subscriptions. Just a fast, local tool for testing APIs.

## Features

- **HTTP Methods** — GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Request Builder** — URL bar, headers, query params, body editor (JSON, raw text, form data, URL-encoded)
- **Response Viewer** — Pretty-printed JSON/HTML/XML, response headers, status codes, timing, size
- **Collections** — Organize requests into named collections
- **Request History** — Automatically saved, searchable, persisted locally
- **Environment Variables** — Define `{{variable}}` placeholders, switch between environments
- **Resizable Panels** — Three-panel layout with draggable dividers

## Screenshots

*Coming soon*

## Install

### Download

Pre-built binaries for macOS, Windows, and Linux will be available on the [Releases](https://github.com/openPOST/openPOST/releases) page.

### Build from Source

**Prerequisites:**
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (1.77+)
- Platform-specific dependencies — see [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

```bash
git clone https://github.com/openPOST/openPOST.git
cd openPOST
npm install
npm run tauri build
```

The built app will be in `src-tauri/target/release/bundle/`.

## Development

```bash
npm install
npm run tauri dev
```

This starts Vite (hot reload) and the Tauri Rust backend. The app window opens automatically.

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm run tauri dev` | Dev mode with hot reload |
| `npm run tauri build` | Production build |
| `npx tsc --noEmit` | TypeScript type check |
| `cd src-tauri && cargo check` | Rust type check |

## Tech Stack

- **Backend:** [Tauri v2](https://v2.tauri.app/) (Rust) — HTTP via reqwest, JSON file persistence
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Code Editor:** CodeMirror 6

## Architecture

All HTTP requests execute in the Rust backend (bypassing CORS). Data is stored as JSON files in the OS app data directory — no database, no cloud, no sync.

```
src/            React frontend (components, stores, types)
src-tauri/      Rust backend (commands, models, persistence)
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

MIT

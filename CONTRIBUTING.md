# Contributing to openPOST

Thanks for your interest in contributing! openPOST is an open source project and we welcome contributions of all kinds.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/openPOST.git
   cd openPOST
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run tauri dev
   ```

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://rustup.rs/) 1.77+
- Platform-specific dependencies — see [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

## Project Structure

```
src/                    React frontend
  components/           UI components (layout, sidebar, request, response)
  stores/               Zustand state management
  lib/                  Utilities, Tauri IPC wrappers
  types/                TypeScript interfaces
src-tauri/              Rust backend
  src/commands/         Tauri commands (HTTP, collections, history, environments)
  src/models/           Data models
  src/persistence/      JSON file storage
```

## Making Changes

### Frontend (TypeScript/React)

- Components live in `src/components/`, organized by feature area
- State is managed with Zustand stores in `src/stores/`
- All Tauri IPC calls go through `src/lib/tauri.ts`
- Run `npx tsc --noEmit` to type-check before committing

### Backend (Rust)

- Tauri commands live in `src-tauri/src/commands/`
- Data models are in `src-tauri/src/models/` and use `#[serde(rename_all = "camelCase")]` to match frontend conventions
- Run `cargo check` from `src-tauri/` to verify compilation

## Pull Requests

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```
2. Make your changes
3. Verify your changes:
   ```bash
   npx tsc --noEmit              # Frontend type check
   cd src-tauri && cargo check    # Backend type check
   npm run tauri build            # Full build
   ```
4. Commit with a clear message describing what and why
5. Push to your fork and open a pull request

### PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a description of what changed and why
- Add screenshots for UI changes
- Make sure both TypeScript and Rust compile without errors

## Code Style

- **TypeScript:** Follow existing patterns. Use functional components and hooks. Prefer named exports.
- **Rust:** Follow standard Rust conventions. Use `cargo fmt` and `cargo clippy`.
- **CSS:** Use Tailwind utility classes. Avoid custom CSS unless necessary.
- **General:** No unnecessary abstractions. Keep it simple. Don't add features that weren't requested.

## Reporting Bugs

Open an issue with:

- Steps to reproduce
- Expected vs. actual behavior
- OS and app version
- Screenshots if applicable

## Feature Requests

Open an issue describing the feature, the use case, and how you envision it working. Discussion before implementation helps avoid wasted effort.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

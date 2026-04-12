# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in openPOST, please report it responsibly.

**Do not open a public issue.** Instead, email security concerns to the maintainers directly.

When reporting, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and aim to provide a fix or mitigation within 7 days for critical issues.

## Scope

openPOST is a local-first desktop application. Security considerations include:

- **Local data storage** — Collections, history, and environments are stored as JSON files in the OS app data directory. These files are not encrypted.
- **HTTP requests** — openPOST sends HTTP requests to user-specified URLs. It does not proxy requests through any third-party server.
- **No telemetry** — openPOST does not collect, transmit, or store any usage data, analytics, or crash reports.
- **No network access beyond user requests** — The app only makes network requests that the user explicitly initiates.

## Best Practices for Users

- Do not store secrets (API keys, tokens, passwords) in environment variables if your app data directory is not secured.
- Be cautious when importing collections or environments from untrusted sources.
- Keep your OS and Rust toolchain up to date when building from source.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

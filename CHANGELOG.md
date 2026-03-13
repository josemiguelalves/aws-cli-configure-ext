# Changelog

All notable changes to **AWS CLI Configure** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-01-01

### Added
- Initial release as a VS Code-compatible extension.
- Status bar item showing the currently active AWS profile.
- Command: Open `~/.aws/credentials` file.
- Command: Open `~/.aws/config` file.
- Command: Open both credentials and config files simultaneously.
- Command: Set any named profile as the `[default]` profile.
- Command: Show which named profile is mapped to `[default]`.
- Command: Copy a profile name to the clipboard.
- Command: Browse the official AWS CLI documentation.
- File system watcher — status bar updates automatically when the credentials file changes.

### Changed (from original aws-cli-configure v0.3.0)
- Replaced deprecated `opn` package with the built-in `vscode.env.openExternal` API.
- Replaced `copy-paste` package with the built-in `vscode.env.clipboard` API — no native binaries needed.
- Replaced `aws-profile-handler` (git dependency) with `ini` for direct credentials file parsing.
- Replaced `uniqid` with `Date.now()` timestamp for backup profile naming.
- Fixed a missing closing brace bug in `setDefaultProfileToCredentials`.
- Updated `activationEvents` to `onStartupFinished` (modern VS Code API).
- Bumped minimum engine version to VS Code 1.80.0.
- Added a file system watcher using `createFileSystemWatcher` instead of `onDidSaveTextDocument`.

### Security
- No longer installs native add-ons (`copy-paste` required platform binaries). All clipboard and browser operations use the VS Code built-in APIs.

# AWS CLI Configure

A VS Code-compatible extension that lets you quickly open your AWS CLI credentials and config files, and switch your active AWS profile directly from the editor — no terminal required.

This is an open-source adaptation of the original [aws-cli-configure](https://github.com/rmtuckerphx/aws-cli-configure) VS Code extension by [Mark Tucker](https://github.com/rmtuckerphx), updated and modernised to work with modern VS Code-compatible editors.

---

## Features

- **Status bar indicator** — shows the currently active AWS profile at a glance.
- **Open `~/.aws/credentials`** — jump straight to your credentials file.
- **Open `~/.aws/config`** — jump straight to your config file.
- **Open both files** — open credentials and config side-by-side in one action.
- **Set default profile** — pick any named profile from a quick-pick list and make it the `[default]` profile.
- **Copy profile name** — copy any profile name to the clipboard.
- **Browse AWS docs** — open the official AWS CLI configuration docs in your browser.

---

## Commands

All commands are available via the **Command Palette** (`Cmd/Ctrl + Shift + P`):

| Command | Description |
|---|---|
| `AWS CLI: Open 'credentials' file` | Opens `~/.aws/credentials` in the editor |
| `AWS CLI: Open 'config' file` | Opens `~/.aws/config` in the editor |
| `AWS CLI: Open 'credentials' & 'config' files` | Opens both files simultaneously |
| `AWS CLI: Set 'credentials' [default] profile to...` | Select a named profile to promote to `[default]` |
| `AWS CLI: Show [named] profile mapped to [default] in 'credentials'` | Shows which named profile is currently aliased as `[default]` |
| `AWS CLI: Copy profile name from 'credentials'...` | Copies a profile name to the clipboard |
| `AWS CLI: Browse online docs` | Opens the AWS CLI configuration docs |

---

## Status Bar

The extension adds an item to the left side of the status bar:

```
$(terminal) AWS: my-profile-name
```

- Clicking it opens the **Set default profile** quick-pick.
- The tooltip shows which named profile is currently mapped to `[default]`.

---

## How Profile Switching Works

The extension reads `~/.aws/credentials` directly using the INI format. When you set a new default profile:

1. If no `[default]` section exists, the selected profile's credentials are copied into a new `[default]` section.
2. If `[default]` already exists and is aliased to a named profile, the old default is replaced cleanly.
3. If `[default]` has no named alias (standalone default), it is backed up as `zzz-default-<timestamp>` before being replaced, so no credentials are ever silently deleted.

---

## Requirements

- [VS Code](https://code.visualstudio.com/) 1.80+ (or any compatible editor such as [Cursor](https://cursor.com), [VSCodium](https://vscodium.com/), etc.)
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured (`~/.aws/credentials` present)

---

## Installation

### From the Open VSX Registry

Search for **"AWS CLI Configure"** in your editor's Extensions panel and install.

### Manual VSIX install

1. Download the latest `.vsix` from the [Releases](https://github.com/josemiguelalves/cursor-aws-cli-configure/releases) page.
2. In your editor, open the Command Palette and run **"Extensions: Install from VSIX..."**.
3. Select the downloaded `.vsix` file.

### Build from source

```bash
git clone https://github.com/josemiguelalves/cursor-aws-cli-configure.git
cd cursor-aws-cli-configure
npm install
npm run package        # produces aws-cli-configure-ext-x.x.x.vsix
# Install the generated .vsix via "Extensions: Install from VSIX..."
```

---

## Publishing (maintainers)

### Open VSX Registry

The extension is available on [open-vsx.org](https://open-vsx.org), the open-source extension marketplace used by Cursor, VSCodium, and other VS Code-compatible editors.

#### Automated (recommended)

Push a version tag and the [GitHub Actions workflow](.github/workflows/publish-ovsx.yml) handles everything automatically:

```bash
# 1. Bump the version in package.json, then:
git add package.json
git commit -m "chore: bump version to v1.x.x"
git tag v1.x.x
git push origin main --tags
```

Prerequisites (one-time setup):
1. Create a namespace at [open-vsx.org](https://open-vsx.org) that matches `"publisher"` in `package.json` (`josemiguelalves`).
2. Generate a token at **open-vsx.org → User Settings → Access Tokens**.
3. Add it as a GitHub Actions secret named **`OVSX_TOKEN`** (repo → Settings → Secrets → Actions → New repository secret).

#### Manual

```bash
npm install
npm run package                    # builds the .vsix
OVSX_PAT=<your-token> npm run publish:ovsx
```

---

## Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m 'Add my feature'`.
4. Push and open a pull request.

Please follow the existing code style and add tests where appropriate.

---

## Credits

- Original VS Code extension: [aws-cli-configure](https://github.com/rmtuckerphx/aws-cli-configure) by [Mark Tucker](https://github.com/rmtuckerphx) — MIT License
- This adaptation: [Jose Miguel Alves](https://github.com/josemiguelalves)

---

## License

[MIT](LICENSE)

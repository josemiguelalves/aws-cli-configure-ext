// AWS CLI Configure for Cursor
// Adapted from https://github.com/rmtuckerphx/aws-cli-configure (MIT License)
// Original author: Mark Tucker (@rmtuckerphx)

const vscode = require('vscode');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { parseIni, stringifyIni, profilesEqual } = require('./helpers');

const DEFAULT_PROFILE = 'default';
let statusBar;

// ─── File paths ────────────────────────────────────────────────────────────────

function getCredentialsFilePath() {
    return path.join(os.homedir(), '.aws', 'credentials');
}

function getConfigFilePath() {
    return path.join(os.homedir(), '.aws', 'config');
}

// ─── File opening ──────────────────────────────────────────────────────────────

function openCredentialsFile(previewFlag = true) {
    openFile(getCredentialsFilePath(), previewFlag);
}

function openConfigFile(previewFlag = true) {
    openFile(getConfigFilePath(), previewFlag);
}

function openBothFiles() {
    openCredentialsFile(false);
    openConfigFile(false);
}

function openFile(filePath, previewFlag) {
    if (fs.existsSync(filePath)) {
        vscode.workspace.openTextDocument(filePath)
            .then(doc => vscode.window.showTextDocument(doc, { preview: previewFlag }));
    } else {
        vscode.window.showInformationMessage(`File '${filePath}' does not exist.`);
    }
}

function openOnlineDocs() {
    vscode.env.openExternal(
        vscode.Uri.parse('https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html')
    );
}

// ─── Credentials file parsing ─────────────────────────────────────────────────

function readCredentialsFile() {
    const filePath = getCredentialsFilePath();
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return parseIni(content);
    } catch (error) {
        console.error('Failed to parse credentials file:', error);
        return null;
    }
}

function writeCredentialsFile(data) {
    const filePath = getCredentialsFilePath();
    fs.writeFileSync(filePath, stringifyIni(data), 'utf8');
}

function listProfiles() {
    const credentials = readCredentialsFile();
    if (!credentials) return [];
    return Object.keys(credentials);
}

function getProfileCredentials(profileName) {
    const credentials = readCredentialsFile();
    if (!credentials) return null;
    return credentials[profileName] || null;
}

function addProfile(name, data) {
    const filePath = getCredentialsFilePath();
    let credentials = {};
    if (fs.existsSync(filePath)) {
        credentials = parseIni(fs.readFileSync(filePath, 'utf8'));
    }
    credentials[name] = data;
    writeCredentialsFile(credentials);
}

function deleteProfile(name) {
    const filePath = getCredentialsFilePath();
    if (!fs.existsSync(filePath)) return;
    const credentials = parseIni(fs.readFileSync(filePath, 'utf8'));
    delete credentials[name];
    writeCredentialsFile(credentials);
}

// ─── Profile logic ────────────────────────────────────────────────────────────

function getSortedProfilesCredentials(includeDefaultProfile = true) {
    const credentialsFile = getCredentialsFilePath();

    if (!fs.existsSync(credentialsFile)) {
        vscode.window.showInformationMessage(`File '${credentialsFile}' does not exist.`);
        return [];
    }

    try {
        let profiles = listProfiles();

        if (!includeDefaultProfile) {
            const index = profiles.indexOf(DEFAULT_PROFILE);
            if (index > -1) {
                profiles.splice(index, 1);
            }
        }

        return profiles.sort();
    } catch (error) {
        vscode.window.showWarningMessage(`File '${credentialsFile}' is not valid.`);
        console.error(error);
        return [];
    }
}

function getDefaultProfileSetTo() {
    let text = '<none>';
    const profiles = getSortedProfilesCredentials();
    const hasDefault = profiles.includes(DEFAULT_PROFILE);

    if (hasDefault) {
        text = DEFAULT_PROFILE;
    }

    if (hasDefault && profiles.length > 1) {
        const defaultProfile = getProfileCredentials(DEFAULT_PROFILE);

        if (defaultProfile) {
            profiles.forEach(profile => {
                if (profile !== DEFAULT_PROFILE) {
                    const candidateProfile = getProfileCredentials(profile);
                    if (profilesEqual(defaultProfile, candidateProfile)) {
                        text = profile;
                    }
                }
            });
        }
    }

    return text;
}

function getTooltipMessage() {
    const mappedProfile = getDefaultProfileSetTo();

    switch (mappedProfile) {
        case '<none>':
            return `No [default] profile in 'credentials'`;
        case DEFAULT_PROFILE:
            return `No [named] profile mapped to [default] in 'credentials'`;
        default:
            return `The [${mappedProfile}] profile is mapped to [default] in 'credentials'`;
    }
}

// ─── Active profile resolution ────────────────────────────────────────────────

function getActiveProfile() {
    return process.env.AWS_PROFILE || process.env.AWS_DEFAULT_PROFILE || 'default';
}

// ─── Status bar ───────────────────────────────────────────────────────────────

function updateStatus() {
    if (!statusBar) return;

    const active = getActiveProfile();
    statusBar.text = '$(terminal) AWS: ' + active;
    statusBar.tooltip = `Active AWS profile: ${active}`;
    statusBar.show();
}

function showDefaultProfileMapCredentials() {
    updateStatus();
    vscode.window.showInformationMessage(getTooltipMessage());
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function setDefaultProfileToCredentials() {
    const profiles = getSortedProfilesCredentials(false);

    if (profiles.length === 0) {
        vscode.window.showInformationMessage('No named profiles found in the credentials file.');
        return;
    }

    const newProfile = await vscode.window.showQuickPick(profiles, {
        placeHolder: `Select the [named] profile to set as the [default] profile in the 'credentials' file.`
    });

    if (!newProfile) return;

    const newProfileData = getProfileCredentials(newProfile);
    const mappedProfile = getDefaultProfileSetTo();

    if (mappedProfile === '<none>') {
        addProfile(DEFAULT_PROFILE, newProfileData);
    } else {
        const defaultProfileData = getProfileCredentials(DEFAULT_PROFILE);

        if (mappedProfile === DEFAULT_PROFILE) {
            // The default profile has no named alias — back it up with a timestamped name
            const generatedName = `zzz-default-${Date.now()}`;
            addProfile(generatedName, defaultProfileData);
            vscode.window.showInformationMessage(
                `The [default] profile was backed up as [${generatedName}]. Rename or delete it when no longer needed.`
            );
        }

        deleteProfile(DEFAULT_PROFILE);
        addProfile(DEFAULT_PROFILE, newProfileData);
        updateStatus();
    }

    vscode.window.showInformationMessage(
        `[default] profile in 'credentials' file set to: '${newProfile}'.`
    );
}

async function copyProfileNameCredentials() {
    const profiles = getSortedProfilesCredentials(true);

    if (profiles.length === 0) {
        vscode.window.showInformationMessage('No profiles found in the credentials file.');
        return;
    }

    const selectedProfile = await vscode.window.showQuickPick(profiles, {
        placeHolder: `Select a profile name to copy to clipboard.`
    });

    if (selectedProfile) {
        await vscode.env.clipboard.writeText(selectedProfile);
        vscode.window.setStatusBarMessage(`'${selectedProfile}' copied to clipboard.`, 10000);
    }
}

// ─── Activation ───────────────────────────────────────────────────────────────

function activate(context) {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.name = 'AWS CLI Configure';
    statusBar.command = 'aws-cli.set-default-profile.credentials';
    context.subscriptions.push(statusBar);
    updateStatus();

    const commands = [
        ['aws-cli.open.credentials', openCredentialsFile],
        ['aws-cli.open.config', openConfigFile],
        ['aws-cli.open.both', openBothFiles],
        ['aws-cli.browse.docs', openOnlineDocs],
        ['aws-cli.default.map.credentials', showDefaultProfileMapCredentials],
        ['aws-cli.set-default-profile.credentials', setDefaultProfileToCredentials],
        ['aws-cli.copy.profile.credentials', copyProfileNameCredentials],
    ];

    commands.forEach(([cmd, handler]) => {
        context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
    });

    // Watch the credentials file for external changes and refresh the status bar
    const credentialsWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(
            vscode.Uri.file(path.join(os.homedir(), '.aws')),
            'credentials'
        )
    );
    credentialsWatcher.onDidChange(() => updateStatus());
    credentialsWatcher.onDidCreate(() => updateStatus());
    credentialsWatcher.onDidDelete(() => updateStatus());
    context.subscriptions.push(credentialsWatcher);
}

function deactivate() {}

module.exports = { activate, deactivate };

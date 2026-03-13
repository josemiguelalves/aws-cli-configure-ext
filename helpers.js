// Shared helpers – usable from both the extension and the test suite
// without pulling in the 'vscode' module.

// ─── INI helpers ──────────────────────────────────────────────────────────────

function parseIni(content) {
    const result = {};
    let section = null;
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
        const sectionMatch = trimmed.match(/^\[(.+)\]$/);
        if (sectionMatch) {
            section = sectionMatch[1];
            result[section] = {};
        } else if (section) {
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                result[section][trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
            }
        }
    }
    return result;
}

function stringifyIni(data) {
    return Object.keys(data).map(section => {
        const lines = [`[${section}]`];
        for (const [key, value] of Object.entries(data[section])) {
            lines.push(`${key}=${value}`);
        }
        return lines.join('\n');
    }).join('\n\n') + '\n';
}

// ─── Profile equality helper ──────────────────────────────────────────────────

function profilesEqual(a, b) {
    if (!a || !b) return a === b;
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key, i) => keysB[i] === key && String(a[key]) === String(b[key]));
}

module.exports = { parseIni, stringifyIni, profilesEqual };

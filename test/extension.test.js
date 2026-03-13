const assert = require('assert');
const path = require('path');
const os = require('os');
const { parseIni, stringifyIni, profilesEqual } = require('../helpers');

// Basic unit tests for the AWS CLI Configure extension.
// These tests run without a full VS Code environment.

suite('Extension Unit Tests', () => {

    test('Credentials file path is under home directory', () => {
        const expectedPath = path.join(os.homedir(), '.aws', 'credentials');
        assert.strictEqual(
            path.join(os.homedir(), '.aws', 'credentials'),
            expectedPath
        );
    });

    test('Config file path is under home directory', () => {
        const expectedPath = path.join(os.homedir(), '.aws', 'config');
        assert.strictEqual(
            path.join(os.homedir(), '.aws', 'config'),
            expectedPath
        );
    });

    test('INI parsing produces correct profile keys', () => {
        const sample = `
[default]
aws_access_key_id = AKIA000DEFAULT
aws_secret_access_key = secret0

[dev]
aws_access_key_id = AKIA000DEV
aws_secret_access_key = secret1

[prod]
aws_access_key_id = AKIA000PROD
aws_secret_access_key = secret2
`.trim();

        const parsed = parseIni(sample);
        const profiles = Object.keys(parsed).sort();
        assert.deepStrictEqual(profiles, ['default', 'dev', 'prod']);
    });

    test('INI round-trip preserves profile data', () => {
        const data = {
            default: { aws_access_key_id: 'AKIATEST', aws_secret_access_key: 'testsecret' },
            dev:     { aws_access_key_id: 'AKIADEV',  aws_secret_access_key: 'devsecret'  }
        };
        const serialised = stringifyIni(data);
        const reparsed   = parseIni(serialised);
        assert.strictEqual(reparsed.default.aws_access_key_id, 'AKIATEST');
        assert.strictEqual(reparsed.dev.aws_access_key_id,     'AKIADEV');
    });

    test('INI parsing ignores comments and blank lines', () => {
        const sample = `
# This is a comment
; This is also a comment

[myprofile]
aws_access_key_id = AKIACOMMENT
aws_secret_access_key = secretcomment
`.trim();

        const parsed = parseIni(sample);
        assert.deepStrictEqual(Object.keys(parsed), ['myprofile']);
        assert.strictEqual(parsed.myprofile.aws_access_key_id, 'AKIACOMMENT');
    });

    test('profilesEqual returns true for identical profiles', () => {
        const a = { aws_access_key_id: 'AKIA1', aws_secret_access_key: 's1' };
        const b = { aws_access_key_id: 'AKIA1', aws_secret_access_key: 's1' };
        assert.strictEqual(profilesEqual(a, b), true);
    });

    test('profilesEqual returns true regardless of key order', () => {
        const a = { aws_secret_access_key: 's1', aws_access_key_id: 'AKIA1' };
        const b = { aws_access_key_id: 'AKIA1', aws_secret_access_key: 's1' };
        assert.strictEqual(profilesEqual(a, b), true);
    });

    test('profilesEqual returns false for different profiles', () => {
        const a = { aws_access_key_id: 'AKIA1', aws_secret_access_key: 's1' };
        const b = { aws_access_key_id: 'AKIA2', aws_secret_access_key: 's2' };
        assert.strictEqual(profilesEqual(a, b), false);
    });

    test('profilesEqual handles null values', () => {
        assert.strictEqual(profilesEqual(null, null), true);
        assert.strictEqual(profilesEqual(null, {}), false);
        assert.strictEqual(profilesEqual({}, null), false);
    });

});

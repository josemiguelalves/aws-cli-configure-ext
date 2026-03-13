// Test runner for the AWS CLI Configure extension.
// Runs pure-Node unit tests (test/extension.test.js) without launching
// a full VS Code host, keeping CI fast and dependency-free.
const Mocha = require('mocha');
const path  = require('path');
const fs    = require('fs');

const mocha = new Mocha({ timeout: 10000, color: true, ui: 'tdd' });


const testDir = path.join(__dirname);
fs.readdirSync(testDir)
    .filter(f => f.endsWith('.test.js'))
    .forEach(f => mocha.addFile(path.join(testDir, f)));

mocha.run(failures => {
    process.exitCode = failures ? 1 : 0;
});

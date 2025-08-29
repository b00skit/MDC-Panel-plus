const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'data');
const destDir = path.resolve(__dirname, '..', 'public', 'data');

fs.rmSync(destDir, { recursive: true, force: true });
fs.cpSync(srcDir, destDir, { recursive: true });

console.log(`Copied data from ${srcDir} to ${destDir}`);


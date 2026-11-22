#!/usr/bin/env node
// Bumps every local "?v=N" cache-busting query in index.html to (highest N) + 1.
// Usage: node tools/bump-version.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const pattern = /((?:src|href)="(?!https?:)[^"?]+\.(?:js|css))\?v=(\d+)"/g;

const versions = [...html.matchAll(pattern)].map(m => Number(m[2]));
if (versions.length === 0) {
    console.error('No "?v=" references found in index.html');
    process.exit(1);
}
const next = Math.max(...versions) + 1;
fs.writeFileSync(file, html.replace(pattern, `$1?v=${next}"`));
console.log(`Updated ${versions.length} references to ?v=${next}`);

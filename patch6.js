const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

// Find the Save button
const idx = content.indexOf('btnHeaderGhost}>Save');
console.log('Around Save button:');
console.log(JSON.stringify(content.slice(idx - 30, idx + 300)));

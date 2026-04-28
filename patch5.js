const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const idx = content.indexOf('saveSession');
console.log('Around saveSession:');
console.log(JSON.stringify(content.slice(idx - 20, idx + 200)));

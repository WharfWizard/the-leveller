const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Find fileRef2 context
const idx = content.indexOf('fileRef2');
if (idx > -1) {
  console.log('Context around fileRef2:');
  console.log(JSON.stringify(content.slice(idx - 50, idx + 150)));
}

// Also search for Load text
const idx2 = content.indexOf('>Load<');
if (idx2 > -1) {
  console.log('Context around Load button:');
  console.log(JSON.stringify(content.slice(idx2 - 100, idx2 + 50)));
}

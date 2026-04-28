const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

// Check Reset button
const resetIdx = content.indexOf('Reset');
if (resetIdx > -1) {
  console.log('RESET CONTEXT:');
  console.log(JSON.stringify(content.slice(resetIdx - 50, resetIdx + 150)));
} else {
  console.log('NO RESET FOUND');
}

// Check expRaw
const expIdx = content.indexOf('expRaw');
if (expIdx > -1) {
  console.log('\nEXPRAW CONTEXT:');
  console.log(JSON.stringify(content.slice(expIdx - 10, expIdx + 150)));
} else {
  console.log('\nNO EXPRAW FOUND');
}

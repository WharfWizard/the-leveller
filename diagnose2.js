const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

// Check Reset onClick
const resetIdx = content.indexOf('>Reset<');
console.log('Reset button onClick:');
console.log(JSON.stringify(content.slice(resetIdx - 120, resetIdx + 20)));

// Check git status
const { execSync } = require('child_process');
try {
  console.log('\nGit log:');
  console.log(execSync('git log --oneline -3').toString());
  console.log('Git status:');
  console.log(execSync('git status').toString());
} catch(e) { console.log(e.message); }

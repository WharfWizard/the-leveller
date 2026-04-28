const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
let changes = 0;

// Fix 1: expRaw
const exp1 = "const expLines = doc.splitTextToSize(f.explanation || '', textW)";
const exp2 = "const expRaw = (f.explanation || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const expLines = doc.splitTextToSize(expRaw, textW)";
if (content.includes(exp1)) { content = content.replace(exp1, exp2); changes++; console.log('Fix 1: expRaw applied'); }
else console.log('Fix 1: already applied');

// Fix 2: clauseRaw
const cl1 = "const clauseLines = f.clause ? doc.splitTextToSize('\"' + f.clause + '\"', textW - 4) : []";
const cl2 = "const clauseRaw = (f.clause || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const clauseLines = clauseRaw ? doc.splitTextToSize('\"' + clauseRaw + '\"', textW - 4) : []";
if (content.includes(cl1)) { content = content.replace(cl1, cl2); changes++; console.log('Fix 2: clauseRaw applied'); }
else console.log('Fix 2: already applied');

// Fix 3: legalRaw
const leg1 = "const legalLines = f.legalContext ? doc.splitTextToSize('\u2696 ' + f.legalContext, textW) : []";
const leg2 = "const legalRaw = (f.legalContext || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const legalLines = legalRaw ? doc.splitTextToSize('\u2696 ' + legalRaw, textW) : []";
if (content.includes(leg1)) { content = content.replace(leg1, leg2); changes++; console.log('Fix 3: legalRaw applied'); }
else console.log('Fix 3: already applied');

// Fix 4: Reset button - using btnHeaderGhost
const loadBtn = '<button onClick={() => fileRef2.current?.click()} style={btnHeaderGhost}>Load</button>';
const resetBtn = '\n              <button onClick={() => { setResult(null); setContractText(\'\'); setPages([]); setStatusMsg(\'\'); setContractType(\'\'); setInstitution(\'\'); }} style={{ ...btnHeaderGhost, color: \'#ff6b6b\' }}>Reset</button>';
if (content.includes(loadBtn) && !content.includes('Reset')) {
  content = content.replace(loadBtn, loadBtn + resetBtn);
  changes++; console.log('Fix 4: Reset button applied');
} else if (content.includes('Reset')) {
  console.log('Fix 4: Reset already present');
} else {
  console.log('Fix 4: Load button not found - searching...');
  const idx = content.indexOf('fileRef2');
  if (idx > -1) console.log('Context:', JSON.stringify(content.slice(idx-20, idx+80)));
}

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Total changes:', changes);

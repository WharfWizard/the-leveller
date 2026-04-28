const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Fix 1-3: PDF text cleaning
const exp1 = "const expLines = doc.splitTextToSize(f.explanation || '', textW)";
const exp2 = "const expRaw = (f.explanation || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const expLines = doc.splitTextToSize(expRaw || ' ', textW)";
if (content.includes(exp1)) { content = content.replace(exp1, exp2); console.log('Fix 1 applied'); }
else console.log('Fix 1 already done');

const cl1 = "const clauseLines = f.clause ? doc.splitTextToSize('\"' + f.clause + '\"', textW - 4) : []";
const cl2 = "const clauseRaw = (f.clause || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const clauseLines = clauseRaw ? doc.splitTextToSize('\"' + clauseRaw + '\"', textW - 4) : []";
if (content.includes(cl1)) { content = content.replace(cl1, cl2); console.log('Fix 2 applied'); }
else console.log('Fix 2 already done');

const leg1 = "const legalLines = f.legalContext ? doc.splitTextToSize('\u2696 ' + f.legalContext, textW) : []";
const leg2 = "const legalRaw = (f.legalContext || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const legalLines = legalRaw ? doc.splitTextToSize('\u2696 ' + legalRaw, textW) : []";
if (content.includes(leg1)) { content = content.replace(leg1, leg2); console.log('Fix 3 applied'); }
else console.log('Fix 3 already done');

// Fix 4: Reset button - insert after the Load label
const loadLabel = "<label style={{ ...btnHeaderGhost, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>\n            Load\n            <input type=\"file\" accept=\".json\" style={{ display: 'none' }} onChange={loadSession} />\n          </label>";
const resetBtn = "\n          <button onClick={() => { setResult(null); setContractText(''); setPages([]); setStatusMsg(''); setContractType(''); setInstitution(''); }} style={{ ...btnHeaderGhost, color: '#ff6b6b' }}>Reset</button>";

if (content.includes(loadLabel) && !content.includes('>Reset<')) {
  content = content.replace(loadLabel, loadLabel + resetBtn);
  console.log('Fix 4: Reset button added');
} else if (content.includes('>Reset<')) {
  console.log('Fix 4: Reset already present');
} else {
  console.log('Fix 4: Label not found');
}

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Done');

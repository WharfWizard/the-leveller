const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
let changes = 0;

// Fix 1: expRaw
if (content.includes("const expLines = doc.splitTextToSize(f.explanation || '', textW)")) {
  content = content.replace(
    "const expLines = doc.splitTextToSize(f.explanation || '', textW)",
    "const expRaw = (f.explanation || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const expLines = doc.splitTextToSize(expRaw, textW)"
  );
  changes++;
  console.log('Fix 1 applied: expRaw');
} else {
  console.log('Fix 1 already applied or not found');
}

// Fix 2: clauseRaw
if (content.includes("const clauseLines = f.clause ? doc.splitTextToSize('\"' + f.clause + '\"', textW - 4) : []")) {
  content = content.replace(
    "const clauseLines = f.clause ? doc.splitTextToSize('\"' + f.clause + '\"', textW - 4) : []",
    "const clauseRaw = (f.clause || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const clauseLines = clauseRaw ? doc.splitTextToSize('\"' + clauseRaw + '\"', textW - 4) : []"
  );
  changes++;
  console.log('Fix 2 applied: clauseRaw');
} else {
  console.log('Fix 2 already applied or not found');
}

// Fix 3: legalRaw
if (content.includes("const legalLines = f.legalContext ? doc.splitTextToSize('\u2696 ' + f.legalContext, textW) : []")) {
  content = content.replace(
    "const legalLines = f.legalContext ? doc.splitTextToSize('\u2696 ' + f.legalContext, textW) : []",
    "const legalRaw = (f.legalContext || '').replace(/&[^a-zA-Z]*/g, '').trim()\n      const legalLines = legalRaw ? doc.splitTextToSize('\u2696 ' + legalRaw, textW) : []"
  );
  changes++;
  console.log('Fix 3 applied: legalRaw');
} else {
  console.log('Fix 3 already applied or not found');
}

// Fix 4: Reset button - find Save button and add Reset after Load
const saveBtn = '<button onClick={saveSession} style={btnOutline}>Save</button>';
const loadBtn = '<button onClick={() => fileRef2.current?.click()} style={btnOutline}>Load</button>';
if (content.includes(loadBtn) && !content.includes('Reset')) {
  content = content.replace(
    loadBtn,
    loadBtn + '\n              <button onClick={() => { setResult(null); setContractText(\'\'); setPages([]); setStatusMsg(\'\'); setContractType(\'\'); setInstitution(\'\'); }} style={{ ...btnOutline, color: \'#c0392b\', borderColor: \'#c0392b\' }}>Reset</button>'
  );
  changes++;
  console.log('Fix 4 applied: Reset button');
} else {
  console.log('Fix 4: Reset already present or Load button not found');
}

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Total changes:', changes);

const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
let changes = 0;

// Fix Reset button - should reload the page
const oldReset = "onClick={() => { setResult(null); setContractText(''); setPages([]); setStatusMsg(''); setContractType(''); setInstitution(''); }}";
const newReset = "onClick={() => window.location.reload()}";
if (content.includes(oldReset)) {
  content = content.replace(oldReset, newReset);
  changes++;
  console.log('Fix 1: Reset button fixed');
} else {
  console.log('Fix 1: Reset onClick not found');
}

// Fix PDF & regex - the em dash after & is a unicode character, use a broader regex
const oldExpRaw = "const expRaw = (f.explanation || '').replace(/&[^a-zA-Z]*/g, '').trim()";
const newExpRaw = "const expRaw = (f.explanation || '').split(/&[\\s\\S]{0,3}[\u2013\u2014\\-]/).map(s => s.trim()).join(' ').trim()";
if (content.includes(oldExpRaw)) {
  content = content.replace(oldExpRaw, newExpRaw);
  changes++;
  console.log('Fix 2: expRaw regex fixed');
} else {
  console.log('Fix 2: expRaw pattern not found');
}

const oldClauseRaw = "const clauseRaw = (f.clause || '').replace(/&[^a-zA-Z]*/g, '').trim()";
const newClauseRaw = "const clauseRaw = (f.clause || '').split(/&[\\s\\S]{0,3}[\u2013\u2014\\-]/).map(s => s.trim()).join(' ').trim()";
if (content.includes(oldClauseRaw)) {
  content = content.replace(oldClauseRaw, newClauseRaw);
  changes++;
  console.log('Fix 3: clauseRaw regex fixed');
} else {
  console.log('Fix 3: clauseRaw pattern not found');
}

const oldLegalRaw = "const legalRaw = (f.legalContext || '').replace(/&[^a-zA-Z]*/g, '').trim()";
const newLegalRaw = "const legalRaw = (f.legalContext || '').split(/&[\\s\\S]{0,3}[\u2013\u2014\\-]/).map(s => s.trim()).join(' ').trim()";
if (content.includes(oldLegalRaw)) {
  content = content.replace(oldLegalRaw, newLegalRaw);
  changes++;
  console.log('Fix 4: legalRaw regex fixed');
} else {
  console.log('Fix 4: legalRaw pattern not found');
}

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Total changes:', changes);

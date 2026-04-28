const fs = require('fs');

const content = fs.readFileSync('src/App.jsx', 'utf8');

const old = "Look for: hidden commissions, unfair terms, asymmetric rights, data sharing, liability exclusions, arbitration waivers, auto-renewal traps. Be on the side of the individual.";

const updated = "Look for: hidden commissions, unfair terms, asymmetric rights, data sharing, liability exclusions, arbitration waivers, auto-renewal traps. Be on the side of the individual. MORTGAGES — always flag as HIGH RISK: transfer/securitisation clauses allowing mortgage rights to transfer to any person without borrower consent or notice (condition 15-style); unilateral interest rate variation; offset/set-off of savings against mortgage debt; receiver appointment rights; broad expense recovery; insurance control at borrower expense.";

if (content.includes(old)) {
    fs.writeFileSync('src/App.jsx', content.replace(old, updated), 'utf8');
    console.log('SUCCESS - securitisation risk added');
} else {
    console.log('ERROR - text not found');
    const idx = content.indexOf('Be on the side');
    if (idx > -1) console.log('Nearby:', JSON.stringify(content.slice(idx-20, idx+80)));
}

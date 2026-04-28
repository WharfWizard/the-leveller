import re

with open(r'src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = "Look for: hidden commissions, unfair terms, asymmetric rights, data sharing, liability exclusions, arbitration waivers, auto-renewal traps. Be on the side of the individual."

new = "Look for: hidden commissions, unfair terms, asymmetric rights, data sharing, liability exclusions, arbitration waivers, auto-renewal traps. Be on the side of the individual. MORTGAGES — always flag as HIGH RISK: transfer/securitisation clauses allowing mortgage rights to transfer to any person without borrower consent or notice (condition 15-style); unilateral interest rate variation; offset/set-off of savings against mortgage debt; receiver appointment rights; broad expense recovery; insurance control at borrower expense."

if old in content:
    content = content.replace(old, new)
    with open(r'src\App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS - securitisation risk added")
else:
    print("ERROR - text not found")
    # Show what's near the system prompt
    idx = content.find("Be on the side of the individual")
    if idx > -1:
        print("Found nearby text:")
        print(repr(content[idx-50:idx+100]))

import { useState, useRef } from 'react'

// ─── Contract type registry ───────────────────────────────────────────────────
const CONTRACT_TYPES = [
  { value: '', label: 'Select contract type…' },
  { group: 'Financial — Borrowing', items: [
    { value: 'motor_finance', label: 'Motor finance (PCP / HP / personal loan)' },
    { value: 'personal_loan', label: 'Personal loan / payday loan' },
    { value: 'credit_card', label: 'Credit card agreement' },
    { value: 'mortgage', label: 'Mortgage' },
    { value: 'secured_loan', label: 'Secured loan / second charge' },
    { value: 'buy_now_pay_later', label: 'Buy now, pay later (BNPL)' },
  ]},
  { group: 'Financial — Investment & Savings', items: [
    { value: 'investment_product', label: 'Investment product / fund' },
    { value: 'pension', label: 'Pension / SIPP / transfer' },
    { value: 'structured_product', label: 'Structured product / bond' },
    { value: 'isa', label: 'ISA / savings account' },
  ]},
  { group: 'Financial — Protection', items: [
    { value: 'insurance_general', label: 'Insurance (home / car / travel)' },
    { value: 'life_insurance', label: 'Life insurance / critical illness' },
    { value: 'income_protection', label: 'Income protection / PPI' },
    { value: 'private_healthcare', label: 'Private healthcare / dental plan' },
  ]},
  { group: 'Property & Housing', items: [
    { value: 'tenancy', label: 'Tenancy / rental agreement' },
    { value: 'leasehold', label: 'Leasehold / service charge agreement' },
    { value: 'property_purchase', label: 'Property purchase / conveyancing' },
  ]},
  { group: 'Utilities & Services', items: [
    { value: 'energy', label: 'Energy / gas / electricity' },
    { value: 'telecoms', label: 'Telecoms / broadband / mobile' },
    { value: 'subscription', label: 'Subscription / membership' },
    { value: 'gym', label: 'Gym / fitness membership' },
    { value: 'platform_terms', label: 'Platform / app / website terms and conditions' },
  ]},
  { group: 'Employment', items: [
    { value: 'employment', label: 'Employment contract' },
    { value: 'zero_hours', label: 'Zero hours / gig economy contract' },
    { value: 'settlement', label: 'Settlement / compromise agreement' },
    { value: 'consultancy', label: 'Consultancy / freelance contract' },
  ]},
{ group: 'Legal & Claims', items: [
    { value: 'legal_services_cfa', label: 'Legal services agreement / Conditional Fee Agreement (CFA)' },
    { value: 'claims_management', label: 'Claims management / no win no fee' },
  ]},
  { group: 'Guarantees & Insurance-Backed', items: [
    { value: 'insurance_backed_guarantee', label: 'Insurance-backed guarantee (IBG)' },
    { value: 'warranty_guarantee', label: 'Warranty / manufacturer guarantee' },
    { value: 'home_improvement_warranty', label: 'Home improvement / retrofit warranty' },
  ]},
  { group: 'Home Improvement', items: [
    { value: 'home_improvement', label: 'Home improvement / retrofit contract' },
    { value: 'solar_panels', label: 'Solar panels / heat pump / green energy' },
    { value: 'cavity_wall_insulation', label: 'Cavity wall / insulation contract' },
  ]},
  { group: 'Legal & Post-Harm', items: [
    { value: 'settlement_assignment', label: 'Settlement agreement / assignment of rights' },
    { value: 'complaints_redress', label: 'Complaints, redress & arbitration scheme' },
    { value: 'subrogation_recovery', label: 'Subrogation, assignment & insurer recovery' },
  ]},
  { group: 'Other', items: [
    { value: 'general', label: 'Other / general terms and conditions' },
  ]},
]

const SEV = {
  high:       { label: 'High risk',   bg: '#fdf0ef', color: '#c0392b' },
  medium:     { label: 'Medium risk', bg: '#fef4e8', color: '#b7560a' },
  low:        { label: 'Low risk',    bg: '#edf7ee', color: '#2e7d32' },
  commission: { label: 'Hidden cost', bg: '#e8f1fb', color: '#0a4d8c' },
}

const VERDICT_STYLE = {
  sign:      { bg: '#edf7ee', color: '#2e7d32', icon: '✓' },
  negotiate: { bg: '#fef4e8', color: '#b7560a', icon: '⚠' },
  dontsign:  { bg: '#fdf0ef', color: '#c0392b', icon: '✕' },
}

function getSpecialistGuidance(contractType) {
  const t = contractType || '';
  
  if (t === 'legal_services_cfa' || t === 'claims_management') {
    return `SPECIALIST GUIDANCE - LEGAL SERVICES / CFA / CLAIMS MANAGEMENT:
Flag contingency fee percentages, monitoring fees, referral arrangements, conflicts of interest between introducer/solicitor/funder, termination rights, exposure to opponent costs, assignment clauses, and multi-party dependency risks. HIGH RISK: Luxembourg or offshore assignment arrangements, funder dependency, insurer dependency.
MISSING SCHEDULES: If the CFA references Schedule 1 (success fee), Schedule 2 (basic charges), or any other schedule not present, flag this as a gap. Recommend uploading the complete pack before relying on this analysis.
ATE INSURANCE GAPS: (a) Scheme-level premium dependency - cover outside individual control. (b) Staged indemnity limits vs real adverse-cost exposure. (c) Struck-out/procedural failure exclusion. (d) CFA/solicitor dependency - cover ends if CFA terminates or solicitor changes. (e) Estates SA dependency - flag as HIGH RISK if ATE proceeds payable to offshore entity, name it explicitly.
ASSIGNMENT/OFFSHORE: Scan the ENTIRE document pack for Forms of Assignment, ATE schedules, funding agreements. Always check for Estates SA, Luxembourg references, onward transfer without consent. HIGH RISK: assignment to offshore entities, SPVs, funder substitution clauses. Explain that offshore assignment removes UK regulatory protection.`;
  }
  
  if (t === 'insurance_backed_guarantee' || t === 'home_improvement_warranty' || t === 'warranty_guarantee') {
    return `SPECIALIST GUIDANCE - INSURANCE-BACKED GUARANTEE / WARRANTY:
LIABILITY GAP (critical): Identify both headline limit AND installation/contract value. When policy uses "Contract Value or £X, whichever is the lesser" - state explicitly that practical cap is the installation value, NOT the headline figure. State this plainly - do not leave implicit. Flag as HIGH RISK.
CEASED-TO-TRADE TRIGGER GAP (high risk): Flag narrow legal definition (liquidation, receivership, administration, strike-off). Identify the dangerous gap where installer is distressed/unresponsive but not formally ceased trading - no IBG protection during this period.
MULTI-PARTY ECOSYSTEM (high risk): Identify every named party - installer, manufacturer, administrator, insurer. Flag administrator specifically as dependency risk. Fragmented responsibility = multiple failure points.
HOMEOWNER INVESTIGATION BURDEN (medium risk): Flag procedural requirements placing investigation burden on homeowner before guarantor becomes involved. These barriers prevent legitimate claims.
GUARANTOR DISCRETION (medium risk): Flag sole discretion over investigation and remedial action with no independent oversight.
MAINTENANCE CONDITIONS: Vague requirements = subjective escape clauses.
ARBITRATION: Always flag mandatory arbitration as HIGH RISK.
CONSUMER REDRESS ROUTES: Always include Citizens Advice, Trading Standards, Financial Ombudsman, independent legal advice.
Central question: not only what does the guarantee promise, but how accessible is redress when something goes wrong?`;
  }
  
  if (t === 'cavity_wall_insulation' || t === 'home_improvement' || t === 'solar_panels') {
    return `SPECIALIST GUIDANCE - HOME IMPROVEMENT / CAVITY WALL / RETROFIT:
Flag deposit terms, staged payments, guarantees offered vs actual regulatory backing, right to cancel under Consumer Contracts Regulations 2013, installer insolvency risk.
CIGA/BUFCA: Flag guarantee coverage gaps, BUFCA insurance limitations, multi-party ecosystem risk, ceased-to-trade trigger gap, liability cap vs installation value.`;
  }
  
  if (t === 'settlement_assignment') {
    return `SPECIALIST GUIDANCE - SETTLEMENT AGREEMENT / ASSIGNMENT OF RIGHTS:
This document arises after harm. The consumer is surrendering rights for compensation.
RIGHTS SURRENDERED (critical): Every right assigned, waived, or released - third-party claims, future claims, regulatory complaints. Explain in plain English what the consumer loses.
FULL AND FINAL RELEASE: Flag if expressed as full and final. Signing may prevent any future claim.
CONFIDENTIALITY TRAP (high risk): Clauses preventing discussion, advice-seeking, or complaints isolate the consumer at the most critical moment.
LEGAL PRIVILEGE WAIVER: Flag any waiver of legal professional privilege.
FAIR VALUE: Flag whether independent advice on compensation value has been offered.
GLOBAL SETTLEMENT DEPENDENCY: Individual recovery depending on group structure limits individual choice.
QUESTIONS: What rights am I giving up, what future claims am I releasing, can I seek independent advice, is the confidentiality clause enforceable, what happens if further harm emerges.`;
  }
  
  if (t === 'complaints_redress') {
    return `SPECIALIST GUIDANCE - COMPLAINTS / REDRESS / ARBITRATION SCHEME:
This asks: what remedy can I realistically obtain? Not: what am I signing?
REMEDIES AVAILABLE VS EXCLUDED (critical): Every remedy available and every remedy excluded. Flag exclusions of consequential losses, distress, losses above scheme cap.
GUARANTEE CAP DEPENDENCY (high risk): Maximum award capped by underlying guarantee/insurance - even a win may be limited to the guarantee cap not actual losses.
ACCESS GATEKEEPING (high risk): Multi-step referral requirements - identify every gatekeeper and explain each is a potential access barrier.
REGISTRATION FEES: State consumer fee explicitly. Flag asymmetry if business pays different fee.
ENFORCEMENT GAP (high risk): If scheme cannot enforce awards or impose penalties, consumer may still need court proceedings.
COST RECOVERY: Can consumer recover legal costs, expert fees, investigation costs?
ACCESSIBILITY: Is this realistically accessible without legal representation?
NON-PRECEDENT: Flag if decisions are confidential or non-precedent setting.`;
  }
  
  if (t === 'subrogation_recovery') {
    return `SPECIALIST GUIDANCE - SUBROGATION / INSURER RECOVERY / POST-CLAIM COMMUNICATION:
This document arises after harm. An insurer/funder is recovering its own outlay. Consumer may have uninsured losses.
RIGHTS BEING TAKEN OVER (critical): Precisely which rights is the insurer asserting/subrogating. What does this mean for the consumer.
CONFLICT OF INTEREST (high risk): Insurer recovery action may conflict with consumer's uninsured losses. Insurer acts in its own interest.
CONSUMER OBLIGATIONS: Cooperation requirements, information provision, attendance at proceedings.
UNINSURED LOSSES GAP: Flag losses outside the recovery action with no funded redress route.
SUPPORT GAP: Flag explicitly where document advises seeking legal advice but provides no funded route to it.
NOTE: For post-harm communications not requiring signature, change "Questions to ask before signing" to "Questions to ask before taking action."`;
  }
  
  if (t === 'mortgage' || t === 'secured_loan') {
    return `SPECIALIST GUIDANCE - MORTGAGE / SECURED LOAN:
1. TRANSFER/SECURITISATION (HIGH RISK): Any clause allowing lender to transfer mortgage rights without borrower consent/notice. Condition 15-style language. Includes SPVs. Borrower remains bound while ownership changes silently.
2. UNILATERAL RATE VARIATION: Broad discretion to change rates for "any other valid reason"
3. OFFSET/SET-OFF (HIGH RISK): Right to seize borrower savings to reduce mortgage debt without court order
4. RECEIVER APPOINTMENT: Broad rights to appoint receiver and manage property
5. EXPENSE RECOVERY: Borrower liable for all lender costs
6. INSURANCE CONTROL: Lender arranging insurance at borrower expense`;
  }
  
  if (t === 'motor_finance') {
    return `SPECIALIST GUIDANCE - MOTOR FINANCE:
Flag DCA commission patterns, rate markup, GAP insurance, return condition penalties, balloon payment exposure, early settlement penalties, PCP vs HP vs personal loan risk differences.`;
  }
  
  if (t === 'pension' || t === 'investment_product' || t === 'structured_product') {
    return `SPECIALIST GUIDANCE - PENSION / INVESTMENT:
Flag Malta/QROPS transfers, undisclosed remuneration, unsuitable risk profiling, lock-in periods, early exit penalties, offshore custody risk.`;
  }
  
  if (t === 'platform_terms') {
    return `SPECIALIST GUIDANCE - PLATFORM / DIGITAL TERMS:
Flag broad content licences granted to the platform without additional consent, unilateral right to change terms without prior notice, account suspension or termination without appeal, data sharing with third parties and affiliates, liability caps set at zero or nominal amounts, mandatory arbitration and class action waivers, governing law in foreign jurisdictions, auto-renewal and cancellation barriers, algorithmic decision-making with no human review route. Under UK Consumer Rights Act 2015 and GDPR, many such terms may be unenforceable.`;
  }

  return '';
}

function buildSystemPrompt(contractType, institution) {
  const specialist = getSpecialistGuidance(contractType);
  return `You are The Leveller, an expert UK consumer rights and contract law analyst for Get SAFE (Support After Financial Exploitation). You create information symmetry between individuals and institutions.
${contractType ? 'Contract type: '+contractType+'.' : ''} ${institution ? 'Institution: '+institution+'.' : ''}

Return ONLY valid JSON, no markdown fences, no preamble. Never truncate mid-sentence.

EXPLANATION QUALITY: Each explanation must be 4-6 sentences: (1) what the clause does in plain English, (2) why it is a risk, (3) practical consequence if triggered, (4) specific consumer protection undermined, (5) what the individual loses vs their default legal position.

LEGAL CONTEXT: 1-2 sentences naming the specific UK law or regulation that applies.

${specialist ? specialist + '\n\n' : ''}CLAUSE: Direct verbatim quote from the contract, under 200 chars.

SCORING: Start at 100. Deduct 25-35 per HIGH RISK, 10-15 per MEDIUM RISK, 3-7 per LOW RISK.
scoreLabel: 0-20="Highly Unfair", 21-40="Unfair", 41-60="Risky", 61-75="Needs Review", 76-90="Generally Fair", 91-100="Fair"

${`{"contractType":"","fairnessScore":0,"scoreLabel":"","verdict":"","verdictLevel":"sign|negotiate|dontsign","summary":"","powerBalance":"","redFlags":[{"severity":"high|medium|low|commission","title":"","explanation":"","clause":"","legalContext":""}],"hiddenCosts":[{"item":"","detail":""}],"questions":[],"negotiationPoints":[],"regulatoryRedress":[],"strategicAdvice":""}`}

General risks: hidden commissions, unfair terms, asymmetric rights, data sharing, liability exclusions, arbitration waivers, auto-renewal traps, early exit penalties, balloon payments.
Be unequivocally on the side of the individual.`
}
async function callLeveller(messages, contractType, institution) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: buildSystemPrompt(contractType, institution),
      messages,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'API error')
  const raw = data.content.map(b => b.text || '').join('')
  // Strip markdown code fences robustly
  const clean = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
  return JSON.parse(clean)
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = () => rej(new Error('Read failed'))
    r.readAsDataURL(file)
  })
}

function compressImage(file, maxWidth=1600, quality=0.7) {
  return new Promise((res) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth }
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        res(dataUrl)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function scoreColor(s) { return s >= 70 ? '#2e7d32' : s >= 40 ? '#b7560a' : '#c0392b' }
function scoreBg(s)    { return s >= 70 ? '#edf7ee' : s >= 40 ? '#fef4e8' : '#fdf0ef' }

// ─── Get SAFE Logo ────────────────────────────────────────────────────────────
function GetSafeLogo({ size = 44 }) {
  return (
    <img
      src="/get-safe-logo.png"
      alt="Get SAFE"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

// ─── Components ───────────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const s = SEV[severity] || SEV.low
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 4,
      background: s.bg, color: s.color, textTransform: 'uppercase',
      letterSpacing: '0.5px', whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

function FlagCard({ flag }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid #e0e6ed', borderRadius: 10, marginBottom: 10, background: '#fff', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none',
        border: 'none', display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
      }}>
        <SeverityBadge severity={flag.severity} />
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#00274d', fontFamily: "'Poppins',sans-serif", lineHeight: 1.4 }}>
          {flag.title}
        </span>
        <span style={{ color: '#555', fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #e0e6ed' }}>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.75, marginTop: 10 }}>{flag.explanation}</p>
          {flag.clause && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#f5f7fa', borderRadius: 6, borderLeft: '3px solid #ffc72c', fontSize: 13, color: '#555', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{flag.clause}"
            </div>
          )}
          {flag.legalContext && (
            <p style={{ marginTop: 8, fontSize: 12, color: '#0a4d8c', lineHeight: 1.6 }}>⚖ {flag.legalContext}</p>
          )}
        </div>
      )}
    </div>
  )
}

function PageThumb({ page, index, onRemove }) {
  return (
    <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid #e0e6ed', aspectRatio: '3/4', background: '#f5f7fa' }}>
      <img src={page.dataUrl} alt={`Page ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 11, fontWeight: 700, background: 'rgba(0,39,77,0.75)', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>p.{index + 1}</span>
      <button onClick={() => onRemove(index)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,39,77,0.75)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
    </div>
  )
}

function SectionTitle({ title }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.7px', margin: '18px 0 8px', fontFamily: "'Poppins',sans-serif" }}>{title}</p>
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#555' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>⚖</div>
      <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>{message}</p>
    </div>
  )
}

const inputBase = { padding: '10px 12px', fontSize: 14, border: '1px solid #e0e6ed', borderRadius: 10, background: '#fff', color: '#00274d', outline: 'none', fontFamily: "'Open Sans',sans-serif" }
const btnPrimary = { padding: '11px 24px', fontSize: 14, fontWeight: 700, background: '#00274d', color: '#ffc72c', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }
const btnGold = { padding: '11px 24px', fontSize: 14, fontWeight: 700, background: '#ffc72c', color: '#00274d', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }
const btnGhost = { padding: '11px 20px', fontSize: 14, background: 'transparent', color: '#00274d', border: '1px solid #e0e6ed', borderRadius: 10, cursor: 'pointer', fontFamily: "'Open Sans',sans-serif" }
const btnHeaderGhost = { padding: '6px 14px', fontSize: 13, fontWeight: 500, background: 'rgba(255,199,44,0.15)', color: '#ffc72c', border: '1px solid rgba(255,199,44,0.3)', borderRadius: 8, cursor: 'pointer' }

// ─── App ─────────────────────────────────────────────────────────────────────

// ─── Generate PDF Report ──────────────────────────────────────────────────────
async function downloadReport(result, contractType, institution) {
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'
      s.onload = resolve; s.onerror = reject
      document.head.appendChild(s)
    })
  }
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, ML = 18, MR = 18, MT = 18, contentW = W - ML - MR
  let y = MT

  const checkPage = (needed = 20) => {
    if (y + needed > 272) { doc.addPage(); y = MT }
  }

  // Strip &– truncation artefacts from anywhere in a string
  const clean = (s) => {
    if (!s) return ''
    // Remove everything from &– onward (mid-string truncation)
    let r = String(s).replace(/\s*&\s*[–—\-]+[\s\S]*$/, '').trim()
    // Also strip if string STARTS with &– (fully truncated field)
    r = r.replace(/^[–—\-&\s]+/, '').trim()
    return r
  }

  const txt = (text, x, yPos, opts = {}) => {
    doc.setFontSize(opts.size || 9)
    doc.setTextColor(...(opts.color || [60, 60, 60]))
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    if (opts.align) {
      doc.text(String(text || ''), x, yPos, { align: opts.align })
    } else {
      doc.text(String(text || ''), x, yPos)
    }
  }

  const wrappedText = (text, x, startY, maxW, opts = {}) => {
    doc.setFontSize(opts.size || 9)
    doc.setTextColor(...(opts.color || [60, 60, 60]))
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(String(text || ''), maxW)
    const lineH = opts.lineH || (opts.size || 9) * 0.42
    lines.forEach(line => {
      checkPage()
      doc.text(line, x, y)
      y += lineH
    })
    return lines.length
  }

  const sectionHeader = (title) => {
    checkPage(12)
    y += 4
    doc.setFillColor(0, 39, 77)
    doc.rect(ML, y - 4, contentW, 7, 'F')
    txt(title, ML + 3, y, { size: 8, color: [255, 199, 44], bold: true })
    y += 6
  }

  // ── HEADER ──────────────────────────────────────────
  doc.setFillColor(0, 39, 77)
  doc.rect(0, 0, W, 32, 'F')
  doc.setFillColor(255, 199, 44)
  doc.rect(0, 32, W, 1.5, 'F')

  txt('THE LEVELLER™', ML, 12, { size: 20, color: [255, 199, 44], bold: true })
  txt('Contract Intelligence Report  ·  Get SAFE — Support After Financial Exploitation', ML, 20, { size: 8, color: [180, 195, 210] })
  txt('get-safe.org.uk', W - MR, 20, { size: 8, color: [180, 195, 210], align: 'right' })
  txt('Generated ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), W - MR, 27, { size: 7.5, color: [150, 165, 180], align: 'right' })
  if (contractType) txt('Contract type: ' + contractType, ML, 27, { size: 7.5, color: [150, 165, 180] })

  y = 40

  // ── SCORE BOX ───────────────────────────────────────
  const score = result.fairnessScore || 0
  const scoreCol = score >= 70 ? [39, 119, 56] : score >= 40 ? [176, 100, 15] : [185, 50, 40]
  const scoreBg = score >= 70 ? [240, 249, 242] : score >= 40 ? [253, 244, 228] : [252, 238, 237]

  // Pre-calculate verdict height
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal')
  const verdictLines = doc.splitTextToSize(result.verdict || '', contentW - 42)
  const scoreLabelLines = doc.splitTextToSize(result.scoreLabel || '', contentW - 42)
  const scoreBoxH = Math.max(30, 10 + scoreLabelLines.length * 6 + verdictLines.length * 4.8 + 6)

  checkPage(scoreBoxH + 4)
  doc.setFillColor(...scoreBg)
  doc.roundedRect(ML, y, contentW, scoreBoxH, 2, 2, 'F')
  doc.setDrawColor(...scoreCol)
  doc.setLineWidth(0.4)
  doc.roundedRect(ML, y, contentW, scoreBoxH, 2, 2, 'S')

  // Score number on left
  doc.setFontSize(30); doc.setTextColor(...scoreCol); doc.setFont('helvetica', 'bold')
  doc.text(String(score), ML + 8, y + 18)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text('/100', ML + 8, y + 24)

  // Label
  doc.setFontSize(12); doc.setTextColor(...scoreCol); doc.setFont('helvetica', 'bold')
  scoreLabelLines.forEach((line, i) => doc.text(line, ML + 36, y + 9 + i * 6))

  // Verdict text - fully wrapped
  const verdictStartY = y + 9 + scoreLabelLines.length * 6 + 2
  doc.setFontSize(8.5); doc.setTextColor(60, 60, 60); doc.setFont('helvetica', 'normal')
  verdictLines.forEach((line, i) => doc.text(line, ML + 36, verdictStartY + i * 4.8))
  y += scoreBoxH + 6

  // ── SUMMARY ─────────────────────────────────────────
  sectionHeader('SUMMARY')
  wrappedText(clean(result.summary), ML, y, contentW, { size: 9, color: [50, 50, 50], lineH: 4.5 })
  y += 3
  if (result.powerBalance) {
    doc.setFillColor(245, 246, 248)
    const pbLines = doc.splitTextToSize(result.powerBalance || '', contentW - 8)
    const pbH = pbLines.length * 4.2 + 6
    checkPage(pbH)
    doc.rect(ML, y, contentW, pbH, 'F')
    doc.setFillColor(255, 199, 44)
    doc.rect(ML, y, 2, pbH, 'F')
    y += 4
    wrappedText(clean(result.powerBalance), ML + 5, y, contentW - 8, { size: 8.5, color: [80, 80, 80], lineH: 4.2 })
    y += 4
  }

  // ── HIDDEN COSTS ────────────────────────────────────
  if (result.hiddenCosts?.length) {
    sectionHeader('HIDDEN COSTS & UNDISCLOSED CHARGES')
    result.hiddenCosts.forEach(h => {
      doc.setFontSize(8)
      const hLines = doc.splitTextToSize(clean(h.detail), contentW - 10)
      const hH = hLines.length * 4 + 12
      checkPage(hH + 4)
      const hBoxY = y
      doc.setFillColor(232, 242, 252)
      doc.rect(ML, hBoxY, contentW, hH, 'F')
      doc.setFillColor(0, 39, 77)
      doc.rect(ML, hBoxY, 2, hH, 'F')
      y = hBoxY + 5
      txt(clean(h.item), ML + 5, y, { size: 9, color: [0, 39, 77], bold: true })
      y += 4.5
      doc.setFontSize(8); doc.setTextColor(70, 70, 70); doc.setFont('helvetica', 'normal')
      hLines.forEach(line => { doc.text(line, ML + 5, y); y += 4 })
      y = hBoxY + hH + 3
    })
    y += 2
  }

  // ── RED FLAGS ───────────────────────────────────────
  if (result.redFlags?.length) {
    sectionHeader('ISSUES IDENTIFIED')
    const sevCols = { high: [185, 50, 40], medium: [176, 100, 15], low: [39, 119, 56], commission: [0, 39, 77] }
    const sevBgs = { high: [252, 238, 237], medium: [253, 244, 228], low: [240, 249, 242], commission: [232, 242, 252] }
    const sevLabels = { high: 'HIGH RISK', medium: 'MEDIUM RISK', low: 'LOW RISK', commission: 'HIDDEN COST' }
    const textW = contentW - 16

    result.redFlags.forEach(f => {
      const col = sevCols[f.severity] || sevCols.low
      const bg = sevBgs[f.severity] || sevBgs.low
      const label = sevLabels[f.severity] || 'RISK'

      // ── Pre-measure: use exact same font sizes as rendering ──
      const badgeW = label.length * 1.9 + 6
      const titleMaxW = contentW - badgeW - 16

      doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      const titleLines = doc.splitTextToSize(clean(f.title) || '', titleMaxW).slice(0, 2)

      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal')
      const expLines = doc.splitTextToSize(clean(f.explanation) || '', textW)

      doc.setFontSize(7.5); doc.setFont('helvetica', 'italic')
      const clauseRaw = clean(f.clause)
      const clauseLines = clauseRaw ? doc.splitTextToSize('"' + clauseRaw + '"', textW - 4) : []

      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal')
      const legalRaw = clean(f.legalContext)
      const legalLines = legalRaw ? doc.splitTextToSize(legalRaw, textW) : []

      // ── Simulate exact y-advances to get true totalH ──
      // Note: jsPDF text y = baseline. We add 5pt baseline offset for first text in each section.
      const LINE_EXP = 5.0    // line height for 8.5pt explanation/legal text
      const LINE_CL  = 4.5    // line height for 7.5pt clause text
      const TOP_PAD  = 4      // padding before first text line in title area
      const BOT_PAD  = 6      // bottom padding inside box
      let sim = 0

      // title row: badge height + title lines
      sim += TOP_PAD + titleLines.length * 5 + 3

      // explanation
      sim += expLines.length * LINE_EXP + 3

      // clause sub-box
      if (clauseLines.length) {
        sim += 3  // gap before clause
        sim += clauseLines.length * LINE_CL + 8  // clause lines + internal padding
        sim += 3  // gap after clause
      }

      // legal context
      if (legalLines.length) {
        sim += legalLines.length * LINE_EXP + 3
      }

      sim += BOT_PAD
      const totalH = sim

      // Force new page if box won't fit
      checkPage(totalH + 4)
      const boxY = y

      // ── Draw background and accent bar ──
      doc.setFillColor(...bg)
      doc.rect(ML, boxY, contentW, totalH, 'F')
      doc.setFillColor(...col)
      doc.rect(ML, boxY, 3, totalH, 'F')

      // ── Badge ──
      doc.setFillColor(...col)
      doc.rect(ML + 5, boxY + 2.5, badgeW, 5.5, 'F')
      doc.setFontSize(6.5); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold')
      doc.text(label, ML + 7, boxY + 6.5)

      // ── Title ──
      doc.setFontSize(9); doc.setTextColor(...col); doc.setFont('helvetica', 'bold')
      titleLines.forEach((line, i) => doc.text(line, ML + badgeW + 9, boxY + TOP_PAD + 5 + i * 5))
      y = boxY + TOP_PAD + titleLines.length * 5 + 3

      // ── Explanation ──
      doc.setFontSize(8.5); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal')
      expLines.forEach(line => { doc.text(line, ML + 6, y + 1); y += LINE_EXP })
      y += 3

      // ── Clause quote ──
      if (clauseLines.length) {
        y += 3
        const cBoxH = clauseLines.length * LINE_CL + 8
        doc.setFillColor(255, 255, 255)
        doc.rect(ML + 6, y, contentW - 12, cBoxH, 'F')
        doc.setDrawColor(255, 199, 44); doc.setLineWidth(1)
        doc.line(ML + 6, y, ML + 6, y + cBoxH)
        doc.setLineWidth(0.2)
        y += 4
        doc.setFontSize(7.5); doc.setTextColor(90, 90, 90); doc.setFont('helvetica', 'italic')
        clauseLines.forEach(line => { doc.text(line, ML + 10, y); y += LINE_CL })
        y += 3 + 3
      }

      // ── Legal context ──
      if (legalLines.length) {
        doc.setFontSize(8.5); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal')
        legalLines.forEach(line => { doc.text(line, ML + 6, y + 1); y += LINE_EXP })
        y += 3
      }

      y += BOT_PAD
      if (y > boxY + totalH) y = boxY + totalH
      y += 4  // gap between flags
    })
  }

  // ── QUESTIONS ───────────────────────────────────────
  if (result.questions?.length) {
    sectionHeader('QUESTIONS TO ASK BEFORE SIGNING')
    result.questions.forEach((q, i) => {
      doc.setFontSize(8.5)
      const qLines = doc.splitTextToSize(clean(q), contentW - 14)
      const qH = qLines.length * 4.2 + 8
      checkPage(qH + 2)
      const qBoxY = y
      doc.setFillColor(i % 2 === 0 ? 248 : 252, i % 2 === 0 ? 249 : 253, i % 2 === 0 ? 250 : 254)
      doc.rect(ML, qBoxY, contentW, qH, 'F')
      txt(String(i + 1) + '.', ML + 3, qBoxY + 5, { size: 8.5, color: [0, 39, 77], bold: true })
      y = qBoxY + 4
      doc.setFontSize(8.5); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal')
      qLines.forEach(line => { doc.text(line, ML + 10, y); y += 4.2 })
      y = qBoxY + qH + 2
    })
    y += 2
  }

  // ── STRATEGY ────────────────────────────────────────
  if (result.strategicAdvice) {
    sectionHeader('STRATEGIC GUIDANCE')
    wrappedText(clean(result.strategicAdvice), ML, y, contentW, { size: 9, color: [50, 50, 50], lineH: 4.8 })
    y += 6
  }

  // ── FOOTER on all pages ──────────────────────────────
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFillColor(0, 39, 77)
    doc.rect(0, 285, W, 12, 'F')
    doc.setFillColor(255, 199, 44)
    doc.rect(0, 285, W, 0.8, 'F')
    txt('The Leveller™ is an educational tool. Does not provide legal or financial advice. All outputs used at your discretion.', ML, 290, { size: 6.5, color: [180, 195, 210] })
    txt('get-safe.org.uk  ·  Get SAFE — Support After Financial Exploitation', ML, 294, { size: 6.5, color: [150, 165, 180] })
    txt('Page ' + i + ' of ' + pages, W - MR, 294, { size: 6.5, color: [150, 165, 180], align: 'right' })
  }

  doc.save('leveller-report-' + Date.now() + '.pdf')
}

export default function App() {
  const [tab, setTab] = useState('input')
  const [inputMode, setInputMode] = useState('text')
  const [contractText, setContractText] = useState('')
  const [contractType, setContractType] = useState('')
  const [institution, setInstitution] = useState('')
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [result, setResult] = useState(null)
  const cameraRef = useRef()
  const fileRef = useRef()
  const pdfRef = useRef()
  const [pdfFile, setPdfFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [analysisCount, setAnalysisCount] = useState(0)

  const saveSession = () => {
    const s = { contractType, institution, contractText, pages: pages.map(p => ({ dataUrl: p.dataUrl, mediaType: p.mediaType })), result }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }))
    a.download = `leveller-${Date.now()}.json`
    a.click()
  }

  const loadSession = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const s = JSON.parse(ev.target.result)
        if (s.contractType) setContractType(s.contractType)
        if (s.institution) setInstitution(s.institution)
        if (s.contractText) setContractText(s.contractText)
        if (s.pages) setPages(s.pages.map(p => ({ ...p, base64: p.dataUrl.split(',')[1] })))
        if (s.result) { setResult(s.result); setTab('flags') }
      } catch { setStatusMsg('Could not load session.') }
    }
    reader.readAsText(file)
  }

  const handleImages = async (files) => {
    const added = []
    for (const file of Array.from(files)) {
      const dataUrl = await compressImage(file, 1600, 0.7)
      added.push({ dataUrl, base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
    }
    setPages(p => [...p, ...added])
    setStatusMsg(`${pages.length + added.length} page(s) ready`)
  }

  const runAnalysis = async () => {
    const hasText = inputMode === 'text' && contractText.trim().length > 30
    const hasPages = inputMode === 'scan' && pages.length > 0
    const hasPdf = inputMode === 'pdf' && pdfFile !== null
    if (!hasText && !hasPages && !hasPdf) {
      setStatusMsg(inputMode === 'text' ? 'Please paste some contract text.' : inputMode === 'scan' ? 'Please add at least one photo.' : 'Please upload a PDF.')
      return
    }
    setLoading(true); setResult(null); setStatusMsg('Reading contract…')
    try {
      let messages
      if (inputMode === 'scan') {
        const content = pages.flatMap((p, i) => [
          { type: 'image', source: { type: 'base64', media_type: p.mediaType, data: p.base64 } },
          { type: 'text', text: `[Page ${i + 1} of ${pages.length}]` },
        ])
        content.push({ type: 'text', text: 'Analyse all pages of this scanned contract.' })
        messages = [{ role: 'user', content }]

      } else if (inputMode === 'pdf') {
        const truncated = pdfFile.text.length > 10000 ? pdfFile.text.slice(0, 10000) + '\n\n[Document truncated for analysis]'  : pdfFile.text;
        messages = [{ role: 'user', content: `PDF CONTRACT:\n\n${truncated}` }]
      } else {
        messages = [{ role: 'user', content: contractText.trim() }]
      }
      setStatusMsg('Identifying power imbalances, hidden costs, and red flags…')
      const analysis = await callLeveller(messages, contractType, institution)
      setResult(analysis); setTab('flags')
      setStatusMsg(`Done — ${(analysis.redFlags || []).length} issue(s) found`)
      const newCount = analysisCount + 1
      setAnalysisCount(newCount)
      if (newCount === 2) {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.requestReview) {
          window.webkit.messageHandlers.requestReview.postMessage('requestReview')
        } else if (window.Android && window.Android.requestReview) {
          window.Android.requestReview()
        }
      }
    } catch (err) {
      setStatusMsg('Analysis failed. Please try again.'); console.error(err)
    } finally { setLoading(false) }
  }

  const TABS = [
    { key: 'input',     label: 'Contract' },
    { key: 'flags',     label: `Red flags${result ? ` (${(result.redFlags||[]).length})` : ''}` },
    { key: 'questions', label: 'Questions' },
    { key: 'strategy',  label: 'Strategy' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Open Sans',sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#00274d', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,39,77,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <GetSafeLogo size={32} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#ffc72c', fontFamily: "'Poppins',sans-serif", lineHeight: 1.1, whiteSpace: 'nowrap' }}>The Leveller™</h1>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>by Get SAFE</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={saveSession} style={{ ...btnHeaderGhost, padding: '5px 8px', fontSize: 11 }}>Save</button>
          <label style={{ ...btnHeaderGhost, padding: '5px 8px', fontSize: 11, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            Load
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={loadSession} />
          </label>
          <button onClick={() => {
            setResult(null)
            setContractText('')
            setContractType('')
            setInstitution('')
            setPages([])
            setTab('input')
            setStatusMsg('')
            setLoading(false)
            setPdfFile(null)
            setInputMode('text')
          }} style={{ ...btnHeaderGhost, padding: '5px 8px', fontSize: 11, color: '#ff6b6b' }}>Reset</button>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e6ed', display: 'flex', overflowX: 'auto', padding: '0 16px' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '13px 16px', fontSize: 14,
            fontWeight: tab === t.key ? 700 : 400,
            color: tab === t.key ? '#00274d' : '#555',
            borderBottom: tab === t.key ? '3px solid #ffc72c' : '3px solid transparent',
            background: 'none', border: 'none', borderRadius: 0,
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Poppins',sans-serif",
          }}>{t.label}</button>
        ))}
      </nav>

      <main style={{ padding: '16px', maxWidth: 680, margin: '0 auto' }}>

        {/* INPUT */}
        {tab === 'input' && (
          <div>
            <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 16, border: '1px solid #e0e6ed', borderLeft: '4px solid #ffc72c' }}>
              <p style={{ fontSize: 14, color: '#00274d', lineHeight: 1.7, fontWeight: 500 }}>
                Institutions draft contracts to protect themselves. The Leveller reads them to protect <em>you</em> — surfacing hidden costs, power imbalances, and red flags before you sign.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <select value={contractType} onChange={e => setContractType(e.target.value)} style={{ ...inputBase, flex: 2, minWidth: 200 }}>
                {CONTRACT_TYPES.map(item =>
                  item.group
                    ? <optgroup key={item.group} label={item.group}>{item.items.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
                    : <option key={item.value} value={item.value}>{item.label}</option>
                )}
              </select>
              <input type="text" placeholder="Institution / dealer (optional)" value={institution} onChange={e => setInstitution(e.target.value)} style={{ ...inputBase, flex: 1, minWidth: 150 }} />
            </div>

            {/* Mode toggle */}
            <div style={{ display: 'flex', marginBottom: 14, border: '1px solid #e0e6ed', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
              {[{ key: 'text', label: '✏  Paste text' }, { key: 'scan', label: '📷  Scan pages' }, { key: 'pdf', label: '📄  Upload PDF' }].map(m => (
                <button key={m.key} onClick={() => setInputMode(m.key)} style={{
                  flex: 1, padding: '11px', fontSize: 14,
                  fontWeight: inputMode === m.key ? 700 : 400,
                  background: inputMode === m.key ? '#00274d' : 'transparent',
                  color: inputMode === m.key ? '#ffc72c' : '#555',
                  border: 'none', cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
                }}>{m.label}</button>
              ))}
            </div>

            {inputMode === 'text' && (
              <textarea value={contractText} onChange={e => setContractText(e.target.value)}
                placeholder={`Paste contract text, terms and conditions, or legal small print here…\n\nThe Leveller™ will identify:\n• Hidden costs, commissions, and undisclosed charges\n• Power imbalances and unfair clauses\n• Your rights under UK consumer law\n• Exactly what to ask before you sign`}
                style={{ ...inputBase, width: '100%', minHeight: 220, resize: 'vertical', lineHeight: 1.75 }} />
            )}

            {inputMode === 'pdf' && (
              <div>
              <div
                  onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={async e => {
                    e.preventDefault(); setDragActive(false)
                    const file = e.dataTransfer.files[0]
                    if (!file || file.type !== 'application/pdf') { setStatusMsg('Please drop a PDF file.'); return }
                    if (file.size > 10 * 1024 * 1024) { setStatusMsg('PDF too large — please use a file under 10MB.'); return }
                    setStatusMsg('Reading ' + file.name + '...')
                    try {
                      if (!window.pdfjsLib) {
                        await new Promise((resolve, reject) => {
                          const s = document.createElement('script')
                          s.src = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.min.js'
                          s.onload = resolve; s.onerror = reject
                          document.head.appendChild(s)
                        })
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'
                      }
                      const arrayBuffer = await file.arrayBuffer()
                      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
                      let text = ''
                      for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
                        const page = await pdf.getPage(i)
                        const tc = await page.getTextContent()
                        text += tc.items.map(item => item.str).join(' ') + '\n'
                      }
                      const trimmed = text.trim().slice(0, 30000)
                      if (trimmed.length < 100) { setStatusMsg('No text found — please scan the pages instead.'); return }
                      setPdfFile({ name: file.name, text: trimmed, pages: pdf.numPages })
                      setStatusMsg('✔ ' + file.name + ' ready (' + pdf.numPages + ' pages)')
                    } catch(err) { setStatusMsg('Could not read PDF: ' + err.message) }
                  }}
                  style={{ border: dragActive ? '2px dashed #ffc72c' : '2px dashed #e0e6ed', borderRadius: 12, padding: '20px 16px', textAlign: 'center', background: dragActive ? '#fffbee' : '#fff', marginBottom: 12, transition: 'all 0.15s' }}>
                  <p style={{ fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 1.7 }}>
                    {dragActive ? 'Drop your PDF here' : 'Upload a PDF contract — terms and conditions, credit agreement, or any legal document.'}
                  </p>
                  <button onClick={() => pdfRef.current?.click()} style={btnGold}>📄 Choose PDF</button>
                  {!dragActive && <p style={{ fontSize: 12, color: '#999', marginTop: 10 }}>or drag and drop a PDF here — up to 10MB</p>}
                  {pdfFile && (
                    <div style={{ marginTop: 12, padding: '8px 14px', background: '#edf7ee', borderRadius: 8, display: 'inline-block' }}>
                      <p style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>✔ {pdfFile.name}</p>
                    </div>
                  )}
                </div>
                <input ref={pdfRef} type="file" accept="application/pdf" style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    if (file.size > 10 * 1024 * 1024) { setStatusMsg('PDF too large — please use a file under 10MB.'); return }
                    setStatusMsg(`Reading ${file.name}...`)
                    try {
                      if (!window.pdfjsLib) {
                        await new Promise((resolve, reject) => {
                          const s = document.createElement('script')
                          s.src = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.min.js'
                          s.onload = resolve
                          s.onerror = reject
                          document.head.appendChild(s)
                        })
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'
                      }
                      const arrayBuffer = await file.arrayBuffer()
                      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
                      let text = ''
                      for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
                        const page = await pdf.getPage(i)
                        const tc = await page.getTextContent()
                        text += tc.items.map(item => item.str).join(' ') + '\n'
                      }
                      const trimmed = text.trim().slice(0, 30000)
                      if (trimmed.length < 100) { setStatusMsg('No text found — please scan the pages instead.'); return }
                      setPdfFile({ name: file.name, text: trimmed, pages: pdf.numPages })
                      setStatusMsg(`✓ ${file.name} ready (${pdf.numPages} pages)`)
                    } catch(err) {
                      setStatusMsg(`Could not read PDF: ${err.message}`)
                    }
                  }} />
              </div>
            )}

            {inputMode === 'scan' && (
              <div>
                <div style={{ border: '2px dashed #e0e6ed', borderRadius: 12, padding: '20px 16px', textAlign: 'center', background: '#fff', marginBottom: 12 }}>
                  <p style={{ fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 1.7 }}>
                    In the showroom, at the bank, at the solicitor's office —<br />photograph each page and let The Leveller™ read it for you.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => cameraRef.current?.click()} style={btnGold}>📷 Take photo</button>
                    <button onClick={() => fileRef.current?.click()} style={btnGhost}>Upload image</button>
                  </div>
                  <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>On mobile, "Take photo" opens your rear camera directly</p>
                </div>
                {pages.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
                    {pages.map((p, i) => <PageThumb key={i} page={p} index={i} onRemove={i => setPages(p => p.filter((_, idx) => idx !== i))} />)}
                    <button onClick={() => cameraRef.current?.click()} style={{ aspectRatio: '3/4', border: '2px dashed #e0e6ed', borderRadius: 6, background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#999', fontSize: 12 }}>
                      <span style={{ fontSize: 24 }}>+</span><span>Add page</span>
                    </button>
                  </div>
                )}
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleImages(e.target.files)} />
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleImages(e.target.files)} />
              </div>
            )}

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={runAnalysis} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1, minWidth: 210 }}>
                {loading ? 'Analysing…' : 'Level the playing field →'}
              </button>
              {statusMsg && <span style={{ fontSize: 13, color: loading ? '#0a4d8c' : '#555' }}>{loading && '⏳ '}{statusMsg}</span>}
            </div>
          </div>
        )}

        {/* FLAGS */}
        {tab === 'flags' && (
          <div>
            {!result ? <EmptyState message="Analyse a contract to see its red flags, hidden costs, and power imbalances." /> : (
              <>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14, background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e0e6ed' }}>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', flexShrink: 0, background: scoreBg(result.fairnessScore), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor(result.fairnessScore), lineHeight: 1, fontFamily: "'Poppins',sans-serif" }}>{result.fairnessScore}</span>
                    <span style={{ fontSize: 10, color: scoreColor(result.fairnessScore) }}>/100</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#00274d', fontFamily: "'Poppins',sans-serif" }}>{result.scoreLabel}</p>
                    <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{result.contractType}</p>
                    <p style={{ fontSize: 13, color: '#555', marginTop: 6, lineHeight: 1.6 }}>{result.powerBalance}</p>
                  </div>
                </div>

                {result.verdict && (() => {
                  const vs = VERDICT_STYLE[result.verdictLevel] || VERDICT_STYLE.negotiate
                  return <div style={{ background: vs.bg, borderRadius: 10, padding: '13px 16px', marginBottom: 14, border: `1px solid ${vs.color}40` }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: vs.color, fontFamily: "'Poppins',sans-serif" }}>{vs.icon}  {result.verdict}</p>
                  </div>
                })()}

                <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', marginBottom: 16, border: '1px solid #e0e6ed' }}>
                  <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>{result.summary}</p>
                </div>
                <p style={{ fontSize: 13, color: '#0a4d8c', marginBottom: 16, textAlign: 'right' }}>
                  📄 <strong>Strategy tab</strong> → Download your PDF report
                </p>

                {result.hiddenCosts?.length > 0 && <>
                  <SectionTitle title={`Hidden costs & undisclosed charges (${result.hiddenCosts.length})`} />
                  {result.hiddenCosts.map((h, i) => (
                    <div key={i} style={{ borderRadius: 10, padding: '11px 14px', marginBottom: 8, background: '#e8f1fb', borderLeft: '4px solid #0a4d8c', border: '1px solid #c8dcf5' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0a4d8c', marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>{h.item}</p>
                      <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65 }}>{h.detail}</p>
                    </div>
                  ))}
                </>}

                <SectionTitle title={`Issues identified (${(result.redFlags||[]).length})`} />
                {result.redFlags?.length > 0 ? result.redFlags.map((f, i) => <FlagCard key={i} flag={f} />) : <p style={{ fontSize: 14, color: '#555' }}>No significant red flags identified.</p>}

                {result.regulatoryRedress?.length > 0 && <>
                  <SectionTitle title="If things go wrong — regulatory routes" />
                  {result.regulatoryRedress.map((r, i) => (
                    <div key={i} style={{ padding: '10px 14px', marginBottom: 8, background: '#fff', borderRadius: 8, border: '1px solid #e0e6ed', fontSize: 14, color: '#555', lineHeight: 1.65 }}>⚖  {r}</div>
                  ))}
                </>}
              </>
            )}
          </div>
        )}

        {/* QUESTIONS */}
        {tab === 'questions' && (
          <div>
            {!result ? <EmptyState message="Analyse a contract to generate your targeted questions." /> : (
              <>
                <div style={{ background: '#ffc72c', borderRadius: 10, padding: '13px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#00274d', lineHeight: 1.7 }}>
                    Ask these questions before you sign — and get the answers in writing. A dealer or broker who cannot or will not answer clearly is a red flag in itself.
                  </p>
                </div>
                <SectionTitle title="Questions to ask right now" />
                {result.questions?.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #e0e6ed' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#00274d', minWidth: 24, paddingTop: 2, fontFamily: "'Poppins',sans-serif" }}>{i + 1}.</span>
                    <p style={{ fontSize: 14, color: '#00274d', lineHeight: 1.75 }}>{q}</p>
                  </div>
                ))}
                {result.negotiationPoints?.length > 0 && <>
                  <SectionTitle title="Points to negotiate" />
                  {result.negotiationPoints.map((n, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #e0e6ed' }}>
                      <span style={{ fontSize: 14, color: '#b7560a', minWidth: 24, paddingTop: 2 }}>↗</span>
                      <p style={{ fontSize: 14, color: '#00274d', lineHeight: 1.75 }}>{n}</p>
                    </div>
                  ))}
                </>}
              </>
            )}
          </div>
        )}

        {/* STRATEGY */}
        {tab === 'strategy' && (
          <div>
            {!result ? <EmptyState message="Analyse a contract to receive your strategic guidance." /> : (
              <>
                <button
                  onClick={() => downloadReport(result, contractType, institution)}
                  style={{ ...btnGold, width: '100%', marginBottom: 16, fontSize: 14 }}>
                  📄 Download PDF Report
                </button>
                <SectionTitle title="Your strategic position" />
                {result.strategicAdvice?.split(/\n\n+/).filter(Boolean).map((para, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #e0e6ed' }}>
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.85 }}>{para}</p>
                  </div>
                ))}


                <div style={{ marginTop: 20, padding: '16px 18px', background: '#00274d', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <GetSafeLogo size={30} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#ffc72c', fontFamily: "'Poppins',sans-serif" }}>If exploitation has already occurred</p>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 12 }}>
                    Get SAFE's Goliathon tool turns survivors into strategists — building your case file, analysing evidence, and guiding you toward justice.
                  </p>
                  <a href="https://www.get-safe.org.uk/goliathon" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-block', padding: '9px 18px', background: '#ffc72c', color: '#00274d', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: "'Poppins',sans-serif" }}>
                    Open Goliathon →
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px 16px', fontSize: 12, color: '#999', lineHeight: 1.7, borderTop: '1px solid #e0e6ed', marginTop: 20, background: '#fff' }}>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 8px' }}>
          The Leveller™ is an educational tool that helps you think clearly, organise your position, and ask better questions. It does not provide legal or financial advice. All outputs are for your review and used at your discretion. Decisions, actions, and communications remain your responsibility. If your situation requires legal or regulated advice, please consult a qualified professional.
        </p>
        <p style={{ marginTop: 8 }}>
          <a href="https://www.get-safe.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#00274d', fontWeight: 700, textDecoration: 'none' }}>get-safe.org.uk</a>
          {' '}· Get SAFE — Support After Financial Exploitation · Founded by Steve Conley · <a href='/privacy.html' target='_blank' rel='noopener noreferrer' style={{ color: '#00274d', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </footer>
    </div>
  )
}

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
  ]},
  { group: 'Employment', items: [
    { value: 'employment', label: 'Employment contract' },
    { value: 'zero_hours', label: 'Zero hours / gig economy contract' },
    { value: 'settlement', label: 'Settlement / compromise agreement' },
    { value: 'consultancy', label: 'Consultancy / freelance contract' },
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

function buildSystemPrompt(contractType, institution) {
  return `You are The Leveller, a UK consumer rights analyst for Get SAFE. Analyse this contract and return ONLY valid JSON — no markdown fences, no preamble:
{"contractType":"","fairnessScore":0,"scoreLabel":"","verdict":"","verdictLevel":"sign|negotiate|dontsign","summary":"","powerBalance":"","redFlags":[{"severity":"high|medium|low|commission","title":"","explanation":"","clause":"","legalContext":""}],"hiddenCosts":[{"item":"","detail":""}],"questions":[],"negotiationPoints":[],"regulatoryRedress":[],"strategicAdvice":""}
${contractType ? 'Contract type: '+contractType+'.' : ''} ${institution ? 'Institution: '+institution+'.' : ''}
Look for: hidden commissions, unfair terms, asymmetric rights, data sharing, liability exclusions, arbitration waivers, auto-renewal traps. Be on the side of the individual.`
}

async function callLeveller(messages, contractType, institution) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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
  // Load jsPDF
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
  const W = 210, margin = 20, contentW = W - margin * 2
  let y = 0

  const addText = (text, fontSize, color, bold, maxW, lineH) => {
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(String(text || ''), maxW || contentW)
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = margin }
      doc.text(line, margin, y)
      y += lineH || (fontSize * 0.4)
    })
  }

  const addRect = (fillColor, height) => {
    doc.setFillColor(...fillColor)
    doc.rect(0, y - 6, W, height || 12, 'F')
  }

  // Header bar
  doc.setFillColor(0, 39, 77)
  doc.rect(0, 0, W, 28, 'F')
  doc.setFillColor(255, 199, 44)
  doc.rect(0, 28, W, 2, 'F')
  doc.setFontSize(18); doc.setTextColor(255, 199, 44); doc.setFont('helvetica', 'bold')
  doc.text('THE LEVELLER', margin, 13)
  doc.setFontSize(9); doc.setTextColor(200, 210, 220); doc.setFont('helvetica', 'normal')
  doc.text('Contract Intelligence Report  ·  Get SAFE — Support After Financial Exploitation', margin, 21)
  doc.setFontSize(8); doc.setTextColor(160, 170, 180)
  doc.text(`Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, W - margin, 21, { align: 'right' })

  y = 40

  // Contract info
  if (contractType || institution) {
    doc.setFontSize(9); doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'normal')
    if (contractType) doc.text(`Contract type: ${contractType}`, margin, y)
    if (institution) doc.text(`Institution: ${institution}`, margin, y + 5)
    y += institution ? 12 : 6
  }

  // Score box
  const scoreColor = result.fairnessScore >= 70 ? [46, 125, 50] : result.fairnessScore >= 40 ? [183, 86, 10] : [192, 57, 43]
  const scoreBgColor = result.fairnessScore >= 70 ? [237, 247, 238] : result.fairnessScore >= 40 ? [254, 244, 232] : [253, 240, 239]
  doc.setFillColor(...scoreBgColor)
  doc.rect(margin, y, contentW, 22, 'F')
  doc.setDrawColor(...scoreColor)
  doc.rect(margin, y, contentW, 22, 'S')
  doc.setFontSize(22); doc.setTextColor(...scoreColor); doc.setFont('helvetica', 'bold')
  doc.text(String(result.fairnessScore), margin + 8, y + 14)
  doc.setFontSize(9); doc.setTextColor(...scoreColor); doc.setFont('helvetica', 'normal')
  doc.text('/100', margin + 8, y + 19)
  doc.setFontSize(11); doc.setTextColor(...scoreColor); doc.setFont('helvetica', 'bold')
  doc.text(result.scoreLabel || '', margin + 30, y + 10)
  doc.setFontSize(9); doc.setTextColor(80, 80, 80); doc.setFont('helvetica', 'normal')
  const verdictLines = doc.splitTextToSize(result.verdict || '', contentW - 35)
  verdictLines.forEach((line, i) => doc.text(line, margin + 30, y + 16 + i * 4))
  y += 28

  // Summary
  addText('SUMMARY', 9, [100, 100, 100], true); y += 2
  addText(result.summary || '', 9, [60, 60, 60], false, contentW, 5); y += 6

  if (result.powerBalance) {
    addText(result.powerBalance, 8, [120, 120, 120], false, contentW, 4); y += 6
  }

  // Hidden costs
  if (result.hiddenCosts?.length) {
    addText('HIDDEN COSTS & UNDISCLOSED CHARGES', 9, [100, 100, 100], true); y += 2
    result.hiddenCosts.forEach(h => {
      doc.setFillColor(232, 241, 251)
      doc.rect(margin, y - 3, contentW, 12, 'F')
      doc.setFillColor(10, 77, 140)
      doc.rect(margin, y - 3, 2, 12, 'F')
      addText(h.item || '', 9, [10, 77, 140], true, contentW - 6); y += 1
      addText(h.detail || '', 8, [80, 80, 80], false, contentW - 6, 4); y += 4
    })
    y += 4
  }

  // Red flags
  if (result.redFlags?.length) {
    addText('ISSUES IDENTIFIED', 9, [100, 100, 100], true); y += 2
    const sevColors = {
      high: [192, 57, 43], medium: [183, 86, 10], low: [46, 125, 50], commission: [10, 77, 140]
    }
    const sevLabels = { high: 'HIGH RISK', medium: 'MEDIUM RISK', low: 'LOW RISK', commission: 'HIDDEN COST' }
    result.redFlags.forEach(f => {
      if (y > 260) { doc.addPage(); y = margin }
      const col = sevColors[f.severity] || sevColors.low
      doc.setFillColor(248, 248, 248)
      doc.rect(margin, y - 3, contentW, 3, 'F')
      doc.setFillColor(...col)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7); doc.setFont('helvetica', 'bold')
      const label = sevLabels[f.severity] || 'RISK'
      doc.rect(margin, y - 3, 22, 5, 'F')
      doc.text(label, margin + 1, y + 0.5)
      doc.setFontSize(9); doc.setTextColor(0, 39, 77); doc.setFont('helvetica', 'bold')
      doc.text(f.title || '', margin + 25, y + 0.5)
      y += 6
      addText(f.explanation || '', 8, [80, 80, 80], false, contentW, 4)
      if (f.clause) {
        doc.setFillColor(245, 247, 250)
        const clauseLines = doc.splitTextToSize(`"${f.clause}"`, contentW - 4)
        doc.rect(margin, y - 1, contentW, clauseLines.length * 4 + 2, 'F')
        doc.setDrawColor(255, 199, 44)
        doc.rect(margin, y - 1, 1, clauseLines.length * 4 + 2, 'F')
        addText(`"${f.clause}"`, 7.5, [120, 120, 120], false, contentW - 4, 4)
      }
      if (f.legalContext) {
        addText(`⚖ ${f.legalContext}`, 7.5, [10, 77, 140], false, contentW, 4)
      }
      y += 4
    })
  }

  // Questions
  if (result.questions?.length) {
    if (y > 240) { doc.addPage(); y = margin }
    addText('QUESTIONS TO ASK BEFORE SIGNING', 9, [100, 100, 100], true); y += 2
    result.questions.forEach((q, i) => {
      doc.setFontSize(8); doc.setTextColor(0, 39, 77); doc.setFont('helvetica', 'bold')
      if (y > 270) { doc.addPage(); y = margin }
      doc.text(`${i + 1}.`, margin, y)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60)
      const lines = doc.splitTextToSize(q, contentW - 8)
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = margin }
        doc.text(line, margin + 6, y)
        y += 4.5
      })
      y += 1
    })
    y += 4
  }

  // Strategy
  if (result.strategicAdvice) {
    if (y > 240) { doc.addPage(); y = margin }
    addText('STRATEGIC GUIDANCE', 9, [100, 100, 100], true); y += 2
    addText(result.strategicAdvice, 8.5, [60, 60, 60], false, contentW, 5)
    y += 6
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(0, 39, 77)
    doc.rect(0, 287, W, 10, 'F')
    doc.setFontSize(7); doc.setTextColor(180, 190, 200); doc.setFont('helvetica', 'normal')
    doc.text('The Leveller by Get SAFE  ·  get-safe.org.uk  ·  Informational only, not legal advice', margin, 293)
    doc.text(`Page ${i} of ${totalPages}`, W - margin, 293, { align: 'right' })
  }

  doc.save(`leveller-report-${Date.now()}.pdf`)
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
        messages = [{ role: 'user', content: `PDF CONTRACT:\n\n${pdfFile.text}` }]
      } else {
        messages = [{ role: 'user', content: contractText.trim() }]
      }
      setStatusMsg('Identifying power imbalances, hidden costs, and red flags…')
      const analysis = await callLeveller(messages, contractType, institution)
      setResult(analysis); setTab('flags')
      setStatusMsg(`Done — ${(analysis.redFlags || []).length} issue(s) found`)
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
      <header style={{ background: '#00274d', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,39,77,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <GetSafeLogo size={42} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#ffc72c', fontFamily: "'Poppins',sans-serif", lineHeight: 1.1 }}>The Leveller</h1>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>by Get SAFE — level the field before you sign</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={saveSession} style={btnHeaderGhost}>Save</button>
          <label style={{ ...btnHeaderGhost, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            Load
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={loadSession} />
          </label>
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
                placeholder={`Paste contract text, terms and conditions, or legal small print here…\n\nThe Leveller will identify:\n• Hidden costs, commissions, and undisclosed charges\n• Power imbalances and unfair clauses\n• Your rights under UK consumer law\n• Exactly what to ask before you sign`}
                style={{ ...inputBase, width: '100%', minHeight: 220, resize: 'vertical', lineHeight: 1.75 }} />
            )}

            {inputMode === 'pdf' && (
              <div>
                <div style={{ border: '2px dashed #e0e6ed', borderRadius: 12, padding: '20px 16px', textAlign: 'center', background: '#fff', marginBottom: 12 }}>
                  <p style={{ fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 1.7 }}>
                    Upload a PDF contract — terms and conditions, credit agreement, or any legal document.
                  </p>
                  <button onClick={() => pdfRef.current?.click()} style={btnGold}>📄 Choose PDF</button>
                  {pdfFile && (
                    <div style={{ marginTop: 12, padding: '8px 14px', background: '#edf7ee', borderRadius: 8, display: 'inline-block' }}>
                      <p style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>✓ {pdfFile.name}</p>
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: '#999', marginTop: 10 }}>Text-based PDFs up to 10MB</p>
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
                    In the showroom, at the bank, at the solicitor's office —<br />photograph each page and let The Leveller read it for you.
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
                <SectionTitle title="Your strategic position" />
                {result.strategicAdvice?.split(/\n\n+/).filter(Boolean).map((para, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #e0e6ed' }}>
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.85 }}>{para}</p>
                  </div>
                ))}
                <button
                  onClick={() => downloadReport(result, contractType, institution)}
                  style={{ ...btnGold, width: '100%', marginTop: 16, marginBottom: 4, fontSize: 14 }}>
                  📄 Download PDF Report
                </button>

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
        <p>The Leveller provides information only. It does not constitute legal advice.</p>
        <p style={{ marginTop: 4 }}>
          <a href="https://www.get-safe.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#00274d', fontWeight: 700, textDecoration: 'none' }}>get-safe.org.uk</a>
          {' '}· Get SAFE — Support After Financial Exploitation · Founded by Steve Conley
        </p>
      </footer>
    </div>
  )
}

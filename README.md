# The Leveller

**AI-powered contract intelligence — by Get SAFE**

*"Level the playing field before you sign."*

Know what you're signing before you sign it. The Leveller analyses commercial agreements between individuals and institutions, flags red flags, surfaces hidden costs and commissions, and arms you with the right questions to ask before you commit.

## Features

- **Scan mode** — photograph contract pages with your phone camera; Claude reads them via vision AI
- **Paste mode** — paste any T&Cs or contract text for instant analysis
- **All contract types** — motor finance, mortgages, pensions, investments, insurance, tenancy, employment, utilities, and more
- **Red flags** — severity-rated issues with plain-English explanations and relevant UK law context
- **Hidden costs** — commissions, balloon payments, exit penalties, and charges not prominently disclosed
- **Questions to ask** — targeted questions generated from the specific contract, not generic advice
- **Strategy tab** — what leverage you have, whether to sign, negotiate, or walk away
- **Save / restore sessions** — download and reload analysis as JSON (no database required)
- **Get SAFE branding** — navy, gold, Poppins/Open Sans

## Tech stack

- Vite + React
- Anthropic Claude API (claude-opus-4-5 for best analysis quality)
- Vercel serverless function as API proxy (same pattern as Goliathon)

## Deployment

### 1. Add to your GitHub repo

```bash
# From the root of your Goliathon repo (or create a new repo)
# Copy the the-leveller/ folder alongside goliathon/
git add .
git commit -m "Add The Leveller app"
git push
```

### 2. Create a new Vercel project

1. Go to vercel.com → New Project
2. Import from GitHub — select this repo (or the the-leveller subfolder)
3. Set **Root Directory** to `the-leveller` if in a monorepo
4. Framework preset: **Vite**
5. Add environment variable: `ANTHROPIC_API_KEY` = your key

### 3. Deploy

Vercel will auto-deploy on every push to main.

### 4. Embed in Wix

Add an Embed HTML element to your Get SAFE Wix site:

```html
<iframe
  src="https://your-the-leveller-url.vercel.app"
  width="100%"
  height="850"
  frameborder="0"
  allow="camera"
  style="border: none;"
/>
```

> **Important**: The `allow="camera"` attribute is required for the scan/photo feature to work inside an iframe.

## Local development

```bash
cd the-leveller
npm install
npm run dev
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=your_key_here
```

## Contract types covered

**Financial — Borrowing**
Motor finance (PCP/HP), personal loans, payday loans, credit cards, mortgages, secured loans, BNPL

**Financial — Investment & Savings**
Investment products, pensions/SIPPs/transfers, structured products, ISAs

**Financial — Protection**
Insurance (home/car/travel), life insurance, income protection, PPI, private healthcare

**Property & Housing**
Tenancy, leasehold, property purchase

**Utilities & Services**
Energy, telecoms/broadband, subscriptions, gym memberships

**Employment**
Employment contracts, zero hours, settlement agreements, consultancy

## The Get SAFE ecosystem

| Tool | Purpose | Timing |
|------|---------|--------|
| **The Leveller** | Analyse contracts before signing | Upstream — prevention |
| **Goliathon** | Build case files and pursue justice | Downstream — redress |

---

*The Leveller is informational only and does not constitute legal advice.*
*get-safe.org.uk · Get SAFE — Support After Financial Exploitation*

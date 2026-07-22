# AGENTS.md — Development & Architectural Guidelines for Celalyze

Welcome AI Agents! This document defines the strict project rules, architectural guidelines, UI design system, agent tool contracts, and engineering constraints for **Celalyze** based on the [PRD.md](file:///Users/vickyadifirmansyah/Documents/Projects/celalyze/PRD.md).

---

## 1. Overview & Project Purpose
* **Project Name:** Celalyze
* **Tagline:** Onchain Tax & Portfolio Agent for Celo
* **Primary Scope (Hackathon MVP):** Analytical, **read-only** AI agent providing PnL calculation, tax classification, and natural language portfolio insights for Celo Mainnet (`celo-mainnet`).
* **Target Tracks:** Track 3 (Askbots) & Track 4 (Aigora).

---

## 2. Design System & UI/UX Rules

When implementing or modifying any UI components or pages, you **MUST** follow these exact design tokens:

### 2.1 Color Tokens
* **Primary Color:** `#FCFF51` (Vibrant Celo Yellow) — Use for primary CTAs, active highlights, key brand accents, and focused states.
* **Secondary / Page Background:** `#FCF6F1` (Warm Soft Cream) — Main page canvas background color.
* **Card Container:** `#FFFFFF` background with sharp borders (`rounded-none`).
* **Dark Neutral Text / Borders:** `#1E1E1E` or `#111827` for high-contrast, WCAG AAA compliant text and borders over `#FCFF51` & `#FCF6F1`.

### 2.2 Typography & Font Hierarchy
* **Default / Primary Sans-Serif Font:** `Inter` — Used for all body text, UI components, data tables, buttons, inputs, and navigation.
* **Secondary / Brand Serif Font (Titles & Headings):** `GT Alpina Thin` & `GT Alpina Thin Italic` (Default weight: `400`).
  * **Scope:** All page titles, section headings (`h1`, `h2`, `h3`), hero banners, and metric card titles (*"Realized Capital Gains"*, *"Taxable Income Overview"*).
  * **CSS Standard:**
    ```css
    h1, h2, h3, .page-title, .hero-title {
      font-family: 'GT Alpina Thin', 'GT Alpina', Georgia, serif;
      font-weight: 400;
      letter-spacing: -0.02em;
    }
    .hero-title span.accent {
      font-family: 'GT Alpina Thin Italic', 'GT Alpina', Georgia, serif;
      font-style: italic;
    }
    body, p, input, button, table {
      font-family: 'Inter', sans-serif;
    }
    ```

### 2.3 Component Shapes & Border Radius Rules
* **Full Rounded (`rounded-full` / Pill Shape):**
  * Apply `rounded-full` to all small interactive elements, controls, and inline labels: **Buttons**, **Pills**, **Badges**, **Tags/Chips**, **Input Search Bars**, **Confidence Score Badges**, **Status Dots/Indicators**, and **Category Badges**.
* **Rounded None (`rounded-none` / 0px Radius):**
  * Apply `rounded-none` (0px border radius) to all structural containers and layout frames: **Card Containers**, **Dashboard Cards**, **Panels**, **Data Tables**, **Modals/Dialogs**, **Sidebars**, and **Main Section Boxes**.
  * Contrast statement: High contrast between crisp, sharp structural containers (`rounded-none`) and smooth capsule-shaped controls (`rounded-full`).

### 2.4 Strict No-Hardcoding Rule for Styling
* **NO Arbitrary Tailwind Brackets:** NEVER write hardcoded arbitrary Tailwind bracket utilities such as `text-[10px]`, `text-[11px]`, `p-[12px]`, `max-w-[220px]`, or hardcoded hex classes like `bg-[#FCF6F1]`.
* **Use Theme Variables & Standard Tokens:** Always define theme tokens in `index.css` under `@theme` (e.g. `--color-primary`, `--color-secondary`, `--color-card`, `--color-dark`, `--text-2xs`) or use standard Tailwind utility classes (`text-xs`, `text-sm`, `text-2xs`, `h-40`, `max-w-xs`).

---

## 3. Tech Stack & Architecture

* **Frontend:** Next.js (React), Tailwind CSS / Vanilla CSS, Lucide Icons, Recharts.
* **Backend:** Node.js (Express/Fastify) or Python (FastAPI).
* **Agent Orchestrator:** LangChain / LangGraph (coordinating LLMs with deterministic tools).
* **Data Layer:** GoldRush API (Covalent) for fetching Celo balances & tx history (`celo-mainnet`).
* **Database:** PostgreSQL or MongoDB (storing user wallets, manual corrections, tax reports, and chat logs).

---

## 4. Agent Tools & API Specs

### 4.1 Deterministic Agent Tools
Agents must call deterministic functions for data processing and math, reserving LLM calls solely for classification reasoning and natural language explanation.

1. `get_wallet_overview(wallet_address)` — Fetch token balances & portfolio value via GoldRush API.
2. `get_wallet_history(wallet_address, start_date, end_date)` — Fetch raw Celo transaction history.
3. `classify_transactions(raw_transactions)` — Label transactions (`Income`, `Swap`, `Yield`, `Airdrop`, `Transfer`, `Gas Fee`) with a confidence score.
4. `build_tax_report(classified_transactions, tax_rules)` — Calculate realized capital gains/losses & taxable income.
5. `summarize_insights(tax_report_data, query)` — Generate natural language summaries for Askbots chat interface.

### 4.2 API Contract Endpoints
* `POST /api/v1/analyze-wallet` — Trigger initial wallet indexing & classification.
* `GET /api/v1/tax-report` — Retrieve tax report breakdown for a specific year.
* `GET /api/v1/history` — Fetch paginated transaction history with tax labels & confidence scores.
* `POST /api/v1/history/correct` — Submit manual user corrections to update DB & trigger PnL recalculation.
* `POST /api/v1/chat` — Submit natural language query to the RAG AI Agent.
* `GET /api/v1/settings` — Get/update currency and tax region settings.

---

## 5. Security & Safety Guardrails

* **Strict Read-Only:** Celalyze NEVER requests, stores, or handles private keys. No write/send transaction capabilities exist in MVP.
* **Input Validation:** Always validate Celo/EVM wallet addresses (`0x...` 40-character hex) at API boundaries.
* **API Key Safety:** Store GoldRush API keys and LLM keys securely in `.env` environment variables. Never expose them to the client-side bundle.

---

## 6. Codebase & Development Principles (Lazy Senior Dev Mode)

1. **YAGNI & Deletion over Addition:** Do not add unrequested abstractions or extra dependencies.
2. **Single Source of Truth:** Fix root cause in shared utilities rather than wrapping individual callers.
3. **No Dumb Fallbacks:** Never swallow errors silently or return empty dummy data when an API fails; report exact error diagnostics.
4. **Verification:** Always test code changes, verify builds, and run logic checks before completing tasks.

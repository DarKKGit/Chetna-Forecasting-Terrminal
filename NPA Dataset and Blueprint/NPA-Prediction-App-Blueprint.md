# NPA Early-Warning & Predictive Provisioning System — Full Blueprint

**For:** Internal tool for credit/risk officers of a Scheduled Commercial Bank (SCB)
**Core objective:** Flag accounts likely to slip into NPA, forecast the trajectory, and recommend provisioning amounts.

---

## 1. Regulatory Foundation (design around these, don't bolt them on later)

| Instrument | Why it matters to your app |
|---|---|
| **RBI Master Direction — Commercial Banks (Income Recognition, Asset Classification and Provisioning) Directions, 2025** (issued 28 Nov 2025, replacing the old Master Circular) | Defines current NPA classification: an account is NPA when interest/principal is **overdue > 90 days**; crop loans have season-based rules; sub-classification into **Standard → SMA-0/1/2 → Sub-standard → Doubtful → Loss**. Your classification engine must mirror this exactly. |
| **RBI draft Directions on ECL-based provisioning** (issued 7 Oct 2025, effective **1 April 2027**) | This is the big one for you: RBI is moving SCBs from the *incurred-loss* model to a **forward-looking Expected Credit Loss (ECL)** model (aligned with Ind AS 109 / IFRS 9 logic — 12-month ECL for Stage 1, lifetime ECL for Stage 2/3). **Design your provisioning engine around Stage 1/2/3 buckets, not just IRAC categories**, so the bank doesn't need to rebuild it in 2027. |
| **RBI Circular DoS.CO.PPG./SEC.03/11.01.005/2020-21 — "Automation of Income Recognition, Asset Classification and Provisioning (IRACP)"** | RBI explicitly mandates that IRACP processes be **system-driven, not manual/spreadsheet-based**, with no manual overrides that bypass system logic. This is direct regulatory validation for exactly what you're building — cite it in your project justification. |
| **Ind AS 109 (Expected Credit Loss)** | Even before 2027, many banks voluntarily disclose Ind AS 109 ECL alongside IRACP for board reporting. Structure your data model to support both simultaneously. |
| **Basel III / RBI capital adequacy framework (Prompt Corrective Action - PCA)** | NPA ratios (Gross NPA %, Net NPA %) feed directly into PCA triggers. Your dashboard should show these ratios against RBI's PCA thresholds. |
| **RBI Guidelines on Compromise Settlements & Technical Write-offs (2023)** | If your app recommends resolution paths, map them to RBI-approved categories: restructuring, SDR, S4A (largely phased out), compromise settlement, write-off, IBC referral. |
| **RBI IT Governance, Risk, Controls and Assurance Practices (2023) + Cyber Security Framework for Banks** | Governs access control, audit logging, data encryption, vendor risk (relevant since you're deploying on Vercel — see Section 6). |
| **DPDP Act, 2023 (Digital Personal Data Protection Act)** | Borrower PII (PAN, Aadhaar-linked data, financials) is "personal data" — you need consent trails, purpose limitation, and data localization discipline even for an internal tool. |
| **RBI Guidance Note on Operational Risk Management & AI/ML models (FREE-AI Committee report, 2025)** | RBI has been pushing for **model explainability, human-in-the-loop override, and periodic model validation** for any AI/ML used in credit decisions. Your predictive model cannot be a black box — build in SHAP/feature-importance explanations (Section 5).|
| **SEBI relevance** | Minimal for this specific app (SEBI governs securities markets, not bank lending). It becomes relevant only if the bank also has an NBFC/AMC arm reporting to SEBI, or if NPA-linked bonds (security receipts sold to ARCs) are involved. Mention it in scope notes, don't over-engineer for it. |

---

## 2. End-to-End Process Flow

```
┌─────────────────┐   ┌──────────────────┐   ┌───────────────────┐
│ 1. DATA INGESTION│──▶│ 2. FEATURE ENGINE │──▶│ 3. CLASSIFICATION │
│ (Core banking,   │   │ (DPD trends,      │   │ ENGINE (IRAC/SMA) │
│ CRM, bureau feed)│   │ bureau scores,    │   │  Standard→SMA0/1/2│
└─────────────────┘   │ macro signals)     │   │  →Sub-std/Doubtful│
                       └──────────────────┘   │  /Loss             │
                                               └─────────┬─────────┘
                                                          ▼
┌─────────────────┐   ┌──────────────────┐   ┌───────────────────┐
│ 6. WORKFLOW &    │◀──│ 5. PROVISIONING   │◀──│ 4. PREDICTIVE     │
│ APPROVAL (RM →   │   │ RECOMMENDATION    │   │ RISK SCORING      │
│ RCO → CRO sign-  │   │ (IRAC floor + ECL │   │ (PD/LGD/EAD model,│
│ off, audit trail) │   │ Stage 1/2/3 calc) │   │ early-warning     │
└────────┬─────────┘   └──────────────────┘   │ signal ranking)    │
         ▼                                     └────────────────────┘
┌─────────────────┐   ┌──────────────────┐
│ 7. REPORTING &   │   │ 8. FEEDBACK LOOP  │
│ MIS (Board pack, │──▶│ (model retrain,   │
│ RBI returns,      │   │ actual vs         │
│ regulator export) │   │ predicted drift)  │
└─────────────────┘   └──────────────────┘
```

### Step-by-step

1. **Data ingestion** — nightly/real-time batch feed from Core Banking System (CBS — Finacle/BaNCS/TCS BaNCS/Flexcube), plus bureau data (CIBIL/Experian/CRIF), GST returns (for MSME), and macro indicators.
2. **Feature engineering** — derive DPD (days-past-due) trend slope, bounce/dishonour frequency, utilization of sanctioned limit, restructuring history, sector stress indicators, collateral value drift.
3. **Rule-based classification engine** — deterministic, RBI-compliant. This layer must be **auditable and non-ML** because regulators expect the base NPA classification to follow explicit, objective rules (para 1.2 of the IRAC directions explicitly says classification must be "objective," not "subjective"). ML sits *on top of* this, not instead of it.
4. **Predictive risk scoring** — ML layer estimates Probability of Default (PD) over next 30/60/90/180 days, ranks accounts by risk, flags early-warning signals before they hit 90 DPD.
5. **Provisioning recommendation** — combines (a) the regulatory IRAC minimum-provisioning floor (mandatory, non-negotiable) with (b) the ECL-style forward estimate (PD × LGD × EAD) as a prudential overlay, and flags cases where the bank may want to hold more than the floor.
6. **Workflow/approval** — Relationship Manager sees flags → Recovery/Credit officer reviews → Chief Risk Officer or committee signs off on the provisioning number → everything logged immutably.
7. **Reporting/MIS** — feeds Board risk-management committee packs, RBI DSB/CRILC/XBRL returns, statutory audit workpapers.
8. **Feedback loop** — track actual slippage vs predicted, feed back into model retraining (critical for RBI model-validation expectations).

---

## 3. Feature/Module List

### Must-have (MVP)
- **Portfolio dashboard** — Gross NPA %, Net NPA %, Provision Coverage Ratio (PCR), sector-wise stress heatmap
- **Account-level 360° view** — borrower profile, loan details, repayment history, collateral, guarantor info
- **SMA/NPA classification tracker** — where every account sits: Standard → SMA-0 (1-30 DPD) → SMA-1 (31-60) → SMA-2 (61-90) → NPA sub-classes
- **Early-warning signal (EWS) engine** — configurable rule set (RBI's own EWS framework for large borrowers is a good reference — bounced cheques, delayed stock statements, auditor qualification, rating downgrade, related-party stress)
- **Predictive risk score per account** — PD over multiple horizons, with confidence bands
- **Provisioning calculator** — IRAC-floor provisioning + ECL-style Stage 1/2/3 estimate, side by side
- **Workflow & approval trail** — maker-checker, e-signature/approval logging (immutable, timestamped)
- **Alerts & notifications** — auto-flag accounts crossing SMA thresholds, breach of covenant, restructuring due dates
- **Reports/export** — CRILC-format exports, board MIS packs, RBI return-ready CSVs

### Should-have (v2)
- **What-if simulator** — "if repo rate rises 50bps, how does portfolio PD shift"
- **Sector/geography stress overlay** — map RBI sectoral stress data (e.g. real estate, MSME) onto your portfolio
- **Restructuring/resolution recommender** — suggests SDR/compromise/IBC path based on account profile
- **Collateral valuation drift tracker** — flags stale valuations (RBI expects periodic revaluation)
- **Explainability panel** — SHAP-value chart showing *why* a given account got a high risk score (regulatory requirement, see Section 1)
- **Model governance panel** — model version, last validation date, drift metrics (PSI/CSI), backtesting accuracy

### Nice-to-have (v3)
- **Natural-language account summary** (LLM-generated narrative from structured data — keep this clearly labeled "AI-generated, human-verify")
- **Peer benchmarking** — compare your bank's NPA ratios to RBI's published system-wide data
- **Mobile-responsive officer view** for field visits

---

## 4. Dataset Design

You'll typically need 5-7 core tables/entities feeding the model. Here's a realistic schema:

### 4.1 `loan_account_master`
| Field | Type | Notes |
|---|---|---|
| account_id (PK) | string | internal CBS account number |
| customer_id (FK) | string | links to borrower |
| product_type | enum | Term Loan, CC, OD, KCC, Home Loan, MSME, etc. |
| sanctioned_amount | decimal | |
| outstanding_amount | decimal | |
| sanction_date | date | |
| disbursement_date | date | |
| maturity_date | date | |
| interest_rate | decimal | |
| repayment_frequency | enum | monthly/quarterly/bullet |
| sector | string | NIC code / RBI sector classification |
| collateral_type | enum | secured/unsecured, type |
| collateral_value | decimal | with last valuation date |
| restructured_flag | boolean | + restructuring history count |
| branch_code | string | |
| relationship_manager_id | string | |

### 4.2 `repayment_schedule` / `transaction_ledger`
| Field | Type | Notes |
|---|---|---|
| txn_id (PK) | string | |
| account_id (FK) | string | |
| due_date | date | |
| due_amount | decimal | principal + interest split |
| paid_date | date | nullable |
| paid_amount | decimal | |
| dpd | integer | **days past due — core driver field** |
| bounce_flag | boolean | cheque/ECS/NACH bounce |

### 4.3 `classification_history`
| Field | Type | Notes |
|---|---|---|
| account_id (FK) | string | |
| as_of_date | date | monthly snapshot — **keep full history, never overwrite** |
| irac_category | enum | Standard/SMA-0/SMA-1/SMA-2/Sub-standard/Doubtful-1/2/3/Loss |
| dpd_at_snapshot | integer | |
| provision_amount | decimal | |
| provision_rate_applied | decimal | |

### 4.4 `borrower_profile`
| Field | Type | Notes |
|---|---|---|
| customer_id (PK) | string | |
| customer_type | enum | Individual/MSME/Corporate/Agri |
| credit_bureau_score | integer | CIBIL/Experian, with score date |
| bureau_reported_dpd_other_banks | integer | cross-bank exposure signal |
| existing_relationship_years | integer | |
| industry_risk_rating | string | internal or RBI sector rating |
| kyc_risk_category | enum | low/medium/high |
| financial_ratios | json | current ratio, DSCR, leverage — for corporate/MSME |

### 4.5 `early_warning_signals`
| Field | Type | Notes |
|---|---|---|
| account_id (FK) | string | |
| signal_date | date | |
| signal_type | enum | cheque bounce, stock-statement delay, auditor qualification, rating downgrade, related-party stress, GST mismatch, utility default |
| severity | enum | low/medium/high |
| source | string | which system flagged it |

### 4.6 `macro_indicators` (external, low-frequency)
| Field | Type | Notes |
|---|---|---|
| date | date | |
| repo_rate | decimal | |
| sector_stress_index | json | RBI Financial Stability Report sector data |
| inflation_cpi | decimal | |
| gdp_growth_estimate | decimal | |

### 4.7 `provisioning_recommendation` (model output, audited)
| Field | Type | Notes |
|---|---|---|
| account_id (FK) | string | |
| run_date | date | |
| irac_floor_provision | decimal | regulatory minimum |
| ecl_stage | enum | Stage 1 / Stage 2 / Stage 3 |
| ecl_estimated_provision | decimal | PD × LGD × EAD |
| recommended_provision | decimal | max(floor, ECL estimate) typically |
| pd_30d / pd_60d / pd_90d / pd_180d | decimal | model outputs |
| model_version | string | for governance/audit |
| approved_by | string | maker-checker trail |
| approval_status | enum | pending/approved/rejected/overridden |
| override_reason | text | nullable, mandatory if overridden |

> **Data source reality check:** in a real bank, most of this comes from the Core Banking System (structured extracts), the credit bureau API, and internal MIS — you won't be building original data collection, you'll be building the **ingestion, transformation, scoring, and presentation layer** on top of it. For your prototype/college version, you'll need to **simulate this dataset synthetically** (I can generate a realistic synthetic dataset generator script for you if useful — just ask).

---

## 5. Predictive Analytics Approach

### 5.1 Two-layer design (important)
- **Layer 1 — Deterministic/regulatory classification.** Pure rules engine implementing RBI's DPD-based IRAC logic. No ML here. This is your "ground truth" and what appears in regulatory filings.
- **Layer 2 — Predictive/forward-looking layer.** This is where ML earns its keep: predicting *which currently-Standard or SMA accounts will likely deteriorate*, before the deterministic rule catches them at 90 DPD. This is literally the definition of an "early warning system."

### 5.2 Model choices, roughly in order of what a real bank credit-risk team would use

| Model | Use | Why |
|---|---|---|
| **Logistic Regression** (baseline) | PD estimation | Simple, interpretable, easy to justify to RBI/auditors, good baseline to benchmark fancier models against |
| **Gradient Boosted Trees (XGBoost/LightGBM)** | PD estimation, EWS ranking | Best accuracy on tabular banking data; supports SHAP explainability |
| **Survival analysis (Cox proportional hazards)** | "Time to default" — not just will it default, but *when* | More actionable than a binary flag — tells the officer "likely to slip in ~45 days" |
| **Logistic regression / trees for LGD (Loss Given Default)** | Estimate recovery rate given collateral type/value | Feeds ECL = PD × LGD × EAD |
| **Isolation Forest / anomaly detection** | Flag unusual transaction/behavior patterns (fraud-adjacent signals) | Useful for the EWS module, not core PD |
| **Rule-based scorecard (RBI-style EWS)** | Fallback/complement to ML, fully transparent | RBI examiners and internal auditors trust rule-based scorecards more than black-box ML; run both, show both |

### 5.3 Key predictive features (in rough importance order for Indian bank NPA prediction, based on published research and industry EWS frameworks)
1. DPD trend (is DPD increasing month-over-month, and how fast)
2. Cheque/ECS/NACH bounce frequency in last 3/6 months
3. Utilization of sanctioned limit (sudden spike or full utilization is a stress signal)
4. Restructuring history (previously restructured accounts have much higher re-default rates)
5. Bureau score trend (not just level — the *direction* matters)
6. Cross-bank exposure stress (borrower defaulting elsewhere, from bureau data)
7. Sector stress (real estate, textiles, gems & jewellery, aviation have historically been higher-risk sectors per RBI's Financial Stability Reports)
8. Collateral value drift / staleness of valuation
9. Financial ratio deterioration (DSCR, current ratio) for corporate/MSME borrowers
10. Qualitative EWS flags (auditor qualification, resignation of auditor, rating downgrade, related-party transactions)

### 5.4 Model governance (RBI expects this — don't skip it)
- Version every model, log training data date range
- Track PSI (Population Stability Index) / CSI to detect data/model drift
- Quarterly backtesting: predicted PD vs actual slippage
- Maintain a **model validation document** (independent of the model-building team) — this is standard practice and increasingly an explicit RBI supervisory expectation post the FREE-AI Committee report (2025)
- Always show a **human override** option with mandatory reason capture — no fully-automated provisioning decision should be forced through without an approver

### 5.5 Where to run the ML
Vercel is a serverless frontend/edge platform — **it is not designed for training or running heavy ML models**. Plan for:
- **Frontend:** React app on Vercel (fast, free tier friendly, great DX)
- **API/backend:** Node.js/Express or Python/FastAPI, deployed separately (Render, Railway, AWS ECS/Lambda, or GCP Cloud Run) — this hosts your business logic, auth, and calls to the model
- **ML serving:** Python (scikit-learn/XGBoost) model, either:
  - packaged as a REST microservice (FastAPI + Docker) hosted on Cloud Run/Render/EC2, or
  - precomputed batch scoring (nightly job) writing results to your database, with the API just reading pre-scored results (simpler, cheaper, and honestly more realistic for a banking workflow since NPA classification doesn't need to be real-time)
- **Database:** PostgreSQL (Supabase/Neon/RDS) — relational integrity matters a lot here given the audit-trail requirements above

For a real bank deployment, none of this would sit on public cloud without going through the bank's IT/infosec approval and RBI's outsourcing/cloud guidelines (RBI's 2023 cloud computing guidance emphasizes data localization and vendor risk assessment) — but for your prototype/learning build, Vercel + a small managed Postgres + a Python microservice is a perfectly reasonable stack.

---

## 6. Tech Stack Recommendation

| Layer | Recommendation |
|---|---|
| Frontend framework | React (Vite, not CRA — CRA is deprecated) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui component library (clean, accessible, fast to theme) |
| Charts | Recharts (React-native, good for line/bar/area) + D3 for anything custom (Sankey flows for NPA migration, network graphs for related-party exposure) |
| State management | React Query (server state) + Zustand (light client state) — avoid Redux unless the app grows very large |
| Auth | Role-based access control (RBAC) — RM / Credit Officer / CRO / Auditor roles, each with different data visibility. Use something like Auth0/Clerk for the prototype; a real bank would integrate with internal AD/SSO |
| Backend | Node.js (Express/Nest.js) for the general API; Python (FastAPI) for the ML scoring service |
| Database | PostgreSQL — strong relational integrity for audit trails; consider TimescaleDB extension if you want efficient time-series storage for DPD history |
| ML/data science | pandas, scikit-learn, XGBoost, SHAP (explainability), statsmodels (for survival analysis) |
| Deployment | Vercel (frontend) + Render/Railway/Cloud Run (backend + ML service) + Supabase/Neon (Postgres) |
| Audit/logging | Every write to `provisioning_recommendation` and `classification_history` should be append-only / event-sourced, never hard-deleted or overwritten — critical for RBI audit trail expectations |

---

## 7. UI/UX & Colour Direction

For a banking risk-analytics tool, the aesthetic goal is **"trustworthy, calm, high information density without clutter"** — not flashy fintech-consumer colors. Risk officers stare at this all day; avoid eye strain and over-saturated alert colors everywhere.

### 7.1 Recommended palette

**Primary (brand/structural) — muted navy/indigo:**
- `#0F2A47` (deep navy — headers, nav)
- `#1E4B7A` (mid navy-blue — primary buttons, active states)
- `#4A7BA6` (soft blue — secondary elements, links)

**Neutral/background:**
- `#F7F9FC` (near-white background — easier on the eyes than pure white for data-dense screens)
- `#FFFFFF` (card backgrounds)
- `#E4E9F0` (borders/dividers)
- `#5B6B82` (secondary text)
- `#1A2333` (primary text)

**Semantic risk colors (the most important part — these must be intuitive and colorblind-safe):**
- **Standard/healthy:** `#2E9E5B` (green, not neon)
- **SMA-0/Watch:** `#7BAE3F` (yellow-green)
- **SMA-1:** `#E0A72E` (amber)
- **SMA-2/high alert:** `#E07B2E` (orange)
- **NPA — Sub-standard:** `#D64545` (red)
- **NPA — Doubtful:** `#A63232` (deep red)
- **NPA — Loss:** `#6B1F1F` (maroon/near-black red)

> Use this as a **single continuous sequential scale** (green → amber → orange → red → maroon) for heatmaps and severity indicators — it reads intuitively even to non-color-sensitive users, and works reasonably in grayscale print (increasing darkness) which matters for board reports.

**Accent (for CTAs, highlights, focus states):**
- `#2D7DD2` (a slightly brighter blue than primary, for interactive highlights)

### 7.2 Chart-specific guidance
- **Portfolio composition (Standard vs SMA vs NPA):** stacked bar or donut using the semantic risk scale above
- **NPA migration over time (Standard → SMA0 → SMA1 → SMA2 → NPA):** **Sankey diagram** — extremely effective for showing account flow between categories month over month, and it's a visualization risk committees specifically like
- **PD trend per account:** line chart with confidence band (shaded area), amber/red threshold lines overlaid
- **Sector-wise stress heatmap:** matrix/treemap, using the same risk color scale
- **Provisioning coverage:** combo chart — bars for provision amount, line overlay for PCR %
- **Geographic/branch stress:** choropleth if you want to invest in it, otherwise a sorted bar chart is honestly more usable for internal ops
- Keep chart backgrounds white/near-white, gridlines very light gray (`#E4E9F0`), and never use more than 5-6 colors in a single chart — split into small multiples instead if you have more categories

### 7.3 Typography
- UI font: **Inter** or **IBM Plex Sans** (IBM Plex has a nice "institutional but modern" feel, several PSU banks/fintechs use it)
- Numeric/tabular data: use `font-variant-numeric: tabular-nums` so numbers align in columns — small detail, big perceived-quality boost in a financial dashboard
- Monospace for account numbers/IDs: **IBM Plex Mono** or **JetBrains Mono**

---

## 8. Things You Likely Haven't Thought Of Yet

1. **Maker-checker / four-eyes principle** — no single officer's model output should auto-become the official provisioning number. Build approval workflow in from day one, not as an afterthought.
2. **Immutable audit log** — RBI examiners will ask "show me why this account's classification changed on this date." Use an append-only event log, not just an updated-in-place row.
3. **Model explainability UI** — a risk officer will not trust (or should not blindly trust) a "72% risk score" with no explanation. Show top 3-5 contributing factors per prediction (SHAP values rendered as a simple horizontal bar chart is enough).
4. **Handling data quality/missingness gracefully** — real CBS data has gaps, and your model needs a defined fallback (e.g., default to rule-based classification if key features are missing) rather than silently producing a wrong score.
5. **CRILC reporting alignment** — RBI's Central Repository of Information on Large Credits (CRILC) requires banks to report SMA status for large exposures (₹5 crore+) even before NPA. If you want a genuinely differentiated feature, add a CRILC-format export.
6. **Restructuring re-default tracking** — restructured accounts have a separate, usually higher, risk profile. RBI has specific provisioning treatment for restructured standard assets vs restructured NPAs — model them as a distinct cohort.
7. **Seasonal/agricultural loan logic** — if the bank has agri exposure, NPA classification for crop loans uses **crop season**, not a flat 90-day rule. Don't hardcode 90 days everywhere.
8. **Data localization & cloud vendor risk** — if this ever goes beyond prototype into a real bank's environment, RBI's outsourcing and cloud guidelines will restrict where data can sit (India-based data centers for critical data, board-approved outsourcing policy, right-to-audit clauses with cloud vendors).
9. **Fair lending / bias check on the model** — even though this is internal-facing, a model that systematically flags certain borrower segments as high-risk disproportionately (geography, small-ticket MSME, etc.) can create real regulatory/reputational exposure. Worth a basic disparate-impact check even in a prototype.
10. **Disaster recovery / business continuity** — RBI expects defined RTO/RPO for critical banking systems; even a v1 prototype benefits from documenting this as a "future requirement."
11. **Access-level data masking** — a branch-level RM probably shouldn't see full portfolio-wide analytics; a regional CRO should. Design row-level security into your DB queries early, it's painful to retrofit.
12. **Non-technical stakeholder value** — build at least one "explain this to my Board" view: 4-5 headline numbers (Gross NPA%, Net NPA%, PCR, Slippage ratio, Fresh-NPA-this-quarter) in large, simple cards. This is the screen that actually gets shown in committee meetings.

---

## 9. Suggested Build Sequence (given you're starting from zero)

1. Design the DB schema (Section 4) and build a **synthetic data generator** so you have realistic-looking data to build against
2. Build the deterministic IRAC classification engine first (pure rules — no ML) and get it 100% correct against RBI's DPD logic
3. Build the core dashboard UI (portfolio view, account 360° view) against this rule-based data — get the visual language and color system right early
4. Layer in the PD/EWS predictive model once the rules layer and UI are stable
5. Add the provisioning calculator (IRAC floor + ECL estimate side by side)
6. Add workflow/approval and audit logging
7. Add explainability, reporting/export, and the "what-if" simulator last

---

If it's useful, I can next generate:
- A **synthetic dataset generator script** (Python or JS) that produces realistic loan accounts, repayment histories, and DPD trajectories for you to prototype against
- A **starter React + Tailwind dashboard component** with the color system and a sample Sankey/heatmap chart wired up
- A **DB schema as actual SQL** (Postgres) ready to run

Just tell me which one to start with.

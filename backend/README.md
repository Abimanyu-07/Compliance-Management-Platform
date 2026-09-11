# InnovX Backend

Problem Statement 20 — Intelligent Business Approval, Licensing and Compliance Management Platform  
YHACK '26 | Team InnovX | Software / AI & Digital Governance

InnovX is an AI-powered compliance copilot that transforms fragmented business approvals into one intelligent guided workflow — helping businesses understand what they need, prepare their documents, know where to apply, track their applications, understand dependencies, identify risks, and know what action to take next.

This is a **hackathon MVP**, not a production government platform. Actual government application submission happens through the relevant official government channel unless an authorized API is available.

## Tech Stack

- Python 3.12
- FastAPI + Uvicorn
- SQLAlchemy
- PostgreSQL (SQLite fallback for local demo)
- Pydantic
- python-multipart
- Local file storage (`uploads/`)
- Optional OCR via pytesseract when installed

## Architecture

```text
backend/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed.py
│   ├── routers/
│   ├── services/
│   ├── data/
│   └── utils/
├── uploads/
├── requirements.txt
└── .env
```

Rule engines (requirements, documents, risk, dependencies, next-best-action) are deterministic and explainable. An LLM is not required.

## Database

Core tables: `business`, `requirement`, `requirement_document`, `application`, `document`, `dependency`, `grievance`, `scheme`.

If PostgreSQL is unavailable, the API automatically uses `sqlite:///./innovx.db`.

## Environment Setup

Copy or edit `backend/.env`:

```text
DATABASE_URL=sqlite:///./innovx.db
SECRET_KEY=innovx-yhack26-dev-secret-change-me
UPLOAD_DIR=uploads
FRONTEND_URL=http://localhost:5173
```

PostgreSQL example:

```text
DATABASE_URL=postgresql://user:password@localhost:5432/innovx
```

## AI Compliance Copilot (`/api/copilot/chat`)

The copilot is the one place in this backend where a real LLM (Claude) is used. Every other
engine (requirements, risk, dependencies, next-best-action) stays 100% deterministic on
purpose — the model is only allowed to **phrase** an answer using facts the deterministic
engines already computed, never to invent regulatory facts.

To turn it on:

```text
ANTHROPIC_API_KEY=sk-ant-...
COPILOT_MODEL=claude-sonnet-4-6      # or claude-haiku-4-5-20251001 for lower latency/cost
COPILOT_MAX_TOKENS=400
COPILOT_TIMEOUT_SECONDS=12
```

Behavior:

- **Key configured + call succeeds** → `data.ai_powered = true`, `data.answer` is a Claude-generated
  response grounded in a JSON context block (business profile, approvals, documents, risk score,
  dependency status, next-best-action, potential scheme matches). See
  `app/services/ai_service.py` for the exact system prompt and grounding rules.
- **Key missing, package missing, call fails, or times out** → automatically falls back to the
  original deterministic, keyword-templated answer (`data.ai_powered = false`). The endpoint
  never errors because of the AI layer.
- **Suggested action routes** (`data.suggested_actions`, and every route inside
  `data.next_best_action.actions`) always come from the deterministic recommendation engine —
  the model is never trusted to invent frontend routes, so the UI never gets sent somewhere
  that doesn't exist.

Run `pytest tests/test_copilot_ai.py` to see the AI path exercised with a mocked model call
(no API key required for tests).

## AI/ML Architecture

InnovX uses a **hybrid** risk intelligence design: the original deterministic rule engine is
never removed or replaced. A Random Forest ML layer sits alongside it as a second, independent
signal.

```text
                 EXISTING FRONTEND
                        │
                        ▼
                 EXISTING FASTAPI
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
   Requirement      Documents     Applications
     Engine          Service        Service
          │             │             │
          │             ▼             │
          │       Document AI         │
          │    (extraction+field      │
          │     level validation)     │
          └─────────────┼─────────────┘
                        ▼
               HYBRID RISK INTELLIGENCE
                        │
        ┌───────────────┼────────────────┐
        ▼                                ▼
  Rule Engine                    Random Forest ML
 (risk_engine.py:               (ml_risk_service.py)
  score_application,             loads ml/risk_model.pkl
  business_risk — UNCHANGED)     once at import time
        │                                │
        └───────────────┬────────────────┘
                        ▼
             hybrid_application_risk()
             hybrid_business_risk()
             simulate_what_if()
                        │
                        ▼
               Next Best Action + AI Copilot
                        │
                        ▼
                    EXISTING UI
```

### Random Forest Risk Model

- **Location:** `ml/train_risk_model.py`, `ml/evaluate_risk_model.py`, `ml/model_config.py`,
  `ml/risk_model.pkl` (generated), `data/risk_training_data.csv` (generated).
- **Features** (exact order defined once in `ml/model_config.FEATURE_NAMES`, shared by
  training and inference so they can never drift apart):
  `missing_documents`, `document_errors`, `dependencies`, `inspection_required`,
  `application_complexity`, `days_to_deadline`, `number_of_requirements`.
- **Training data:** 3,000 synthetic records (`numpy.random.default_rng(42)`), with a risk
  label derived from a weighted combination of the features plus Gaussian noise — logically
  meaningful (more missing docs / errors / dependencies / inspection / deadline pressure ⇒
  higher risk) but not a formula the model can simply memorize.
- **Model:** `RandomForestClassifier(n_estimators=200, max_depth=10, class_weight="balanced",
  random_state=42)`, 80/20 stratified split.
- **Typical metrics on the synthetic evaluation split** (will vary slightly if retrained):
  Accuracy ≈ 0.82, Precision ≈ 0.61, Recall ≈ 0.71, F1 ≈ 0.66, ROC-AUC ≈ 0.87. Feature
  importance is dominated by `missing_documents` and `days_to_deadline`.
- **Inference:** `app/services/ml_risk_service.py` loads the `.pkl` once (`functools.lru_cache`),
  extracts features live from the database (reusing the existing `document_validator` /
  `dependency_engine` helpers — no duplicated logic), calls `predict_proba()`, and converts the
  positive-class probability into a 0–100 `risk_score` (0–34 LOW, 35–69 MEDIUM, 70–100 HIGH).
- **Never retrains during a request.** If `risk_model.pkl` is missing or fails to load, every
  ML function returns `None` and the hybrid endpoints fall back to rule-engine-only output —
  the rest of the app keeps working.

**⚠️ Limitations:** The current ML model is a prototype trained on synthetic application
scenarios. It is **not** a production-grade government approval prediction model and its
metrics do not represent real-world approval/rejection accuracy. Production deployment would
require authorized and appropriately anonymized historical approval data.

### Training / evaluating the model

From the `backend` folder (works identically on Windows/macOS/Linux):

```bash
python ml/train_risk_model.py
python ml/evaluate_risk_model.py
```

`train_risk_model.py` regenerates `data/risk_training_data.csv`, trains the model, prints
accuracy/precision/recall/F1/ROC-AUC + a confusion matrix + feature importances, and saves
`ml/risk_model.pkl`. Starting FastAPI never trains anything — it only loads the existing `.pkl`.

### Hybrid Risk Endpoints

- `GET /api/risk/{business_id}` — **backward compatible.** Still returns the original
  `readiness_score` / `risk_level` / `factors` from the rule engine, plus new `risk_score`,
  `risk_probability`, `model`, and `feature_importance` fields from the Random Forest.
- `GET /api/risk/application/{application_id}` — hybrid risk for a single application, plus a
  deterministic `next_best_action` sentence (built from the rule engine's own blocking-reason
  logic — no LLM/ML involved in choosing *what* to recommend).
- `POST /api/risk/what-if/{business_id}` — **what-if compliance simulator.** Recomputes hybrid
  risk assuming missing documents / document errors / blocking dependencies are resolved,
  using the exact same scoring logic as the live endpoints. Never writes to the database —
  purely a hypothetical comparison (`current` vs `simulated`).

### Document Intelligence

`app/services/document_validator.py` (existing) now also returns a `field_issues` list
alongside the original `issues` list, e.g.:

```json
{"field": "district", "message": "Document district ('Coimbatore') does not match business profile ('Erode')."}
```

Field extraction (`business_name`, `district`/`city`, etc.) uses simple, deterministic
"Label: value" text-line matching over the existing OCR/text-extraction pipeline
(`.txt` direct read, `pypdf` for PDFs, `pytesseract`+`Pillow` for images when installed). If no
extractable text layer is found, validation gracefully falls back to filename-based heuristics
instead of failing — OCR is enhancement, not a hard requirement.

Every document validation still calls the existing `refresh_application()`, so **application
risk automatically recalculates** after a document is uploaded/validated — this is what makes
the risk score change dynamically in the demo.

### AI Compliance Copilot + ML grounding

The copilot's context block (see `app/routers/copilot.py: _build_context`) now also includes
`ml_risk_score`, `ml_risk_probability`, and `ml_model` from the hybrid risk engine, plus
`why_it_matches` reasoning for scheme matches — so when Claude is configured, it can explain
*why* an application is high risk using both the rule-engine factors and the ML score, without
ever inventing a number itself.

### Scheme / Incentive Matching

`app/services/scheme_engine.py` (existing) now also returns `why_it_matches` (a short
plain-English reason) and `eligibility_factors` (a checklist of sector/state/investment/size
matches) alongside the existing `match_score` and `eligibility: "Potential Match"` — still pure
deterministic matching, no embeddings/LLM involved.

## How to Run

From the `backend` folder:

```bash
python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python ml\train_risk_model.py

uvicorn app.main:app --reload
```

`ml/train_risk_model.py` only needs to be run once (or whenever you want to regenerate the
model) — it writes `ml/risk_model.pkl`, which is loaded once at FastAPI startup. If you skip
this step, the app still runs fine; `/api/risk/*` responses just fall back to rule-engine-only
output with `"model": {"available": false}`.

API: http://localhost:8000  
Swagger: http://localhost:8000/docs

## Seed Data

On first start the API seeds:

- Demo business: **Arun Manufacturing Pvt. Ltd.** (Food Manufacturing, Coimbatore, Tamil Nadu)
- 12 prototype requirements (GST, Business Registration, Pollution Consent, Factory Licence, …)
- Required documents, applications, dependencies, schemes, and a sample grievance

Treat all catalogue data as **prototype/demo regulatory data**, not legal advice.

Pollution Consent is requirement **id 3** and starts with Project Report missing so the demo next-best-action is:

**Complete Pollution Consent Documentation**

## API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/business` | Create profile + run requirement engine |
| GET/PUT | `/api/business/{id}` | Read / update profile |
| GET | `/api/requirements/{business_id}` | Applicable requirements |
| GET | `/api/approvals/{business_id}` | Approval checklist |
| GET | `/api/approvals/{business_id}/{approval_id}` | Approval detail |
| GET | `/api/approvals/{id}/where-to-apply` | Authority + portal |
| GET | `/api/approvals/{id}/documents` | Required documents |
| POST | `/api/documents/upload` | Multipart upload |
| POST | `/api/documents/{id}/validate` | Field/consistency checks |
| POST | `/api/applications` | Create / refresh application |
| GET | `/api/applications/{id}` | Tracking + timeline |
| PATCH | `/api/applications/{id}/status` | Status transition |
| GET | `/api/dependencies/{business_id}` | Graph JSON |
| GET | `/api/risk/{business_id}` | Hybrid risk (rule engine + Random Forest ML) |
| GET | `/api/risk/application/{application_id}` | Hybrid risk for one application + next-best-action |
| POST | `/api/risk/what-if/{business_id}` | What-if compliance simulator (no DB writes) |
| GET | `/api/recommendations/{business_id}` | Next-best-action |
| POST | `/api/copilot/chat` | AI compliance copilot (Claude-powered, deterministic fallback) |
| GET | `/api/incentives/{business_id}` | Potential Match schemes |
| GET/POST/PATCH | `/api/grievances` | Grievance desk |
| GET | `/api/dashboard/{business_id}` | Dashboard aggregate |

Responses:

```json
{ "success": true, "data": {}, "message": "Operation successful" }
```

```json
{ "success": false, "error": { "code": "DOCUMENT_MISSING", "message": "..." } }
```

Unverified government URLs are returned as `official_portal: null` with `portal_status: "VERIFY_BEFORE_USE"`.

## Demo Flow

1. `GET /api/dashboard/1`
2. Open Pollution Consent: `GET /api/approvals/3`
3. Documents: `GET /api/approvals/3/documents?business_id=1`
4. Upload Project Report: `POST /api/documents/upload`
5. Validate: `POST /api/documents/{id}/validate`
6. Create/refresh application: `POST /api/applications` with `{"business_id":1,"requirement_id":3}`
7. Dependency graph: `GET /api/dependencies/1`
8. Next action: `GET /api/recommendations/1`

For a 100% document validation in the demo, upload a `.txt` (or text-based PDF) that contains **Arun Manufacturing** and **Coimbatore**. A scan/PDF with no extractable text typically scores a **WARNING** (address mismatch).

## Frontend Integration

CORS allows `http://localhost:5173`. Point the React app at:

```text
VITE_API_URL=http://localhost:8000/api
```

## Future Improvements

- Authorized government APIs (when officially available)
- Production authentication
- Real historical approval data to replace the synthetic Random Forest training set
- Real OCR pipeline and verified legal catalogues
- Payment / inspection scheduling (out of scope for this MVP)
- Wire `Documents.jsx` / `AIRecommendations.jsx` to the new `field_issues` and ML risk fields
  (currently only `RiskIntelligence.jsx` and the Dashboard's risk summary consume them)

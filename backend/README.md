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

## How to Run

From the `backend` folder:

```bash
python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

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
| GET | `/api/risk/{business_id}` | Explainable risk |
| GET | `/api/recommendations/{business_id}` | Next-best-action |
| POST | `/api/copilot/chat` | Deterministic copilot |
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
- Optional LLM layer on top of live backend facts
- Production authentication
- Real OCR pipeline and verified legal catalogues
- Payment / inspection scheduling (out of scope for this MVP)

# InnovX — Intelligent Compliance, Licensing & Business Approval Platform
**YHACK '26 | Team InnovX | Software / AI & Digital Governance**

InnovX is an AI-powered compliance copilot that transforms fragmented business approvals into one unified guided workflow — helping businesses understand what they need, prepare and validate their documents, know where to apply, track their applications, understand multi-department dependencies, identify risks, and know what action to take next.

---

## Architecture Overview

```text
Compliance-Management-Platform/
├── backend/                  # FastAPI + SQLAlchemy + Rule Engines + SQLite/PostgreSQL
│   ├── app/
│   │   ├── main.py           # FastAPI application entrypoint & middleware
│   │   ├── models.py         # Database schema models
│   │   ├── routers/          # Modular API endpoints (business, approvals, copilot, etc.)
│   │   ├── services/         # Rule engines (requirement, risk, recommendation, validator)
│   │   └── seed.py           # Demo seed data (Arun Manufacturing Pvt. Ltd.)
│   ├── uploads/              # Local document storage
│   └── requirements.txt
│
└── frontend/                 # React 18 + Vite + TailwindCSS + Lucide Icons + Recharts
    ├── src/
    │   ├── components/       # UI layout, business switcher, modal components
    │   ├── context/          # AppContext connecting to FastAPI backend
    │   ├── pages/            # Dashboard, Approvals, Documents, Applications, Risk, Copilot
    │   └── services/         # apiService.ts client for backend API
    └── vite.config.ts        # Vite dev server with proxy to backend (http://127.0.0.1:8000)
```

---

## How to Run Frontend & Backend

### 1. Start the Backend (FastAPI)

From the root directory:

```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Start the Frontend (Vite)

In a separate terminal window:

```bash
cd frontend
npm run dev
```

- Web App: `http://localhost:5173`

---

## Connected Features & Endpoints

| Feature | Frontend Page | FastAPI Backend Endpoint |
|---|---|---|
| **Business Workspaces** | `/business` & Modal | `GET /api/business`, `POST /api/business`, `PUT /api/business/{id}` |
| **Live KPI Dashboard** | `/dashboard` | `GET /api/dashboard/{business_id}` |
| **Approvals Checklist** | `/approvals`, `/approvals/:id` | `GET /api/approvals/{business_id}`, `GET /api/approvals/{id}/where-to-apply` |
| **Document Intelligence** | `/documents` | `POST /api/documents/upload`, `POST /api/documents/{id}/validate` |
| **Application Tracker & Timeline** | `/applications` | `GET /api/applications/business/{id}`, `PATCH /api/applications/{id}/status` |
| **Dependency Graph** | `/dependencies` | `GET /api/dependencies/{business_id}` |
| **Risk & Delay Intelligence** | `/risk` | `GET /api/risk/{business_id}` |
| **AI Compliance Copilot** | `/ai-recommendations` | `POST /api/copilot/chat` |
| **Grievance Desk** | `/grievances` | `GET /api/grievances/{business_id}`, `POST /api/grievances` |
| **Schemes & Subsidies** | `/incentives` | `GET /api/incentives/{business_id}` |

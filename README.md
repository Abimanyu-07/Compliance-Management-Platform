# InnovX — Intelligent Business Approval, Licensing & Compliance Management Platform

**Problem Statement 20** | **YHACK '26** | **Team InnovX** | Software / AI & Digital Governance

InnovX is an AI and ML-powered compliance intelligence platform that transforms complex business licensing and government approvals into a guided, automated workflow. It empowers business owners to understand requirements, validate documents via OCR, evaluate compliance risk using Machine Learning, and interact with an AI Copilot for next-best actions.

---

## 🌟 Key Features

1. **AI Compliance Copilot:** Conversational AI grounded in deterministic regulatory data and live business context. Supports Google Gemini, OpenAI, Groq, and Anthropic Claude.
2. **Hybrid ML Risk Intelligence:** A local Random Forest classifier (`scikit-learn`) alongside deterministic rule engines evaluating compliance health scores, risk probabilities, and feature importances.
3. **Interactive What-If Risk Simulator:** Test how resolving missing documents or pending requirements lowers compliance risk in real time.
4. **Document AI & OCR Validation:** Automated text extraction and metadata verification against business records.
5. **Next Best Action Engine:** Dynamic prioritized recommendations based on dependency graphs and approval blockers.
6. **Unified Dashboard:** Real-time visibility into required approvals, timelines, deadlines, and state/central schemes.

---

## 🏗️ Architecture

```text
innovx-ai-ml-enhanced/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routers/       # Endpoints for Copilot, Risk, Approvals, Docs, etc.
│   │   └── services/      # Rule engines, AI Service, ML Risk Service, OCR
│   ├── ml/                # Trained Random Forest model (risk_model.pkl) & training scripts
│   ├── tests/             # 90+ pytest unit & integration tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/               # React + Vite application
│   ├── package.json
│   └── vite.config.ts
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY

# Run backend server
uvicorn app.main:app --reload
```

Backend will be live at: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend will be live at: `http://localhost:5173`

---

## 🧪 Running Tests

```bash
cd backend
.\venv\Scripts\activate
pytest
```

---

## 🔒 Security & Privacy

* Sensitive configuration and API keys are managed through `.env` and are strictly ignored in `.gitignore`.
* ML models run entirely on-premise/locally without transmitting private compliance records to external servers.

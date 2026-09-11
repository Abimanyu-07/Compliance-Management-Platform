import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.database import Base, SessionLocal, engine
from app.routers import (
    applications,
    approvals,
    auth,
    business,
    copilot,
    dashboard,
    dependencies,
    documents,
    grievances,
    incentives,
    recommendations,
    requirements,
    risk,
)
from app.seed import seed_if_empty

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_if_empty(db)

app = FastAPI(
    title="InnovX Backend",
    description=(
        "YHACK '26 — Problem Statement 20. Intelligent Business Approval, Licensing "
        "and Compliance Management Platform (prototype). InnovX is an AI-powered "
        "compliance copilot that guides businesses through requirements, documents, "
        "where to apply, tracking, dependencies, risk, and next-best-action. "
        "Actual government application submission happens through the relevant official "
        "government channel unless an authorized API is available."
    ),
    version="1.0.0",
    contact={"name": "Team InnovX"},
)

frontend = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and exc.detail.get("success") is False:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": "HTTP_ERROR", "message": str(exc.detail)}},
    )


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": "Request validation failed.", "details": exc.errors()},
        },
    )


@app.exception_handler(SQLAlchemyError)
async def db_handler(_: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": {"code": "DATABASE_ERROR", "message": "A database error occurred."}},
    )


@app.exception_handler(Exception)
async def unhandled(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": "Unexpected server error."}},
    )


app.include_router(auth.router)
app.include_router(business.router)
app.include_router(requirements.router)
app.include_router(approvals.router)
app.include_router(documents.router)
app.include_router(applications.router)
app.include_router(dependencies.router)
app.include_router(risk.router)
app.include_router(recommendations.router)
app.include_router(grievances.router)
app.include_router(incentives.router)
app.include_router(dashboard.router)
app.include_router(copilot.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "success": True,
        "data": {
            "name": "InnovX Backend",
            "hackathon": "YHACK '26",
            "problem_statement": 20,
            "docs": "/docs",
        },
        "message": "InnovX API is running",
    }


@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"])
def health():
    return {"success": True, "data": {"status": "ok"}, "message": "Healthy"}

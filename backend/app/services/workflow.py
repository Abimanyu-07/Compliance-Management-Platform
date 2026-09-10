from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Application, Business, Requirement
from app.services.requirement_engine import get_applicable_requirements
from app.services.risk_engine import default_deadline, refresh_application

STATUS_TIMELINE = [
    ("Application Prepared", {"DRAFT", "READY_TO_APPLY", "ACTION_REQUIRED", "SUBMITTED", "UNDER_REVIEW", "INSPECTION", "APPROVED", "REJECTED", "RENEWAL_DUE"}),
    ("Submitted", {"SUBMITTED", "UNDER_REVIEW", "INSPECTION", "APPROVED", "REJECTED", "RENEWAL_DUE"}),
    ("Document Review", {"UNDER_REVIEW", "INSPECTION", "APPROVED", "REJECTED", "RENEWAL_DUE"}),
    ("Inspection", {"INSPECTION", "APPROVED", "REJECTED", "RENEWAL_DUE"}),
    ("Final Decision", {"APPROVED", "REJECTED", "RENEWAL_DUE"}),
]

ALLOWED_TRANSITIONS = {
    "NOT_STARTED": {"DRAFT", "ACTION_REQUIRED", "READY_TO_APPLY"},
    "DRAFT": {"READY_TO_APPLY", "ACTION_REQUIRED", "NOT_STARTED"},
    "READY_TO_APPLY": {"SUBMITTED", "ACTION_REQUIRED", "DRAFT"},
    "SUBMITTED": {"UNDER_REVIEW", "ACTION_REQUIRED", "REJECTED"},
    "UNDER_REVIEW": {"INSPECTION", "APPROVED", "REJECTED", "ACTION_REQUIRED"},
    "ACTION_REQUIRED": {"DRAFT", "READY_TO_APPLY", "SUBMITTED", "UNDER_REVIEW"},
    "INSPECTION": {"APPROVED", "REJECTED", "ACTION_REQUIRED"},
    "APPROVED": {"RENEWAL_DUE"},
    "REJECTED": {"DRAFT", "ACTION_REQUIRED"},
    "RENEWAL_DUE": {"DRAFT", "SUBMITTED", "READY_TO_APPLY"},
}


def serialize_business(b: Business) -> dict:
    return {
        "id": b.id,
        "name": b.name,
        "business_type": b.business_type,
        "sector": b.sector,
        "state": b.state,
        "district": b.district,
        "investment": b.investment,
        "employees": b.employees,
        "stage": b.stage,
        "created_at": b.created_at,
        "updated_at": b.updated_at,
    }


def serialize_application(app: Application) -> dict:
    req = app.requirement
    return {
        "id": app.id,
        "application_id": app.id,
        "business_id": app.business_id,
        "requirement_id": app.requirement_id,
        "application_number": app.application_number,
        "status": app.status,
        "submitted_date": app.submitted_date,
        "deadline": app.deadline,
        "last_updated": app.last_updated,
        "risk_level": app.risk_level,
        "readiness_score": app.readiness_score,
        "blocking_reason": app.blocking_reason,
        "name": req.name if req else None,
        "category": req.category if req else None,
        "authority": req.authority if req else None,
        "priority": req.priority if req else None,
        "application_method": req.application_method if req else None,
        "official_portal": req.official_portal if req else None,
        "estimated_processing_days": req.estimated_processing_days if req else None,
        "description": req.description if req else None,
    }


def build_timeline(status: str) -> list[dict]:
    return [{"stage": stage, "completed": status in done} for stage, done in STATUS_TIMELINE]


def next_application_number(db: Session) -> str:
    count = db.query(Application).count() + 1
    return f"INX-2026-{count:05d}"


def ensure_applications_for_business(db: Session, business: Business) -> int:
    payload = get_applicable_requirements(business, db)
    existing_count = db.query(Application).count()
    created = 0
    for item in payload["requirements"]:
        existing = (
            db.query(Application)
            .filter(Application.business_id == business.id, Application.requirement_id == item["id"])
            .first()
        )
        if existing:
            continue
        created += 1
        app = Application(
            business_id=business.id,
            requirement_id=item["id"],
            application_number=f"INX-2026-{existing_count + created:05d}",
            status="NOT_STARTED",
            deadline=default_deadline(),
            last_updated=datetime.utcnow(),
        )
        db.add(app)
        db.flush()
        refresh_application(db, app)
        created += 1
    db.commit()
    return created or payload["total"]


def serialize_approval(app: Application) -> dict:
    data = serialize_application(app)
    req: Requirement | None = app.requirement
    data.update(
        {
            "id": req.id if req else app.requirement_id,
            "application_id": app.id,
            "status": app.status,
            "readiness_score": app.readiness_score,
        }
    )
    return data

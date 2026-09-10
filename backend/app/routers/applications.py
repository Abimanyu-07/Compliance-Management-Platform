from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Application, Business
from app.schemas import ApplicationCreate, ApplicationStatusPatch
from app.services.risk_engine import refresh_application
from app.services.workflow import (
    ALLOWED_TRANSITIONS,
    build_timeline,
    ensure_applications_for_business,
    next_application_number,
    serialize_application,
)
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def _get_app(db: Session, application_id: int) -> Application:
    app = (
        db.query(Application)
        .options(joinedload(Application.requirement), joinedload(Application.business))
        .filter(Application.id == application_id)
        .first()
    )
    if not app:
        fail("APPLICATION_NOT_FOUND", "Application not found.", 404)
    return app


@router.post(
    "",
    summary="Create or refresh an application",
    description="Checks mandatory documents, verification, and blocking dependencies.",
)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == payload.business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    ensure_applications_for_business(db, business)
    app = (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(
            Application.business_id == payload.business_id,
            Application.requirement_id == payload.requirement_id,
        )
        .first()
    )
    if not app:
        app = Application(
            business_id=payload.business_id,
            requirement_id=payload.requirement_id,
            application_number=next_application_number(db),
            status="DRAFT",
        )
        db.add(app)
        db.commit()
        db.refresh(app)

    evaluation = refresh_application(db, app)
    return ok(
        {
            "application_id": app.id,
            "status": app.status,
            "readiness_score": app.readiness_score,
            "blocking_reason": app.blocking_reason,
            "risk_level": app.risk_level,
            "factors": evaluation.get("factors"),
        }
    )


@router.get("/business/{business_id}", summary="List applications for a business")
def list_by_business(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    apps = (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(Application.business_id == business_id)
        .all()
    )
    return ok({"total": len(apps), "applications": [serialize_application(a) for a in apps]})


@router.get("/{application_id}", summary="Get application or list by business id")
def get_application(application_id: int, db: Session = Depends(get_db)):
    app = (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(Application.id == application_id)
        .first()
    )
    if app:
        data = serialize_application(app)
        data["timeline"] = build_timeline(app.status)
        return ok(data)

    business = db.query(Business).filter(Business.id == application_id).first()
    if not business:
        fail("APPLICATION_NOT_FOUND", "Application not found.", 404)
    apps = (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(Application.business_id == application_id)
        .all()
    )
    return ok({"total": len(apps), "applications": [serialize_application(a) for a in apps]})


@router.patch("/{application_id}/status", summary="Update application status")
def patch_status(application_id: int, payload: ApplicationStatusPatch, db: Session = Depends(get_db)):
    app = _get_app(db, application_id)
    target = payload.status.upper()
    allowed = ALLOWED_TRANSITIONS.get(app.status, set())
    if target != app.status and target not in allowed:
        fail(
            "INVALID_STATUS_TRANSITION",
            f"Cannot change status from {app.status} to {target}.",
            400,
        )
    app.status = target
    if target == "SUBMITTED":
        app.submitted_date = datetime.utcnow()
    app.last_updated = datetime.utcnow()
    db.add(app)
    db.commit()
    db.refresh(app)
    data = serialize_application(app)
    data["timeline"] = build_timeline(app.status)
    return ok(data, "Status updated")

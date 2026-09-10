from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Application, Business
from app.services.recommendation_engine import get_next_best_action
from app.services.risk_engine import business_risk
from app.services.workflow import serialize_application, serialize_business
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

COMPLETED = {"APPROVED"}
IN_PROGRESS = {"SUBMITTED", "UNDER_REVIEW", "INSPECTION", "DRAFT", "ACTION_REQUIRED"}
READY = {"READY_TO_APPLY"}
PENDING = {"ACTION_REQUIRED"}


@router.get(
    "/{business_id}",
    summary="Dashboard aggregate",
    description="Single payload for the InnovX dashboard.",
)
def dashboard(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)

    apps = (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(Application.business_id == business_id)
        .all()
    )
    total = len(apps)
    ready = sum(1 for a in apps if a.status in READY)
    pending = sum(1 for a in apps if a.status in PENDING)
    completed = sum(1 for a in apps if a.status in COMPLETED)
    in_progress = sum(1 for a in apps if a.status in IN_PROGRESS)
    risk = business_risk(db, business_id)
    nba = get_next_best_action(db, business_id)

    upcoming = [a for a in apps if a.deadline and a.status not in {"APPROVED", "REJECTED"}]
    upcoming.sort(key=lambda a: a.deadline)
    recent = sorted(apps, key=lambda a: a.last_updated or datetime.min, reverse=True)[:6]

    return ok(
        {
            "business": serialize_business(business),
            "total_approvals": total,
            "ready_to_apply": ready,
            "pending_actions": pending,
            "compliance_health": risk["readiness_score"],
            "risk_level": risk["risk_level"],
            "approval_progress": {
                "completed": completed,
                "in_progress": in_progress,
                "ready": ready,
            },
            "next_best_action": nba,
            "upcoming_deadlines": [
                {
                    "application_id": a.id,
                    "name": a.requirement.name if a.requirement else None,
                    "deadline": a.deadline,
                    "status": a.status,
                }
                for a in upcoming[:5]
            ],
            "recent_applications": [serialize_application(a) for a in recent],
            "disclaimer": "Prototype dashboard. Actual government filing happens on the official authority channel.",
        }
    )

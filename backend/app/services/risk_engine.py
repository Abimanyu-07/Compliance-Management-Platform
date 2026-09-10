from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Application
from app.services.dependency_engine import blocking_dependencies
from app.services.document_validator import missing_mandatory, requirement_document_checklist, warning_documents

LOCKED_STATUSES = {"SUBMITTED", "UNDER_REVIEW", "INSPECTION", "APPROVED", "REJECTED", "RENEWAL_DUE"}


def risk_level_from_score(score: int) -> str:
    if score >= 80:
        return "LOW"
    if score >= 55:
        return "MEDIUM"
    return "HIGH"


def score_application(db: Session, application: Application) -> dict:
    checklist = requirement_document_checklist(
        db, application.business_id, application.requirement_id, application.id
    )
    missing = missing_mandatory(checklist)
    warnings = warning_documents(checklist)
    blocked = blocking_dependencies(db, application.business_id, application.requirement_id)

    score = 100
    factors = []
    score -= len(missing) * 15
    score -= len(warnings) * 5
    score -= len(blocked) * 10

    days_to_deadline = None
    if application.deadline:
        days_to_deadline = (application.deadline - datetime.utcnow()).days
        if days_to_deadline <= 14:
            score -= 8
            factors.append({"factor": "Upcoming deadline", "severity": "MEDIUM"})

    complexity = application.requirement.priority if application.requirement else "MEDIUM"
    if complexity == "HIGH":
        score -= 5
        factors.append({"factor": "Application complexity", "severity": "MEDIUM"})

    if missing:
        factors.append({"factor": "Missing document", "severity": "HIGH", "details": missing})
    if warnings:
        factors.append({"factor": "Document validation warnings", "severity": "MEDIUM", "details": warnings})
    if blocked:
        factors.append(
            {
                "factor": "Approval dependency",
                "severity": "MEDIUM",
                "details": [b["name"] for b in blocked],
            }
        )

    score = max(0, min(100, score))
    blocking_reason = None
    if missing:
        blocking_reason = f"{missing[0]} is missing"
    elif blocked:
        blocking_reason = f"Depends on {blocked[0]['name']}"
    elif warnings:
        blocking_reason = f"Validation warning on {warnings[0]}"

    return {
        "readiness_score": score,
        "risk_level": risk_level_from_score(score),
        "factors": factors,
        "missing_documents": missing,
        "warnings": warnings,
        "blocked_dependencies": blocked,
        "blocking_reason": blocking_reason,
        "checklist": checklist,
        "days_to_deadline": days_to_deadline,
    }


def refresh_application(db: Session, application: Application) -> dict:
    evaluation = score_application(db, application)
    application.readiness_score = evaluation["readiness_score"]
    application.risk_level = evaluation["risk_level"]
    application.blocking_reason = evaluation["blocking_reason"]
    application.last_updated = datetime.utcnow()

    if application.status not in LOCKED_STATUSES:
        if evaluation["missing_documents"] or evaluation["blocked_dependencies"] or evaluation["warnings"]:
            application.status = "ACTION_REQUIRED"
        elif application.status in {"NOT_STARTED", "DRAFT", "ACTION_REQUIRED"}:
            application.status = "READY_TO_APPLY"

    db.add(application)
    db.commit()
    db.refresh(application)
    evaluation["status"] = application.status
    return evaluation


def business_risk(db: Session, business_id: int) -> dict:
    apps = db.query(Application).filter(Application.business_id == business_id).all()
    if not apps:
        return {"readiness_score": 0, "risk_level": "HIGH", "factors": [{"factor": "No applications", "severity": "HIGH"}]}

    scores = []
    all_factors = []
    for app in apps:
        ev = score_application(db, app)
        scores.append(ev["readiness_score"])
        for factor in ev["factors"]:
            factor = dict(factor)
            factor["application_id"] = app.id
            factor["requirement"] = app.requirement.name if app.requirement else None
            all_factors.append(factor)

    avg = int(round(sum(scores) / len(scores)))
    unique = []
    seen = set()
    for f in all_factors:
        key = (f.get("factor"), f.get("requirement"))
        if key in seen:
            continue
        seen.add(key)
        unique.append(f)

    return {
        "readiness_score": avg,
        "risk_level": risk_level_from_score(avg),
        "factors": unique[:12],
        "application_count": len(apps),
    }


def default_deadline() -> datetime:
    return datetime.utcnow() + timedelta(days=45)

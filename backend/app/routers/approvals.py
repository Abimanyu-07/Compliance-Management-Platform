from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Application, Business, Requirement
from app.services.document_validator import requirement_document_checklist
from app.services.workflow import serialize_approval
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])


def _apps_for_business(db: Session, business_id: int) -> list[Application]:
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(Application.business_id == business_id)
        .all()
    )


@router.get(
    "/{approval_id}/where-to-apply",
    summary="Where to apply",
    description="Returns authority and portal metadata. Unverified URLs are returned as null.",
)
def where_to_apply(approval_id: int, db: Session = Depends(get_db)):
    req = db.query(Requirement).filter(Requirement.id == approval_id).first()
    if not req:
        fail("APPROVAL_NOT_FOUND", "Invalid approval ID.", 404)
    portal = req.official_portal
    return ok(
        {
            "id": req.id,
            "name": req.name,
            "authority": req.authority,
            "application_method": req.application_method,
            "official_portal": portal,
            "portal_status": "VERIFIED_OFFICIAL_URL" if portal else "VERIFY_BEFORE_USE",
            "note": "Application submission is completed through the official authority channel.",
            "disclaimer": "InnovX does not submit filings to government systems in this prototype.",
        }
    )


@router.get("/{approval_id}/documents", summary="Required documents for an approval")
def approval_documents(
    approval_id: int,
    business_id: int = Query(default=1, description="Business context for uploaded files"),
    db: Session = Depends(get_db),
):
    req = db.query(Requirement).filter(Requirement.id == approval_id).first()
    if not req:
        fail("APPROVAL_NOT_FOUND", "Invalid approval ID.", 404)
    app = (
        db.query(Application)
        .filter(Application.business_id == business_id, Application.requirement_id == approval_id)
        .first()
    )
    data = requirement_document_checklist(db, business_id, approval_id, app.id if app else None)
    data["approval_id"] = approval_id
    data["name"] = req.name
    return ok(data)


@router.get("/{business_id}/{approval_id}", summary="Approval detail for a business")
def approval_detail(business_id: int, approval_id: int, db: Session = Depends(get_db)):
    app = (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(Application.business_id == business_id, Application.requirement_id == approval_id)
        .first()
    )
    if not app:
        fail("APPROVAL_NOT_FOUND", "Invalid approval ID.", 404)
    data = serialize_approval(app)
    data["where_to_apply"] = {
        "authority": app.requirement.authority,
        "application_method": app.requirement.application_method,
        "official_portal": app.requirement.official_portal,
        "portal_status": "VERIFIED_OFFICIAL_URL" if app.requirement.official_portal else "VERIFY_BEFORE_USE",
        "note": "Application submission is completed through the official authority channel.",
    }
    return ok(data)


@router.get("/{business_id}", summary="List approvals for a business")
def list_or_get_approvals(
    business_id: int,
    status: str | None = None,
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if business:
        apps = _apps_for_business(db, business_id)
        rows = [serialize_approval(a) for a in apps]
        if status:
            rows = [r for r in rows if r["status"] == status]
        if category:
            rows = [r for r in rows if (r.get("category") or "").lower() == category.lower()]
        if search:
            q = search.lower()
            rows = [
                r
                for r in rows
                if q in (r.get("name") or "").lower()
                or q in (r.get("authority") or "").lower()
                or q in (r.get("category") or "").lower()
            ]
        return ok({"total": len(rows), "approvals": rows})

    req = db.query(Requirement).filter(Requirement.id == business_id).first()
    if not req:
        fail("APPROVAL_NOT_FOUND", "Invalid approval ID.", 404)
    app = (
        db.query(Application)
        .options(joinedload(Application.requirement))
        .filter(Application.requirement_id == req.id)
        .first()
    )
    if app:
        return ok(serialize_approval(app))
    return ok(
        {
            "id": req.id,
            "name": req.name,
            "category": req.category,
            "authority": req.authority,
            "status": "NOT_STARTED",
            "priority": req.priority,
            "readiness_score": 0,
        }
    )

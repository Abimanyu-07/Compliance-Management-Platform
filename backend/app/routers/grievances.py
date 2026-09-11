from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Business, Grievance
from app.schemas import GrievanceCreate, GrievancePatch
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/grievances", tags=["Grievances"])


def _serialize(item: Grievance) -> dict:
    return {
        "id": item.id,
        "business_id": item.business_id,
        "application_id": item.application_id,
        "category": item.category,
        "description": item.description,
        "priority": item.priority,
        "status": item.status,
        "created_at": item.created_at,
    }


@router.post("", summary="Create grievance")
def create_grievance(payload: GrievanceCreate, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == payload.business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    if payload.application_id:
        app = db.query(Application).filter(Application.id == payload.application_id).first()
        if not app:
            fail("APPLICATION_NOT_FOUND", "Invalid application ID.", 404)
    item = Grievance(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return ok(_serialize(item), "Grievance created", 201)


@router.get("/{business_id}", summary="List grievances for a business")
def list_grievances(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    items = db.query(Grievance).filter(Grievance.business_id == business_id).all()
    return ok({"total": len(items), "grievances": [_serialize(g) for g in items]})


@router.patch("/{grievance_id}", summary="Update grievance")
def patch_grievance(grievance_id: int, payload: GrievancePatch, db: Session = Depends(get_db)):
    item = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not item:
        fail("GRIEVANCE_NOT_FOUND", "Grievance not found.", 404)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ok(_serialize(item), "Grievance updated")

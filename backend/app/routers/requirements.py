from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business
from app.services.requirement_engine import get_applicable_requirements
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/requirements", tags=["Requirements"])


@router.get(
    "/{business_id}",
    summary="List applicable requirements",
    description="Deterministic rule engine. Does not use an LLM to invent licences.",
)
def list_requirements(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return ok(get_applicable_requirements(business, db))

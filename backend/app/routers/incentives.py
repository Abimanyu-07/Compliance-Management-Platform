from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business
from app.services.scheme_engine import match_schemes
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/incentives", tags=["Incentives"])


@router.get("/{business_id}", summary="Potential scheme / incentive matches")
def list_incentives(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return ok(match_schemes(db, business), "Potential matches only — not verified eligibility")

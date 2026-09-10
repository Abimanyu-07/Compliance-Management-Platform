from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business
from app.services.risk_engine import business_risk
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/risk", tags=["Risk"])


@router.get("/{business_id}", summary="Explainable readiness / risk score")
def get_risk(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return ok(business_risk(db, business_id))

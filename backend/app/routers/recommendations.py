from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business
from app.services.recommendation_engine import get_next_best_action
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/{business_id}", summary="AI next-best-action")
def get_recommendation(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return ok(get_next_best_action(db, business_id))

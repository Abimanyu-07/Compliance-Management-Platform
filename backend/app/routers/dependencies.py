from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business
from app.services.dependency_engine import build_graph
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/dependencies", tags=["Dependencies"])


@router.get("/{business_id}", summary="Approval dependency graph")
def get_dependencies(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return ok(build_graph(db, business_id))

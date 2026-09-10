from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business
from app.schemas import BusinessCreate, BusinessUpdate
from app.services.requirement_engine import get_applicable_requirements
from app.services.workflow import ensure_applications_for_business, serialize_business
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/business", tags=["Business"])


def _get_business(db: Session, business_id: int) -> Business:
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return business


@router.post(
    "",
    summary="Create business profile",
    description="Creates a business and immediately runs the deterministic requirement engine.",
)
def create_business(payload: BusinessCreate, db: Session = Depends(get_db)):
    business = Business(**payload.model_dump())
    db.add(business)
    db.commit()
    db.refresh(business)
    identified = get_applicable_requirements(business, db)["total"]
    ensure_applications_for_business(db, business)
    return ok(
        {
            "business": serialize_business(business),
            "requirements_identified": identified,
        },
        "Compliance profile generated successfully",
        201,
    )


@router.get("", summary="List all business profiles")
def list_businesses(db: Session = Depends(get_db)):
    businesses = db.query(Business).order_by(Business.id).all()
    return ok(
        {
            "total": len(businesses),
            "businesses": [serialize_business(b) for b in businesses],
        }
    )


@router.get("/{business_id}", summary="Get business profile")
def get_business(business_id: int, db: Session = Depends(get_db)):
    business = _get_business(db, business_id)
    return ok(serialize_business(business))


@router.put("/{business_id}", summary="Update business profile")
def update_business(business_id: int, payload: BusinessUpdate, db: Session = Depends(get_db)):
    business = _get_business(db, business_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(business, key, value)
    db.add(business)
    db.commit()
    db.refresh(business)
    identified = get_applicable_requirements(business, db)["total"]
    ensure_applications_for_business(db, business)
    return ok(
        {
            "business": serialize_business(business),
            "requirements_identified": identified,
        },
        "Business profile updated",
    )

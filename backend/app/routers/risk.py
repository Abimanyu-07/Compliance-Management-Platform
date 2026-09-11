from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Business
from app.services.risk_engine import (
    application_next_best_action_text,
    hybrid_application_risk,
    hybrid_business_risk,
    simulate_what_if,
)
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/risk", tags=["Risk"])


class WhatIfRequest(BaseModel):
    resolve_missing_documents: bool = True
    resolve_document_errors: bool = True
    resolve_dependencies: bool = True


@router.get(
    "/{business_id}",
    summary="Explainable readiness / risk score (hybrid: rule engine + Random Forest ML)",
    description=(
        "Returns the original deterministic readiness_score/risk_level/factors (unchanged, "
        "backward compatible) PLUS an ML-derived risk_score/risk_probability from the "
        "Random Forest model when it is available, along with model feature importance."
    ),
)
def get_risk(business_id: int, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    return ok(hybrid_business_risk(db, business_id))


@router.get(
    "/application/{application_id}",
    summary="Hybrid risk for a single application",
    description="Rule-based readiness score + Random Forest risk prediction for one application, with a deterministic next-best-action.",
)
def get_application_risk(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        fail("APPLICATION_NOT_FOUND", "Invalid application ID.", 404)

    result = hybrid_application_risk(db, application)
    result["next_best_action"] = application_next_best_action_text(result)
    return ok(result)


@router.post(
    "/what-if/{business_id}",
    summary="What-if compliance simulator",
    description=(
        "Simulates the effect of resolving missing documents / document errors / blocking "
        "dependencies on this business's hybrid risk score, WITHOUT writing anything to the "
        "database. Returns current vs simulated risk."
    ),
)
def what_if(business_id: int, payload: Optional[WhatIfRequest] = None, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)

    opts = payload or WhatIfRequest()
    result = simulate_what_if(
        db,
        business_id,
        resolve_missing_documents=opts.resolve_missing_documents,
        resolve_document_errors=opts.resolve_document_errors,
        resolve_dependencies=opts.resolve_dependencies,
    )
    return ok(result)

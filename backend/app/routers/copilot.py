from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business
from app.schemas import CopilotChatIn
from app.services.recommendation_engine import get_next_best_action
from app.services.risk_engine import business_risk
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])


@router.post(
    "/chat",
    summary="Compliance copilot",
    description="Deterministic answers from live backend data. Not dependent on an external LLM.",
)
def chat(payload: CopilotChatIn, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == payload.business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)

    nba = get_next_best_action(db, payload.business_id)
    risk = business_risk(db, payload.business_id)
    message = (payload.message or "").lower()

    if any(word in message for word in ("where", "portal", "apply", "authority")):
        answer = (
            "Use Where to Apply on each approval. If official_portal is null, "
            "portal_status is VERIFY_BEFORE_USE. InnovX does not submit government applications."
        )
        suggestions = ["Open approvals", "View where-to-apply", "View documents"]
    elif any(word in message for word in ("risk", "readiness", "health")):
        answer = (
            f"Compliance health is {risk['readiness_score']}% ({risk['risk_level']} risk). "
            "This is an explainable prototype score, not a legal rating."
        )
        suggestions = ["View risk factors", "Open dashboard"]
    elif any(word in message for word in ("incentive", "scheme", "subsidy")):
        answer = (
            "Open incentives for Potential Match schemes only. This prototype never claims 100% eligibility."
        )
        suggestions = ["View incentives"]
    else:
        answer = (
            f"Your highest-priority action is: {nba['title']}. {nba.get('description') or ''} "
            f"{nba.get('reason') or ''}"
        ).strip()
        suggestions = [a["label"] for a in nba.get("actions") or []]
        if "View Dependencies" not in suggestions:
            suggestions.append("View Dependencies")

    return ok(
        {
            "answer": answer,
            "related_application_id": nba.get("related_application_id"),
            "related_requirement_id": nba.get("related_requirement_id"),
            "suggested_actions": suggestions,
            "next_best_action": nba,
        }
    )

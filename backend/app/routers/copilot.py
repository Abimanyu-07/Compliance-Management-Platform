from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Business, Document
from app.schemas import CopilotChatIn
from app.services import ai_service
from app.services.recommendation_engine import get_next_best_action
from app.services.risk_engine import hybrid_business_risk
from app.services.scheme_engine import match_schemes
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])


def _build_context(db: Session, business: Business, nba: dict, risk: dict) -> dict:
    """
    Assemble the read-only fact block handed to the LLM. Everything in here
    comes straight from the deterministic engines / database - the model is
    never allowed to add facts beyond this.
    """
    apps = (
        db.query(Application)
        .filter(Application.business_id == business.id)
        .all()
    )

    approvals_summary = []
    for a in apps:
        req = a.requirement
        docs = db.query(Document).filter(Document.application_id == a.id).all()
        approvals_summary.append({
            "requirement_id": a.requirement_id,
            "name": req.name if req else None,
            "authority": req.authority if req else None,
            "official_portal": req.official_portal if req else None,
            "application_status": a.status,
            "readiness_score": a.readiness_score,
            "risk_level": a.risk_level,
            "blocking_reason": a.blocking_reason,
            "documents_uploaded": len(docs),
        })

    schemes = match_schemes(db, business)[:3]

    return {
        "business": {
            "name": business.name,
            "business_type": business.business_type,
            "sector": business.sector,
            "state": business.state,
            "district": business.district,
            "investment": business.investment,
            "employees": business.employees,
            "stage": business.stage,
        },
        "compliance_health_score": risk["readiness_score"],
        "risk_level": risk["risk_level"],
        "risk_factors": risk["factors"],
        "ml_risk_score": risk.get("risk_score"),
        "ml_risk_probability": risk.get("risk_probability"),
        "ml_model": risk.get("model"),
        "approvals": approvals_summary,
        "next_best_action": nba,
        "potential_scheme_matches": [
            {
                "name": s["name"],
                "match_score": s["match_score"],
                "why_it_matches": s.get("why_it_matches"),
                "benefits": s["benefits"],
            }
            for s in schemes
        ],
        "platform_disclaimer": (
            "This is a hackathon prototype. It does not submit government applications "
            "and does not guarantee approval or scheme eligibility. The ML risk score is a "
            "prototype prediction trained on synthetic scenarios, not a legal or financial "
            "risk rating. Always verify official portals and requirements with the relevant "
            "government authority before acting."
        ),
    }


def _deterministic_answer(nba: dict, risk: dict, message: str) -> tuple[str, list[str]]:
    """Original keyword-based fallback. Used whenever the LLM layer is
    unavailable (no API key, package missing, or the call failed)."""
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
    return answer, suggestions


@router.post(
    "/chat",
    summary="AI compliance copilot",
    description=(
        "Answers are grounded in live backend data (requirements, documents, risk, "
        "dependencies, next-best-action). When ANTHROPIC_API_KEY is configured, responses "
        "are generated by Claude using that data as strict context. Without a configured "
        "key, or if the AI call fails, the endpoint automatically falls back to a "
        "deterministic templated answer so the feature never breaks the demo."
    ),
)
def chat(payload: CopilotChatIn, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == payload.business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)

    nba = get_next_best_action(db, payload.business_id)
    risk = hybrid_business_risk(db, payload.business_id)
    message = payload.message or ""

    ai_answer = None
    if ai_service.ai_available():
        context = _build_context(db, business, nba, risk)
        ai_answer = ai_service.generate_copilot_answer(context, message)

    if ai_answer:
        answer = ai_answer
        # Suggested action routes always come from deterministic backend data -
        # the model only supplies the phrasing of `answer`, never the routes.
        suggestions = [a["label"] for a in nba.get("actions") or []]
        if "View Dependencies" not in suggestions:
            suggestions.append("View Dependencies")
        ai_powered = True
    else:
        answer, suggestions = _deterministic_answer(nba, risk, message.lower())
        ai_powered = False

    return ok(
        {
            "answer": answer,
            "ai_powered": ai_powered,
            "related_application_id": nba.get("related_application_id"),
            "related_requirement_id": nba.get("related_requirement_id"),
            "suggested_actions": suggestions,
            "next_best_action": nba,
        }
    )

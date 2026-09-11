"""Deterministic requirement matching. Does not invent government rules via LLM."""

from sqlalchemy.orm import Session

from app.models import Requirement

DEMO_DISCLAIMER = (
    "Prototype/demo regulatory data only. Applicability must be confirmed with the relevant authority."
)


def _matches_rules(requirement: Requirement, business) -> bool:
    tags = (requirement.rule_tags or "always").lower()
    sector = (business.sector or "").lower()
    state = (business.state or "").lower()
    investment = float(business.investment or 0)
    employees = int(business.employees or 0)

    if "always" in tags:
        return True
    if "food" in tags and "food" not in sector:
        return False
    if "tamil_nadu" in tags and "tamil nadu" not in state:
        return False
    if "investment_1m" in tags and investment < 1_000_000:
        return False
    if "employees_10" in tags and employees < 10:
        return False
    if "factory" in tags and "food" not in sector and "manufactur" not in sector:
        return False
    return True


def get_applicable_requirements(business, db: Session) -> dict:
    catalog = db.query(Requirement).order_by(Requirement.id.asc()).all()
    matched = [r for r in catalog if _matches_rules(r, business)]
    return {
        "total": len(matched),
        "disclaimer": DEMO_DISCLAIMER,
        "requirements": [serialize_requirement(r) for r in matched],
    }


def serialize_requirement(r: Requirement) -> dict:
    return {
        "id": r.id,
        "name": r.name,
        "category": r.category,
        "authority": r.authority,
        "description": r.description,
        "sector": r.sector,
        "state": r.state,
        "business_stage": r.business_stage,
        "priority": r.priority,
        "application_method": r.application_method,
        "official_portal": r.official_portal,
        "estimated_processing_days": r.estimated_processing_days,
    }

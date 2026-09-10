from sqlalchemy.orm import Session

from app.models import Business, Scheme


def business_size_label(business: Business) -> str:
    employees = business.employees or 0
    investment = business.investment or 0
    if employees <= 10 and investment <= 1_000_000:
        return "Micro"
    if employees <= 50 and investment <= 10_000_000:
        return "Small"
    return "Medium"


def match_schemes(db: Session, business: Business) -> list[dict]:
    schemes = db.query(Scheme).all()
    size = business_size_label(business)
    results = []
    for scheme in schemes:
        score = 40
        if scheme.sector in (None, "All") or scheme.sector == business.sector:
            score += 20
        elif scheme.sector and scheme.sector.lower() in (business.sector or "").lower():
            score += 15
        else:
            score -= 15
        if scheme.state in (None, "All") or scheme.state == business.state:
            score += 15
        else:
            score -= 10
        if scheme.stage in (None, business.stage):
            score += 10
        if scheme.min_investment is None or business.investment >= scheme.min_investment:
            score += 8
        if scheme.max_investment is None or business.investment <= scheme.max_investment:
            score += 7
        if scheme.business_size and size.lower() in scheme.business_size.lower():
            score += 8
        score = max(0, min(99, score))
        if score < 45:
            continue
        results.append(
            {
                "id": scheme.id,
                "name": scheme.name,
                "description": scheme.description,
                "match_score": score,
                "eligibility": "Potential Match",
                "benefits": scheme.benefits,
                "sector": scheme.sector,
                "state": scheme.state,
                "business_size": scheme.business_size,
            }
        )
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

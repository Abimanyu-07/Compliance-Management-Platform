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
        eligibility_factors = []
        reasons = []

        if scheme.sector in (None, "All") or scheme.sector == business.sector:
            score += 20
            reasons.append(f"Matches your sector ({business.sector}).")
            eligibility_factors.append({"factor": "Sector match", "met": True})
        elif scheme.sector and scheme.sector.lower() in (business.sector or "").lower():
            score += 15
            reasons.append(f"Closely related to your sector ({business.sector}).")
            eligibility_factors.append({"factor": "Sector match", "met": True})
        else:
            score -= 15
            eligibility_factors.append({"factor": "Sector match", "met": False})

        if scheme.state in (None, "All") or scheme.state == business.state:
            score += 15
            reasons.append(f"Available in {business.state}.")
            eligibility_factors.append({"factor": "State coverage", "met": True})
        else:
            score -= 10
            eligibility_factors.append({"factor": "State coverage", "met": False})

        if scheme.stage in (None, business.stage):
            score += 10
            eligibility_factors.append({"factor": "Business stage match", "met": True})

        investment_ok = True
        if scheme.min_investment is None or business.investment >= scheme.min_investment:
            score += 8
        else:
            investment_ok = False
        if scheme.max_investment is None or business.investment <= scheme.max_investment:
            score += 7
        else:
            investment_ok = False
        eligibility_factors.append({"factor": "Investment range", "met": investment_ok})
        if investment_ok:
            reasons.append("Your investment amount is within the scheme's eligible range.")

        size_ok = False
        if scheme.business_size and size.lower() in scheme.business_size.lower():
            score += 8
            size_ok = True
            reasons.append(f"Fits the scheme's target business size ({size}).")
        eligibility_factors.append({"factor": "Business size", "met": size_ok})

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
                "why_it_matches": " ".join(reasons) if reasons else "Partially matches your business profile.",
                "eligibility_factors": eligibility_factors,
                "benefits": scheme.benefits,
                "sector": scheme.sector,
                "state": scheme.state,
                "business_size": scheme.business_size,
            }
        )
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

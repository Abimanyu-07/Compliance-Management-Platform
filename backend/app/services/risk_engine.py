from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Application
from app.services.dependency_engine import blocking_dependencies
from app.services.document_validator import missing_mandatory, requirement_document_checklist, warning_documents
from app.services import ml_risk_service

LOCKED_STATUSES = {"SUBMITTED", "UNDER_REVIEW", "INSPECTION", "APPROVED", "REJECTED", "RENEWAL_DUE"}


def risk_level_from_score(score: int) -> str:
    if score >= 80:
        return "LOW"
    if score >= 55:
        return "MEDIUM"
    return "HIGH"


def score_application(db: Session, application: Application) -> dict:
    checklist = requirement_document_checklist(
        db, application.business_id, application.requirement_id, application.id
    )
    missing = missing_mandatory(checklist)
    warnings = warning_documents(checklist)
    blocked = blocking_dependencies(db, application.business_id, application.requirement_id)

    score = 100
    factors = []
    score -= len(missing) * 15
    score -= len(warnings) * 5
    score -= len(blocked) * 10

    days_to_deadline = None
    if application.deadline:
        days_to_deadline = (application.deadline - datetime.utcnow()).days
        if days_to_deadline <= 14:
            score -= 8
            factors.append({"factor": "Upcoming deadline", "severity": "MEDIUM"})

    complexity = application.requirement.priority if application.requirement else "MEDIUM"
    if complexity == "HIGH":
        score -= 5
        factors.append({"factor": "Application complexity", "severity": "MEDIUM"})

    if missing:
        factors.append({"factor": "Missing document", "severity": "HIGH", "details": missing})
    if warnings:
        factors.append({"factor": "Document validation warnings", "severity": "MEDIUM", "details": warnings})
    if blocked:
        factors.append(
            {
                "factor": "Approval dependency",
                "severity": "MEDIUM",
                "details": [b["name"] for b in blocked],
            }
        )

    score = max(0, min(100, score))
    blocking_reason = None
    if missing:
        blocking_reason = f"{missing[0]} is missing"
    elif blocked:
        blocking_reason = f"Depends on {blocked[0]['name']}"
    elif warnings:
        blocking_reason = f"Validation warning on {warnings[0]}"

    return {
        "readiness_score": score,
        "risk_level": risk_level_from_score(score),
        "factors": factors,
        "missing_documents": missing,
        "warnings": warnings,
        "blocked_dependencies": blocked,
        "blocking_reason": blocking_reason,
        "checklist": checklist,
        "days_to_deadline": days_to_deadline,
    }


def refresh_application(db: Session, application: Application) -> dict:
    evaluation = score_application(db, application)
    application.readiness_score = evaluation["readiness_score"]
    application.risk_level = evaluation["risk_level"]
    application.blocking_reason = evaluation["blocking_reason"]
    application.last_updated = datetime.utcnow()

    if application.status not in LOCKED_STATUSES:
        if evaluation["missing_documents"] or evaluation["blocked_dependencies"] or evaluation["warnings"]:
            application.status = "ACTION_REQUIRED"
        elif application.status in {"NOT_STARTED", "DRAFT", "ACTION_REQUIRED"}:
            application.status = "READY_TO_APPLY"

    db.add(application)
    db.commit()
    db.refresh(application)
    evaluation["status"] = application.status
    return evaluation


def business_risk(db: Session, business_id: int) -> dict:
    apps = db.query(Application).filter(Application.business_id == business_id).all()
    if not apps:
        return {"readiness_score": 0, "risk_level": "HIGH", "factors": [{"factor": "No applications", "severity": "HIGH"}]}

    scores = []
    all_factors = []
    for app in apps:
        ev = score_application(db, app)
        scores.append(ev["readiness_score"])
        for factor in ev["factors"]:
            factor = dict(factor)
            factor["application_id"] = app.id
            factor["requirement"] = app.requirement.name if app.requirement else None
            all_factors.append(factor)

    avg = int(round(sum(scores) / len(scores)))
    unique = []
    seen = set()
    for f in all_factors:
        key = (f.get("factor"), f.get("requirement"))
        if key in seen:
            continue
        seen.add(key)
        unique.append(f)

    return {
        "readiness_score": avg,
        "risk_level": risk_level_from_score(avg),
        "factors": unique[:12],
        "application_count": len(apps),
    }


def default_deadline() -> datetime:
    return datetime.utcnow() + timedelta(days=45)


# ---------------------------------------------------------------------------
# HYBRID RISK INTELLIGENCE (rule engine + Random Forest ML layer)
#
# The functions above (score_application, business_risk) are the ORIGINAL
# deterministic rule-based engine and are left completely intact — they
# still power refresh_application()/application status transitions and
# remain the source of truth for `readiness_score`, `blocking_reason`, and
# the explainable `factors` list.
#
# The functions below ADD an independent ML-based risk signal on top,
# without replacing or duplicating the rule engine. If the ML model isn't
# available (missing risk_model.pkl, load failure, etc.) these gracefully
# degrade to rule-engine-only output — the app keeps working either way.
# ---------------------------------------------------------------------------

def hybrid_application_risk(db: Session, application: Application) -> dict:
    """
    Combine the deterministic rule-based evaluation with the Random Forest
    ML risk prediction for a single application. Backward compatible: every
    key that score_application() already returns is still present.
    """
    rule_eval = score_application(db, application)
    ml_result = ml_risk_service.predict_for_application(db, application)

    if ml_result:
        hybrid = {
            **rule_eval,
            "risk_score": ml_result["risk_score"],
            "risk_probability": ml_result["risk_probability"],
            "ml_risk_level": ml_result["risk_level"],
            "model": ml_result["model"],
            "ml_features": ml_result["features"],
        }
    else:
        # ML unavailable -> derive a risk_score from the rule engine so the
        # response shape stays consistent for API consumers either way.
        hybrid = {
            **rule_eval,
            "risk_score": 100 - rule_eval["readiness_score"],
            "risk_probability": None,
            "ml_risk_level": rule_eval["risk_level"],
            "model": ml_risk_service.model_info(),
            "ml_features": None,
        }

    hybrid["application_id"] = application.id
    hybrid["requirement_id"] = application.requirement_id
    hybrid["requirement_name"] = application.requirement.name if application.requirement else None
    return hybrid


def hybrid_business_risk(db: Session, business_id: int) -> dict:
    """
    Business-wide hybrid risk: the existing rule-based business_risk() output
    (readiness_score, risk_level, factors — unchanged, so existing consumers
    keep working) plus an aggregated ML risk_score/probability and, when the
    model is loaded, its global feature importance.
    """
    rule_result = business_risk(db, business_id)
    apps = db.query(Application).filter(Application.business_id == business_id).all()

    if not apps:
        return {
            **rule_result,
            "risk_score": 100,
            "risk_probability": None,
            "model": ml_risk_service.model_info(),
            "feature_importance": None,
        }

    app_risk_scores = []
    app_probabilities = []
    for app in apps:
        ml_result = ml_risk_service.predict_for_application(db, app)
        if ml_result:
            app_risk_scores.append(ml_result["risk_score"])
            app_probabilities.append(ml_result["risk_probability"])

    if app_risk_scores:
        avg_risk_score = round(sum(app_risk_scores) / len(app_risk_scores))
        avg_probability = round(sum(app_probabilities) / len(app_probabilities), 4)
    else:
        avg_risk_score = 100 - rule_result["readiness_score"]
        avg_probability = None

    return {
        **rule_result,
        "risk_score": avg_risk_score,
        "risk_probability": avg_probability,
        "model": ml_risk_service.model_info(),
        "feature_importance": ml_risk_service.get_feature_importance(),
    }


def application_next_best_action_text(hybrid_result: dict) -> str:
    """Small deterministic helper for the application-level risk endpoint —
    turns the rule engine's blocking_reason/factor data into a one-line
    next-best-action sentence. Uses ONLY facts already computed by the rule
    engine; no LLM/ML involved."""
    missing = hybrid_result.get("missing_documents") or []
    blocked = hybrid_result.get("blocked_dependencies") or []
    warnings = hybrid_result.get("warnings") or []

    if missing:
        return f"Upload the missing document: {missing[0]}."
    if blocked:
        return f"Complete the blocking {blocked[0]['name']} requirement before proceeding."
    if warnings:
        return f"Resolve the validation warning on {warnings[0]}."
    return "No blocking issues detected. This application is ready to proceed."


def simulate_what_if(
    db: Session,
    business_id: int,
    resolve_missing_documents: bool = True,
    resolve_document_errors: bool = True,
    resolve_dependencies: bool = True,
) -> dict:
    """
    What-if compliance simulator (spec section 19).

    Computes the CURRENT hybrid risk for the business, then a HYPOTHETICAL
    risk assuming the selected blockers are resolved — WITHOUT writing
    anything to the database. Uses the same rule-engine scoring formula and
    the same ML model, just with adjusted feature counts, so the simulation
    stays consistent with the live scoring logic instead of being a separate
    guess.
    """
    apps = db.query(Application).filter(Application.business_id == business_id).all()
    if not apps:
        return {
            "current": {"readiness_score": 0, "risk_score": 100, "risk_level": "HIGH"},
            "simulated": {"readiness_score": 0, "risk_score": 100, "risk_level": "HIGH"},
            "assumptions": {
                "resolve_missing_documents": resolve_missing_documents,
                "resolve_document_errors": resolve_document_errors,
                "resolve_dependencies": resolve_dependencies,
            },
            "note": "No applications found for this business.",
        }

    current = hybrid_business_risk(db, business_id)

    simulated_readiness = []
    simulated_ml_scores = []
    simulated_ml_probs = []

    for app in apps:
        rule_eval = score_application(db, app)
        sim_score = 100
        missing_n = 0 if resolve_missing_documents else len(rule_eval["missing_documents"])
        warnings_n = 0 if resolve_document_errors else len(rule_eval["warnings"])
        blocked_n = 0 if resolve_dependencies else len(rule_eval["blocked_dependencies"])

        sim_score -= missing_n * 15
        sim_score -= warnings_n * 5
        sim_score -= blocked_n * 10
        if rule_eval["days_to_deadline"] is not None and rule_eval["days_to_deadline"] <= 14:
            sim_score -= 8
        complexity = app.requirement.priority if app.requirement else "MEDIUM"
        if complexity == "HIGH":
            sim_score -= 5
        sim_score = max(0, min(100, sim_score))
        simulated_readiness.append(sim_score)

        if ml_risk_service.model_available():
            features = ml_risk_service.extract_features_for_application(db, app)
            if resolve_missing_documents:
                features["missing_documents"] = 0
            if resolve_document_errors:
                features["document_errors"] = 0
            if resolve_dependencies:
                features["dependencies"] = 0
            ml_result = ml_risk_service.predict_from_features(features)
            if ml_result:
                simulated_ml_scores.append(ml_result["risk_score"])
                simulated_ml_probs.append(ml_result["risk_probability"])

    sim_readiness_avg = round(sum(simulated_readiness) / len(simulated_readiness))
    if simulated_ml_scores:
        sim_risk_score = round(sum(simulated_ml_scores) / len(simulated_ml_scores))
        sim_probability = round(sum(simulated_ml_probs) / len(simulated_ml_probs), 4)
    else:
        sim_risk_score = 100 - sim_readiness_avg
        sim_probability = None

    return {
        "current": {
            "readiness_score": current["readiness_score"],
            "risk_score": current["risk_score"],
            "risk_level": current["risk_level"],
        },
        "simulated": {
            "readiness_score": sim_readiness_avg,
            "risk_score": sim_risk_score,
            "risk_probability": sim_probability,
            "risk_level": risk_level_from_score(sim_readiness_avg),
        },
        "improvement": {
            "readiness_score_delta": sim_readiness_avg - current["readiness_score"],
            "risk_score_delta": sim_risk_score - current["risk_score"],
        },
        "assumptions": {
            "resolve_missing_documents": resolve_missing_documents,
            "resolve_document_errors": resolve_document_errors,
            "resolve_dependencies": resolve_dependencies,
        },
        "model": ml_risk_service.model_info(),
        "disclaimer": "Hypothetical simulation only. Nothing was changed in the database.",
    }

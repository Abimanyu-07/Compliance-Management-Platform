"""
ML risk inference service.

Loads ml/risk_model.pkl ONCE at import time (never retrains during a
request). Extracts features for a given Application from the live
database (reusing the existing document_validator / dependency_engine
helpers, never duplicating that logic), runs predict_proba(), and converts
the result into a 0-100 risk_score + LOW/MEDIUM/HIGH risk_level.

This is a HYBRID addition, not a replacement: app/services/risk_engine.py
still contains and uses the original deterministic rule-based readiness
scoring. This module only adds a second, independent ML-based risk signal
that risk_engine.py combines with the rule-based one.

If the model file is missing or fails to load, `model_available()` returns
False and `predict_for_application()` returns None so callers fall back to
the rule-based engine only. Nothing here ever raises into the request path.
"""
import logging
from datetime import datetime
from functools import lru_cache
from typing import Optional

import joblib
import pandas as pd
from sqlalchemy.orm import Session

from app.models import Application
from app.services.dependency_engine import blocking_dependencies
from app.services.document_validator import missing_mandatory, requirement_document_checklist, warning_documents
from ml.model_config import FEATURE_NAMES, MODEL_NAME, MODEL_PATH, MODEL_VERSION, risk_level_from_ml_score

logger = logging.getLogger("innovx.ml_risk_service")

# Requirement categories that, in this prototype's rule set, typically
# involve a physical/on-site inspection step. Used as a deterministic proxy
# for the "inspection_required" ML feature since the Requirement model does
# not (yet) store this explicitly.
INSPECTION_CATEGORIES = {"Environmental", "Manufacturing", "Safety"}

PRIORITY_COMPLEXITY_WEIGHT = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}

DEFAULT_DAYS_TO_DEADLINE = 45  # matches risk_engine.default_deadline()


@lru_cache(maxsize=1)
def _load_model():
    if not MODEL_PATH.exists():
        logger.warning(f"ML risk model not found at {MODEL_PATH}. Falling back to rule-based risk only.")
        return None
    try:
        return joblib.load(MODEL_PATH)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Failed to load ML risk model: {exc}. Falling back to rule-based risk only.")
        return None


def model_available() -> bool:
    return _load_model() is not None


def model_info() -> dict:
    return {"name": MODEL_NAME, "version": MODEL_VERSION, "available": model_available()}


def extract_features_for_application(db: Session, application: Application) -> dict:
    """
    Deterministically derive the ML feature vector for one application from
    live database state. Reuses the same helpers the rule-based risk engine
    uses, so the two signals are evaluated against the same facts.
    """
    checklist = requirement_document_checklist(
        db, application.business_id, application.requirement_id, application.id
    )
    missing_documents = len(missing_mandatory(checklist))
    document_errors = len(warning_documents(checklist))
    dependencies = len(blocking_dependencies(db, application.business_id, application.requirement_id))

    requirement = application.requirement
    category = requirement.category if requirement else None
    inspection_required = 1 if category in INSPECTION_CATEGORIES else 0

    priority = requirement.priority if requirement else "MEDIUM"
    application_complexity = PRIORITY_COMPLEXITY_WEIGHT.get(priority, 2)

    if application.deadline:
        days_to_deadline = max(0, (application.deadline - datetime.utcnow()).days)
    else:
        days_to_deadline = DEFAULT_DAYS_TO_DEADLINE

    number_of_requirements = (
        db.query(Application).filter(Application.business_id == application.business_id).count()
    )

    return {
        "missing_documents": missing_documents,
        "document_errors": document_errors,
        "dependencies": dependencies,
        "inspection_required": inspection_required,
        "application_complexity": application_complexity,
        "days_to_deadline": days_to_deadline,
        "number_of_requirements": number_of_requirements,
    }


def predict_from_features(features: dict) -> Optional[dict]:
    """
    Run inference given an already-extracted feature dict. Returns None if
    the model is unavailable. Never raises.
    """
    model = _load_model()
    if model is None:
        return None

    try:
        ordered = pd.DataFrame([[features[name] for name in FEATURE_NAMES]], columns=FEATURE_NAMES)
        probability = float(model.predict_proba(ordered)[0][1])
        risk_score = round(probability * 100)
        risk_score = max(0, min(100, risk_score))
        return {
            "risk_score": risk_score,
            "risk_probability": round(probability, 4),
            "risk_level": risk_level_from_ml_score(risk_score),
            "model": model_info(),
        }
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"ML inference failed, falling back to rule-based risk only: {exc}")
        return None


def predict_for_application(db: Session, application: Application) -> Optional[dict]:
    """Convenience wrapper: extract features for a live application and predict."""
    if not model_available():
        return None
    features = extract_features_for_application(db, application)
    result = predict_from_features(features)
    if result is not None:
        result["features"] = features
    return result


def get_feature_importance() -> Optional[list]:
    """Return [{feature, importance}] sorted descending, or None if the
    model isn't loaded. This is model feature importance, NOT a causal
    explanation of any individual prediction — see risk_engine.py for the
    deterministic, per-application factor explanations."""
    model = _load_model()
    if model is None or not hasattr(model, "feature_importances_"):
        return None
    pairs = sorted(zip(FEATURE_NAMES, model.feature_importances_), key=lambda x: x[1], reverse=True)
    return [{"feature": f, "importance": round(float(i), 4)} for f, i in pairs]

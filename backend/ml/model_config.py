"""
Shared configuration for the InnovX Random Forest risk model.

Kept as plain constants (no framework imports) so both the offline
training scripts (ml/train_risk_model.py, ml/evaluate_risk_model.py) and
the FastAPI inference service (app/services/ml_risk_service.py) import the
exact same feature order, paths, and thresholds. Feature order MUST stay
identical between training and inference or predictions will be silently
wrong.
"""
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BACKEND_DIR / "data"
ML_DIR = BACKEND_DIR / "ml"

TRAINING_DATA_PATH = DATA_DIR / "risk_training_data.csv"
MODEL_PATH = ML_DIR / "risk_model.pkl"

# Exact feature order used for both training and inference.
FEATURE_NAMES = [
    "missing_documents",
    "document_errors",
    "dependencies",
    "inspection_required",
    "application_complexity",
    "days_to_deadline",
    "number_of_requirements",
]

TARGET_NAME = "high_risk"

RANDOM_STATE = 42
N_SYNTHETIC_RECORDS = 3000

RANDOM_FOREST_PARAMS = {
    "n_estimators": 200,
    "max_depth": 10,
    "random_state": RANDOM_STATE,
    "class_weight": "balanced",
}

TEST_SIZE = 0.2

# risk_score (0-100) -> risk_level buckets
RISK_LEVEL_THRESHOLDS = {
    "LOW": (0, 34),
    "MEDIUM": (35, 69),
    "HIGH": (70, 100),
}

MODEL_NAME = "Random Forest"
MODEL_VERSION = "prototype-v1"


def risk_level_from_ml_score(score: int) -> str:
    if score <= 34:
        return "LOW"
    if score <= 69:
        return "MEDIUM"
    return "HIGH"

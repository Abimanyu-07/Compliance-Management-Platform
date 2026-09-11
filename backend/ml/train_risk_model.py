"""
Train the InnovX prototype Random Forest risk model.

Run from the backend directory:

    python ml/train_risk_model.py

This will:
  1. Generate a synthetic (but logically-structured) training dataset of
     application-level compliance scenarios and save it to
     data/risk_training_data.csv.
  2. Train a RandomForestClassifier on it.
  3. Evaluate it on a held-out 20% stratified split and print metrics.
  4. Print feature importances.
  5. Save the trained model to ml/risk_model.pkl via joblib.

IMPORTANT — PROTOTYPE DISCLAIMER:
Real historical government approval data is not available for this
hackathon. The training data below is SYNTHETIC: it encodes plausible,
logically-meaningful relationships between application features and risk
(more missing documents / errors / dependencies / inspections / deadline
pressure -> higher risk), with injected noise so the model can't simply
memorize a deterministic formula. Metrics reported by this script describe
how well the model fits this synthetic scenario space, NOT real-world
government approval prediction accuracy. See README.md -> "AI/ML
Architecture -> Limitations" for the full disclaimer.
"""
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from ml.model_config import (  # noqa: E402
    DATA_DIR,
    FEATURE_NAMES,
    ML_DIR,
    MODEL_PATH,
    N_SYNTHETIC_RECORDS,
    RANDOM_FOREST_PARAMS,
    RANDOM_STATE,
    TARGET_NAME,
    TEST_SIZE,
    TRAINING_DATA_PATH,
)


def generate_synthetic_dataset(n_records: int = N_SYNTHETIC_RECORDS, seed: int = RANDOM_STATE) -> pd.DataFrame:
    """
    Generate a synthetic dataset of application-level compliance scenarios.

    Features are drawn from realistic ranges for a business-approval
    workflow. The binary label (high_risk) is derived from a weighted
    combination of the features plus Gaussian noise, so the relationship
    is logically meaningful but not a deterministic formula the model can
    trivially memorize.
    """
    rng = np.random.default_rng(seed)

    missing_documents = rng.poisson(1.2, n_records).clip(0, 6)
    document_errors = rng.poisson(0.6, n_records).clip(0, 4)
    dependencies = rng.poisson(1.0, n_records).clip(0, 5)
    inspection_required = rng.binomial(1, 0.4, n_records)
    application_complexity = rng.choice([1, 2, 3], size=n_records, p=[0.30, 0.45, 0.25])
    days_to_deadline = rng.integers(1, 120, n_records)
    number_of_requirements = rng.integers(4, 15, n_records)

    # Weighted contribution of each feature toward an underlying risk score.
    # Deadline pressure only matters meaningfully inside a ~30 day window.
    deadline_pressure = np.clip(30 - np.clip(days_to_deadline, 0, 30), 0, 30)

    raw_score = (
        missing_documents * 12
        + document_errors * 10
        + dependencies * 8
        + inspection_required * 10
        + application_complexity * 6
        + deadline_pressure * 1.0
        + number_of_requirements * 1.5
    )

    noise = rng.normal(loc=0, scale=15, size=n_records)
    noisy_score = raw_score + noise

    # Normalize to 0-100 for readability, then threshold into a binary label.
    score_norm = (noisy_score - noisy_score.min()) / (noisy_score.max() - noisy_score.min()) * 100
    label = (score_norm >= 55).astype(int)

    df = pd.DataFrame({
        "missing_documents": missing_documents,
        "document_errors": document_errors,
        "dependencies": dependencies,
        "inspection_required": inspection_required,
        "application_complexity": application_complexity,
        "days_to_deadline": days_to_deadline,
        "number_of_requirements": number_of_requirements,
        TARGET_NAME: label,
    })
    return df[FEATURE_NAMES + [TARGET_NAME]]


def train_and_evaluate(df: pd.DataFrame):
    X = df[FEATURE_NAMES]
    y = df[TARGET_NAME]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    model = RandomForestClassifier(**RANDOM_FOREST_PARAMS)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, zero_division=0),
        "recall": recall_score(y_test, y_pred, zero_division=0),
        "f1_score": f1_score(y_test, y_pred, zero_division=0),
        "roc_auc": roc_auc_score(y_test, y_proba),
    }
    cm = confusion_matrix(y_test, y_pred)

    importances = sorted(
        zip(FEATURE_NAMES, model.feature_importances_), key=lambda x: x[1], reverse=True
    )

    return model, metrics, cm, importances


def main():
    print(f"Generating {N_SYNTHETIC_RECORDS} synthetic training records (seed={RANDOM_STATE})...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ML_DIR.mkdir(parents=True, exist_ok=True)

    df = generate_synthetic_dataset()
    df.to_csv(TRAINING_DATA_PATH, index=False)
    print(f"Saved training data -> {TRAINING_DATA_PATH} ({len(df)} rows)")
    print(f"Class balance: high_risk=1 -> {df[TARGET_NAME].mean():.2%}")

    print("\nTraining RandomForestClassifier...")
    model, metrics, cm, importances = train_and_evaluate(df)

    print("\n=== Evaluation (20% held-out, stratified) ===")
    for name, value in metrics.items():
        print(f"{name:>10}: {value:.4f}")
    print("\nConfusion matrix [[TN, FP], [FN, TP]]:")
    print(cm)

    print("\n=== Feature Importance ===")
    for feature, importance in importances:
        bar = "#" * int(importance * 50)
        print(f"{feature:>24}: {importance:.4f} {bar}")

    joblib.dump(model, MODEL_PATH)
    print(f"\nSaved model -> {MODEL_PATH}")

    print(
        "\nDISCLAIMER: This model is trained on synthetic application scenarios for "
        "demonstration purposes. It does not represent real-world government approval "
        "prediction accuracy. Production deployment would require authorized and "
        "appropriately anonymized historical approval data."
    )


if __name__ == "__main__":
    main()

"""
Evaluate an already-trained risk_model.pkl against a freshly regenerated
(but seed-identical, therefore reproducible) synthetic evaluation split.

Run from the backend directory:

    python ml/evaluate_risk_model.py

Use this to re-check a saved model's metrics without retraining it, e.g.
after pulling a teammate's committed risk_model.pkl.
"""
import sys
from pathlib import Path

import joblib
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from ml.model_config import (  # noqa: E402
    FEATURE_NAMES,
    MODEL_PATH,
    RANDOM_STATE,
    TARGET_NAME,
    TEST_SIZE,
)
from ml.train_risk_model import generate_synthetic_dataset  # noqa: E402


def main():
    if not MODEL_PATH.exists():
        print(f"No trained model found at {MODEL_PATH}.")
        print("Run `python ml/train_risk_model.py` first.")
        sys.exit(1)

    model = joblib.load(MODEL_PATH)
    df = generate_synthetic_dataset()

    X = df[FEATURE_NAMES]
    y = df[TARGET_NAME]
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("=== Model Evaluation ===")
    print(f"Model path: {MODEL_PATH}")
    print(f"Test set size: {len(X_test)}\n")

    print(f"Accuracy : {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"Recall   : {recall_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"F1 score : {f1_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"ROC-AUC  : {roc_auc_score(y_test, y_proba):.4f}\n")

    print("Confusion matrix [[TN, FP], [FN, TP]]:")
    print(confusion_matrix(y_test, y_pred))

    print("\nClassification report:")
    print(classification_report(y_test, y_pred, target_names=["not_high_risk", "high_risk"]))

    print("Feature importance:")
    for feature, importance in sorted(
        zip(FEATURE_NAMES, model.feature_importances_), key=lambda x: x[1], reverse=True
    ):
        print(f"  {feature:>24}: {importance:.4f}")

    print(
        "\nDISCLAIMER: Evaluated against synthetic application scenarios. Not a measure "
        "of real-world government approval prediction accuracy."
    )


if __name__ == "__main__":
    main()

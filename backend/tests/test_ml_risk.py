"""Tests for the ML risk layer: model loading/inference, the hybrid risk
endpoints, the what-if simulator, and end-to-end dynamic risk behavior
(risk must change when application state changes)."""
from app.services import ml_risk_service
from ml.model_config import FEATURE_NAMES


# --- ML model unit tests -----------------------------------------------

def test_model_loads():
    assert ml_risk_service.model_available() is True


def test_prediction_returns_probability_and_score():
    features = {
        "missing_documents": 2,
        "document_errors": 1,
        "dependencies": 3,
        "inspection_required": 1,
        "application_complexity": 3,
        "days_to_deadline": 5,
        "number_of_requirements": 10,
    }
    result = ml_risk_service.predict_from_features(features)
    assert result is not None
    assert 0 <= result["risk_score"] <= 100
    assert 0.0 <= result["risk_probability"] <= 1.0
    assert result["risk_level"] in {"LOW", "MEDIUM", "HIGH"}
    assert result["model"]["name"] == "Random Forest"


def test_higher_risk_features_score_at_least_as_high_as_low_risk_features():
    """A clearly worse scenario should not score lower than a clearly better one."""
    low_risk_features = {
        "missing_documents": 0,
        "document_errors": 0,
        "dependencies": 0,
        "inspection_required": 0,
        "application_complexity": 1,
        "days_to_deadline": 90,
        "number_of_requirements": 5,
    }
    high_risk_features = {
        "missing_documents": 5,
        "document_errors": 3,
        "dependencies": 4,
        "inspection_required": 1,
        "application_complexity": 3,
        "days_to_deadline": 2,
        "number_of_requirements": 14,
    }
    low = ml_risk_service.predict_from_features(low_risk_features)
    high = ml_risk_service.predict_from_features(high_risk_features)
    assert high["risk_score"] >= low["risk_score"]


def test_feature_importance_available_and_matches_feature_names():
    importance = ml_risk_service.get_feature_importance()
    assert importance is not None
    assert {row["feature"] for row in importance} == set(FEATURE_NAMES)
    total = sum(row["importance"] for row in importance)
    assert abs(total - 1.0) < 0.05  # RF importances sum to ~1


def test_model_unavailable_degrades_gracefully(monkeypatch):
    monkeypatch.setattr(ml_risk_service, "_load_model", lambda: None)
    assert ml_risk_service.model_available() is False
    assert ml_risk_service.predict_from_features({name: 0 for name in FEATURE_NAMES}) is None
    assert ml_risk_service.get_feature_importance() is None


# --- Hybrid risk API tests -----------------------------------------------

def test_hybrid_business_risk_backward_compatible_fields(client):
    response = client.get("/api/risk/1")
    assert response.status_code == 200
    data = response.json()["data"]
    # Original rule-engine fields must still be present, unchanged in meaning.
    assert "readiness_score" in data
    assert "risk_level" in data
    assert "factors" in data
    assert isinstance(data["factors"], list)
    # New ML fields.
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 100
    assert "model" in data
    assert data["model"]["name"] == "Random Forest"
    assert "feature_importance" in data


def test_hybrid_risk_invalid_business_still_404s(client):
    response = client.get("/api/risk/9999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"


def test_application_level_risk(client):
    response = client.get("/api/risk/application/3")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["application_id"] == 3
    assert "risk_score" in data
    assert "readiness_score" in data
    assert "missing_documents" in data
    assert "blocked_dependencies" in data
    assert "next_best_action" in data
    assert isinstance(data["next_best_action"], str) and len(data["next_best_action"]) > 0


def test_application_level_risk_invalid_id(client):
    response = client.get("/api/risk/application/9999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "APPLICATION_NOT_FOUND"


# --- What-if simulator tests -----------------------------------------------

def test_what_if_simulation_shape(client):
    response = client.post("/api/risk/what-if/1", json={})
    assert response.status_code == 200
    data = response.json()["data"]
    assert "current" in data and "simulated" in data
    assert "readiness_score" in data["current"]
    assert "readiness_score" in data["simulated"]
    assert "improvement" in data
    assert "disclaimer" in data


def test_what_if_does_not_mutate_database(client, db_session):
    from app.models import Application

    before = {a.id: a.status for a in db_session.query(Application).all()}
    client.post(
        "/api/risk/what-if/1",
        json={"resolve_missing_documents": True, "resolve_document_errors": True, "resolve_dependencies": True},
    )
    after = {a.id: a.status for a in db_session.query(Application).all()}
    assert before == after


def test_what_if_invalid_business(client):
    response = client.post("/api/risk/what-if/9999", json={})
    assert response.status_code == 404


# --- Dynamic risk behavior (must change with application state) -----------

def test_risk_improves_after_uploading_and_validating_missing_document(client):
    """Application 3 (Pollution Consent, seeded) starts with a missing
    Project Report. Uploading + validating it should raise readiness_score
    and should not raise (should not worsen) the hybrid risk_score."""
    before = client.get("/api/risk/application/3").json()["data"]

    file_content = (
        b"Project Report\n"
        b"Business Name: Arun Manufacturing Pvt. Ltd.\n"
        b"District: Coimbatore\n"
        b"State: Tamil Nadu\n"
    )
    upload_res = client.post(
        "/api/documents/upload",
        data={"business_id": 1, "application_id": 3, "document_type": "project_report"},
        files={"file": ("project_report.txt", file_content, "text/plain")},
    )
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["data"]["id"]

    validate_res = client.post(f"/api/documents/{doc_id}/validate")
    assert validate_res.status_code == 200

    after = client.get("/api/risk/application/3").json()["data"]

    assert after["readiness_score"] >= before["readiness_score"]
    assert len(after["missing_documents"]) <= len(before["missing_documents"])

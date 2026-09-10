def test_get_business_risk_score(client):
    """Test retrieving explainable risk and readiness score."""
    response = client.get("/api/risk/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "readiness_score" in data
    assert "risk_level" in data
    assert "factors" in data
    assert data["risk_level"] in {"LOW", "MEDIUM", "HIGH"}
    assert 0 <= data["readiness_score"] <= 100
    assert isinstance(data["factors"], list)


def test_get_risk_invalid_business(client):
    """Test retrieving risk score for non-existent business returns 404."""
    response = client.get("/api/risk/9999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"

def test_list_incentives_success(client):
    """Test retrieving potential schemes and incentives for a business."""
    response = client.get("/api/incentives/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert isinstance(res["data"], list)
    assert len(res["data"]) > 0

    first_scheme = res["data"][0]
    assert "name" in first_scheme
    assert "match_score" in first_scheme
    assert "eligibility" in first_scheme
    assert 0 <= first_scheme["match_score"] <= 100


def test_list_incentives_invalid_business(client):
    """Test incentives for non-existent business returns 404."""
    response = client.get("/api/incentives/9999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"

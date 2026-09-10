def test_get_next_best_action_seeded_business(client):
    """Test next-best-action recommendation for seeded business."""
    response = client.get("/api/recommendations/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "priority" in data
    assert "title" in data
    assert "description" in data
    assert "actions" in data
    assert isinstance(data["actions"], list)
    assert len(data["actions"]) > 0

    # In seeded demo, Pollution Consent has missing project_report
    assert "Pollution Consent" in data["title"] or "Documentation" in data["title"]


def test_get_next_best_action_invalid_business(client):
    """Test recommendation for non-existent business returns 404."""
    response = client.get("/api/recommendations/9999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"

def test_get_dashboard_success(client):
    """Test retrieving complete dashboard summary for a business."""
    response = client.get("/api/dashboard/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "business" in data
    assert data["business"]["id"] == 1
    assert "total_approvals" in data
    assert "approval_progress" in data
    assert "next_best_action" in data
    assert "compliance_health" in data
    assert "risk_level" in data
    assert "upcoming_deadlines" in data
    assert "recent_applications" in data
    assert data["total_approvals"] > 0


def test_get_dashboard_invalid_business(client):
    """Test retrieving dashboard for non-existent business returns 404."""
    response = client.get("/api/dashboard/9999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"

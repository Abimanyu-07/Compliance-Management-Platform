def test_get_dependencies_graph_success(client):
    """Test retrieving dependency graph for a business."""
    response = client.get("/api/dependencies/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "nodes" in data
    assert "edges" in data
    assert "blocked_approvals" in data
    assert "critical_dependencies" in data
    assert len(data["nodes"]) > 0
    assert len(data["edges"]) > 0

    # Ensure edge payload has source_name and target_name
    first_edge = data["edges"][0]
    assert "source" in first_edge
    assert "target" in first_edge
    assert "source_name" in first_edge
    assert "target_name" in first_edge


def test_get_dependencies_invalid_business(client):
    """Test retrieving dependency graph for non-existent business returns 404."""
    response = client.get("/api/dependencies/9999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"

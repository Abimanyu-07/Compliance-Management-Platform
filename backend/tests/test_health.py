def test_root_endpoint(client):
    """Test the root endpoint returns API information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "InnovX Backend" in data["data"]["name"]
    assert data["data"]["problem_statement"] == 20
    assert data["data"]["docs"] == "/docs"


def test_health_endpoint(client):
    """Test the health check endpoint returns ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "ok"
    assert data["message"] == "Healthy"


def test_404_not_found_route(client):
    """Test accessing an unknown route returns 404."""
    response = client.get("/api/nonexistent-route")
    assert response.status_code == 404

def test_create_grievance_success(client):
    """Test creating a new grievance ticket."""
    payload = {
        "business_id": 1,
        "application_id": 3,
        "category": "Document Clarification",
        "description": "Need clarification on land document requirements.",
        "priority": "MEDIUM",
    }
    response = client.post("/api/grievances", json=payload)
    assert response.status_code == 201
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["id"] is not None
    assert data["business_id"] == 1
    assert data["category"] == "Document Clarification"
    assert data["status"] == "OPEN"


def test_create_grievance_invalid_business(client):
    """Test creating grievance for non-existent business returns 404."""
    payload = {
        "business_id": 9999,
        "category": "Delay",
        "description": "Application delayed",
    }
    response = client.post("/api/grievances", json=payload)
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"


def test_list_grievances_for_business(client):
    """Test listing all grievances for a business."""
    response = client.get("/api/grievances/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "total" in res["data"]
    assert "grievances" in res["data"]
    assert res["data"]["total"] >= 1


def test_patch_grievance_status(client):
    """Test updating status and priority of a grievance."""
    response = client.patch(
        "/api/grievances/1",
        json={"status": "RESOLVED", "priority": "LOW"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["status"] == "RESOLVED"
    assert res["data"]["priority"] == "LOW"


def test_patch_grievance_not_found(client):
    """Test patching non-existent grievance returns 404."""
    response = client.patch(
        "/api/grievances/99999",
        json={"status": "RESOLVED"},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "GRIEVANCE_NOT_FOUND"

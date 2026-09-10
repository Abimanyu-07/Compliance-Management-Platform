def test_create_or_refresh_application(client):
    """Test creating or refreshing an application evaluation."""
    response = client.post(
        "/api/applications",
        json={"business_id": 1, "requirement_id": 3},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "application_id" in data
    assert "readiness_score" in data
    assert "status" in data
    assert "factors" in data


def test_create_application_invalid_business(client):
    """Test creating application for non-existent business returns 404."""
    response = client.post(
        "/api/applications",
        json={"business_id": 9999, "requirement_id": 1},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"


def test_list_applications_by_business(client):
    """Test listing all applications for a business."""
    response = client.get("/api/applications/business/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["total"] > 0
    assert len(res["data"]["applications"]) == res["data"]["total"]


def test_get_application_detail_with_timeline(client):
    """Test getting single application includes timeline progress."""
    response = client.get("/api/applications/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["id"] == 1
    assert "timeline" in data
    assert isinstance(data["timeline"], list)
    assert any(step["stage"] == "Application Prepared" for step in data["timeline"])


def test_patch_application_status_valid_transition(client):
    """Test valid application status transition (e.g., READY_TO_APPLY to SUBMITTED)."""
    # Application 6 (Trade Licence) in demo seed is READY_TO_APPLY
    app_res = client.get("/api/applications/6")
    current_status = app_res.json()["data"]["status"]

    if current_status == "READY_TO_APPLY":
        patch_res = client.patch(
            "/api/applications/6/status",
            json={"status": "SUBMITTED"},
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["data"]["status"] == "SUBMITTED"
        assert patch_res.json()["data"]["submitted_date"] is not None


def test_patch_application_status_invalid_transition(client):
    """Test invalid status transition returns 400 error."""
    # Application 1 (GST Registration) in demo seed is APPROVED, cannot jump directly to NOT_STARTED
    patch_res = client.patch(
        "/api/applications/1/status",
        json={"status": "NOT_STARTED"},
    )
    assert patch_res.status_code == 400
    res = patch_res.json()
    assert res["success"] is False
    assert res["error"]["code"] == "INVALID_STATUS_TRANSITION"


def test_patch_application_not_found(client):
    """Test patching non-existent application returns 404."""
    response = client.patch(
        "/api/applications/99999/status",
        json={"status": "SUBMITTED"},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "APPLICATION_NOT_FOUND"

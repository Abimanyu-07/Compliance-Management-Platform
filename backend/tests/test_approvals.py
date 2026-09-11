def test_where_to_apply_success(client):
    """Test where-to-apply endpoint returns authority and official portal status."""
    # Approval ID 1 is GST Registration
    response = client.get("/api/approvals/1/where-to-apply")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["id"] == 1
    assert "authority" in data
    assert "portal_status" in data
    assert "disclaimer" in data


def test_where_to_apply_not_found(client):
    """Test where-to-apply with invalid approval ID returns 404."""
    response = client.get("/api/approvals/9999/where-to-apply")
    assert response.status_code == 404
    res = response.json()
    assert res["success"] is False
    assert res["error"]["code"] == "APPROVAL_NOT_FOUND"


def test_approval_documents_checklist(client):
    """Test retrieving document requirements checklist for an approval."""
    # Requirement ID 3 (Pollution Consent)
    response = client.get("/api/approvals/3/documents?business_id=1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["approval_id"] == 3
    assert "total_required" in data
    assert "documents" in data
    assert isinstance(data["documents"], list)
    assert data["total_required"] > 0


def test_approval_documents_not_found(client):
    """Test document checklist for invalid approval returns 404."""
    response = client.get("/api/approvals/9999/documents?business_id=1")
    assert response.status_code == 404
    res = response.json()
    assert res["error"]["code"] == "APPROVAL_NOT_FOUND"


def test_approval_detail_for_business(client):
    """Test getting approval detail for a specific business."""
    response = client.get("/api/approvals/1/3")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["business_id"] == 1
    assert data["requirement_id"] == 3
    assert "where_to_apply" in data
    assert "status" in data


def test_approval_detail_not_found(client):
    """Test getting approval detail for non-existent application returns 404."""
    response = client.get("/api/approvals/1/9999")
    assert response.status_code == 404
    res = response.json()
    assert res["error"]["code"] == "APPROVAL_NOT_FOUND"


def test_list_approvals_for_business(client):
    """Test listing all approvals for a business."""
    response = client.get("/api/approvals/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "total" in data
    assert "approvals" in data
    assert data["total"] > 0


def test_list_approvals_with_filters(client):
    """Test listing approvals with status, category, and search query filters."""
    # Filter by status
    res_status = client.get("/api/approvals/1?status=APPROVED")
    assert res_status.status_code == 200
    for app in res_status.json()["data"]["approvals"]:
        assert app["status"] == "APPROVED"

    # Search filter
    res_search = client.get("/api/approvals/1?search=Pollution")
    assert res_search.status_code == 200
    approvals = res_search.json()["data"]["approvals"]
    assert len(approvals) >= 1
    assert any("Pollution" in a["name"] for a in approvals)

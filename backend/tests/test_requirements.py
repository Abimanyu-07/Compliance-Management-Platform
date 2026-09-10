def test_list_requirements_for_seeded_business(client):
    """Test retrieving applicable requirements for the default seeded business."""
    response = client.get("/api/requirements/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "total" in data
    assert "disclaimer" in data
    assert "requirements" in data
    assert data["total"] > 0
    assert len(data["requirements"]) == data["total"]

    # Verify requirement structure
    req_names = [r["name"] for r in data["requirements"]]
    assert "GST Registration" in req_names
    assert "Pollution Consent" in req_names
    assert "FSSAI License" in req_names


def test_list_requirements_business_not_found(client):
    """Test requirement retrieval for non-existent business returns 404."""
    response = client.get("/api/requirements/9999")
    assert response.status_code == 404
    res = response.json()
    assert res["success"] is False
    assert res["error"]["code"] == "BUSINESS_NOT_FOUND"


def test_rule_engine_filtering(client):
    """Test that non-food business outside Tamil Nadu does not get food/TN specific licenses."""
    tech_biz = {
        "name": "CloudOps Solutions",
        "business_type": "Private Limited Company",
        "sector": "Information Technology",
        "state": "Karnataka",
        "district": "Bengaluru",
        "investment": 2000000.0,
        "employees": 15,
        "stage": "Starting Business",
    }
    create_res = client.post("/api/business", json=tech_biz)
    assert create_res.status_code == 201
    biz_id = create_res.json()["data"]["business"]["id"]

    req_res = client.get(f"/api/requirements/{biz_id}")
    assert req_res.status_code == 200
    req_data = req_res.json()["data"]
    req_names = [r["name"] for r in req_data["requirements"]]

    # GST and Business Registration are 'always'
    assert "GST Registration" in req_names
    assert "Business Registration" in req_names
    # FSSAI is food specific, should not match IT sector
    assert "FSSAI License" not in req_names

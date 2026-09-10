def test_create_business_success(client, sample_business_data):
    """Test creating a new business generates compliance profile and applications."""
    response = client.post("/api/business", json=sample_business_data)
    assert response.status_code == 201
    res = response.json()
    assert res["success"] is True
    assert "business" in res["data"]
    assert res["data"]["business"]["name"] == sample_business_data["name"]
    assert res["data"]["business"]["sector"] == sample_business_data["sector"]
    assert res["data"]["requirements_identified"] > 0
    assert res["data"]["business"]["id"] is not None


def test_create_business_validation_error(client):
    """Test creating a business with missing required fields fails validation."""
    invalid_data = {
        "name": "Incomplete Business"
        # missing sector, state, district, investment, employees
    }
    response = client.post("/api/business", json=invalid_data)
    assert response.status_code == 422
    res = response.json()
    assert res["success"] is False
    assert res["error"]["code"] == "VALIDATION_ERROR"


def test_list_businesses_success(client):
    """Test retrieving all business profiles."""
    response = client.get("/api/business")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "businesses" in res["data"]
    assert res["data"]["total"] >= 1
    assert any(b["id"] == 1 for b in res["data"]["businesses"])


def test_get_business_success(client):
    """Test retrieving an existing seeded business profile."""
    response = client.get("/api/business/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["id"] == 1
    assert res["data"]["name"] == "Arun Manufacturing Pvt. Ltd."
    assert res["data"]["sector"] == "Food Manufacturing"


def test_get_business_not_found(client):
    """Test retrieving a non-existent business returns 404."""
    response = client.get("/api/business/99999")
    assert response.status_code == 404
    res = response.json()
    assert res["success"] is False
    assert res["error"]["code"] == "BUSINESS_NOT_FOUND"


def test_update_business_success(client):
    """Test updating existing business fields updates data and requirements."""
    update_payload = {
        "investment": 15000000.0,
        "employees": 60,
        "stage": "Expansion Stage",
    }
    response = client.put("/api/business/1", json=update_payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["business"]["investment"] == 15000000.0
    assert res["data"]["business"]["employees"] == 60
    assert res["data"]["business"]["stage"] == "Expansion Stage"
    assert res["data"]["requirements_identified"] > 0


def test_update_business_not_found(client):
    """Test updating a non-existent business returns 404."""
    response = client.put("/api/business/99999", json={"investment": 50000.0})
    assert response.status_code == 404
    res = response.json()
    assert res["success"] is False
    assert res["error"]["code"] == "BUSINESS_NOT_FOUND"

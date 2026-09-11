def test_copilot_chat_portal_inquiry(client):
    """Test copilot response for application portal/where to apply question."""
    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 1, "message": "Where do I apply for pollution consent?"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "answer" in data
    assert "suggested_actions" in data
    assert "Where to Apply" in data["answer"]


def test_copilot_chat_risk_inquiry(client):
    """Test copilot response for compliance risk / health score question."""
    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 1, "message": "What is my current compliance risk?"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "Compliance health is" in data["answer"]
    assert "risk" in data["answer"].lower()


def test_copilot_chat_incentives_inquiry(client):
    """Test copilot response for government subsidy / scheme question."""
    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 1, "message": "Are there any subsidies or incentives for me?"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "incentives" in res["data"]["answer"].lower()


def test_copilot_chat_default_nba(client):
    """Test copilot response for general next steps."""
    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 1, "message": "What should our next step be?"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "highest-priority action" in res["data"]["answer"].lower()


def test_copilot_chat_invalid_business(client):
    """Test copilot chat with invalid business returns 404."""
    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 9999, "message": "Hello"},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"

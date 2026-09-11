def test_register_new_user_success(client):
    """Test user registration with company details creates user, business, and returns JWT."""
    payload = {
        "email": "newfounder@enterprise.com",
        "password": "securepassword123",
        "full_name": "Priya Sharma",
        "company_name": "Priya BioTech Ltd.",
        "sector": "Food Manufacturing",
        "state": "Tamil Nadu",
        "district": "Coimbatore",
        "investment": 8000000.0,
        "employees": 40,
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    res = response.json()
    assert res["success"] is True
    assert "access_token" in res["data"]
    assert res["data"]["user"]["email"] == "newfounder@enterprise.com"
    assert res["data"]["user"]["full_name"] == "Priya Sharma"
    assert res["data"]["business"]["name"] == "Priya BioTech Ltd."
    assert res["data"]["requirements_identified"] > 0


def test_register_duplicate_email_fails(client):
    """Test registering with an existing email returns 400 error."""
    payload = {
        "email": "duplicate@test.com",
        "password": "password123",
        "full_name": "Test User",
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert res2.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"


def test_login_success(client):
    """Test logging in with valid credentials returns JWT token and businesses."""
    # First register a user
    register_payload = {
        "email": "loginuser@test.com",
        "password": "mypassword123",
        "full_name": "Login Tester",
        "company_name": "Login Test Company",
    }
    reg_res = client.post("/api/auth/register", json=register_payload)
    assert reg_res.status_code == 201

    # Login
    login_payload = {
        "email": "loginuser@test.com",
        "password": "mypassword123",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "access_token" in res["data"]
    assert res["data"]["user"]["email"] == "loginuser@test.com"
    assert len(res["data"]["businesses"]) >= 1


def test_login_invalid_password_fails(client):
    """Test login with wrong password returns 401."""
    login_payload = {
        "email": "arun@innovx-manufacturing.com",
        "password": "wrongpassword",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_nonexistent_user_fails(client):
    """Test login with nonexistent email returns 401."""
    login_payload = {
        "email": "nonexistent@nowhere.com",
        "password": "anypassword",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_get_me_authenticated(client):
    """Test /api/auth/me returns current user profile when valid token provided."""
    register_payload = {
        "email": "metester@test.com",
        "password": "mypassword123",
        "full_name": "Me Tester",
        "company_name": "Me Test Enterprise",
    }
    reg_res = client.post("/api/auth/register", json=register_payload)
    token = reg_res.json()["data"]["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["user"]["email"] == "metester@test.com"


def test_get_me_unauthorized_without_token(client):
    """Test /api/auth/me returns 401 when no token provided."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_logout_endpoint(client):
    """Test logout endpoint returns success."""
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json()["success"] is True

import io
import json


def test_upload_document_success(client):
    """Test uploading a valid text document."""
    file_content = b"Project Report for Arun Manufacturing Pvt. Ltd. Location: Coimbatore, Tamil Nadu"
    response = client.post(
        "/api/documents/upload",
        data={
            "business_id": 1,
            "application_id": 3,
            "document_type": "project_report",
        },
        files={"file": ("project_report.txt", file_content, "text/plain")},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "id" in res["data"]
    assert res["data"]["filename"] == "project_report.txt"
    assert res["data"]["status"] == "UPLOADED"


def test_upload_document_invalid_business(client):
    """Test uploading a document with non-existent business ID returns 404."""
    response = client.post(
        "/api/documents/upload",
        data={
            "business_id": 9999,
            "document_type": "project_report",
        },
        files={"file": ("test.txt", b"sample content", "text/plain")},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BUSINESS_NOT_FOUND"


def test_upload_document_invalid_application(client):
    """Test uploading a document with non-existent application ID returns 404."""
    response = client.post(
        "/api/documents/upload",
        data={
            "business_id": 1,
            "application_id": 9999,
            "document_type": "project_report",
        },
        files={"file": ("test.txt", b"sample content", "text/plain")},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "APPLICATION_NOT_FOUND"


def test_upload_document_unsupported_type(client):
    """Test uploading an unsupported file format returns 400."""
    response = client.post(
        "/api/documents/upload",
        data={
            "business_id": 1,
            "document_type": "project_report",
        },
        files={"file": ("executable.exe", b"binary content", "application/octet-stream")},
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "UNSUPPORTED_DOCUMENT_TYPE"


def test_validate_uploaded_document_verified(client):
    """Test validating an uploaded document with matching business name and address."""
    file_content = (
        b"Annual Project Report\n"
        b"Company: Arun Manufacturing Pvt. Ltd.\n"
        b"District: Coimbatore, State: Tamil Nadu\n"
        b"Document Type: project_report\n"
    )
    upload_res = client.post(
        "/api/documents/upload",
        data={
            "business_id": 1,
            "application_id": 3,
            "document_type": "project_report",
        },
        files={"file": ("project_report.txt", file_content, "text/plain")},
    )
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["data"]["id"]

    val_res = client.post(f"/api/documents/{doc_id}/validate")
    assert val_res.status_code == 200
    val_data = val_res.json()["data"]
    assert val_data["status"] == "VERIFIED"
    assert val_data["score"] >= 95
    assert val_data["checks"]["business_name"] is True
    assert val_data["checks"]["address"] is True


def test_validate_seeded_demo_document_fails(client):
    """Test validating a seeded demo document without real file returns 400."""
    # Seeded document ID 1 has file_path='seeded://demo'
    response = client.post("/api/documents/1/validate")
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "DOCUMENT_NOT_FILE"


def test_list_documents_success(client):
    """Test listing documents for all businesses or filtered by business_id."""
    response = client.get("/api/documents?business_id=1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "documents" in res["data"]
    assert res["data"]["total"] >= 1
    assert all(d["business_id"] == 1 for d in res["data"]["documents"])


def test_get_document_metadata(client):
    """Test fetching document metadata by ID."""
    response = client.get("/api/documents/1")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["id"] == 1
    assert data["business_id"] == 1
    assert "document_type" in data
    assert "status" in data


def test_get_document_not_found(client):
    """Test getting metadata for non-existent document returns 404."""
    response = client.get("/api/documents/99999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "DOCUMENT_NOT_FOUND"


def test_document_field_level_district_mismatch(client):
    """Business profile district differs from an explicitly labeled district
    in the uploaded document text -> field-level issue + address check fails."""
    business_res = client.post(
        "/api/business",
        json={
            "name": "ABC Textiles",
            "business_type": "Private Limited Company",
            "sector": "Textiles",
            "state": "Tamil Nadu",
            "district": "Erode",
            "investment": 2000000,
            "employees": 12,
            "stage": "Starting Business",
        },
    )
    assert business_res.status_code in (200, 201)
    business_id = business_res.json()["data"]["business"]["id"]

    file_content = b"Business Name: ABC Textiles\nDistrict: Coimbatore\n"
    upload_res = client.post(
        "/api/documents/upload",
        data={"business_id": business_id, "document_type": "address_proof"},
        files={"file": ("address_proof.txt", file_content, "text/plain")},
    )
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["data"]["id"]

    validate_res = client.post(f"/api/documents/{doc_id}/validate")
    assert validate_res.status_code == 200
    data = validate_res.json()["data"]

    assert data["checks"]["address"] is False
    assert data["status"] in {"WARNING", "REJECTED"}
    field_issue_fields = [i["field"] for i in data["field_issues"]]
    assert "district" in field_issue_fields

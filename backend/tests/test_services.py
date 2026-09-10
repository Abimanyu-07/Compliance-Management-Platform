from app.services.document_validator import (
    extract_text_from_bytes,
    missing_mandatory,
    warning_documents,
)
from app.services.risk_engine import risk_level_from_score
from app.services.scheme_engine import business_size_label
from app.services.workflow import build_timeline, next_application_number
from app.utils.file_utils import is_allowed_file, sanitize_filename, unique_stored_name


def test_sanitize_filename():
    """Test filename sanitization removes illegal path and control characters."""
    assert sanitize_filename("my report * (1).pdf") == "my_report____1_.pdf"
    assert sanitize_filename("folder/subfolder/file.pdf") == "file.pdf"
    assert sanitize_filename("../../../secret.txt") == "secret.txt"
    assert sanitize_filename("") == "upload.bin"


def test_unique_stored_name():
    """Test generated storage names are unique and maintain file extension."""
    name1 = unique_stored_name("document.pdf")
    name2 = unique_stored_name("document.pdf")
    assert name1 != name2
    assert name1.endswith(".pdf")
    assert name2.endswith(".pdf")


def test_is_allowed_file():
    """Test file type validation."""
    assert is_allowed_file("report.pdf", "application/pdf") is True
    assert is_allowed_file("photo.png", "image/png") is True
    assert is_allowed_file("notes.txt", "text/plain") is True
    assert is_allowed_file("malicious.sh", "application/x-sh") is False
    assert is_allowed_file("virus.exe", None) is False


def test_risk_level_from_score():
    """Test mapping numerical scores to risk categories."""
    assert risk_level_from_score(95) == "LOW"
    assert risk_level_from_score(80) == "LOW"
    assert risk_level_from_score(79) == "MEDIUM"
    assert risk_level_from_score(55) == "MEDIUM"
    assert risk_level_from_score(54) == "HIGH"
    assert risk_level_from_score(0) == "HIGH"


def test_business_size_label(db_session):
    """Test MSME classification logic."""
    from app.models import Business

    micro = Business(name="Micro", employees=5, investment=500000)
    small = Business(name="Small", employees=30, investment=5000000)
    medium = Business(name="Medium", employees=100, investment=20000000)

    assert business_size_label(micro) == "Micro"
    assert business_size_label(small) == "Small"
    assert business_size_label(medium) == "Medium"


def test_build_timeline():
    """Test workflow stages are accurately marked as completed."""
    timeline_draft = build_timeline("DRAFT")
    assert timeline_draft[0]["stage"] == "Application Prepared"
    assert timeline_draft[0]["completed"] is True
    assert timeline_draft[1]["completed"] is False

    timeline_approved = build_timeline("APPROVED")
    assert all(step["completed"] is True for step in timeline_approved)


def test_extract_text_from_bytes():
    """Test extracting text from plain text and byte streams."""
    raw_text = b"Simple document text for testing"
    extracted = extract_text_from_bytes("sample.txt", raw_text)
    assert extracted == "Simple document text for testing"


def test_missing_and_warning_mandatory_helpers():
    """Test checklist filter helpers."""
    checklist = {
        "documents": [
            {"name": "PAN", "mandatory": True, "status": "MISSING"},
            {"name": "Address", "mandatory": True, "status": "VERIFIED"},
            {"name": "Report", "mandatory": False, "status": "MISSING"},
            {"name": "Plan", "mandatory": True, "status": "WARNING"},
        ]
    }
    missing = missing_mandatory(checklist)
    assert missing == ["PAN"]
    warnings = warning_documents(checklist)
    assert warnings == ["Plan"]

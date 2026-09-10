import json
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import (
    Application,
    Business,
    Dependency,
    Document,
    Grievance,
    Requirement,
    RequirementDocument,
    Scheme,
)
from app.services.risk_engine import refresh_application

DATA_DIR = Path(__file__).resolve().parent / "data"

REQUIRED_DOCS = {
    "GST Registration": [
        ("pan_card", "PAN Card", True),
        ("address_proof", "Address Proof", True),
        ("business_registration", "Business Registration Certificate", True),
    ],
    "Business Registration": [
        ("identity_proof", "Identity Proof", True),
        ("address_proof", "Address Proof", True),
    ],
    "Pollution Consent": [
        ("business_registration", "Business Registration Certificate", True),
        ("address_proof", "Address Proof", True),
        ("land_document", "Land Document", True),
        ("project_report", "Project Report", True),
    ],
    "Factory Licence": [
        ("pollution_consent", "Pollution Consent Certificate", True),
        ("building_plan", "Building Plan", True),
        ("occupancy", "Occupancy Certificate", False),
    ],
    "Fire Safety NOC": [
        ("building_plan", "Building Plan", True),
        ("fire_layout", "Fire Layout Plan", True),
    ],
    "Trade Licence": [
        ("address_proof", "Address Proof", True),
        ("business_registration", "Business Registration Certificate", True),
    ],
    "Labour Registration": [
        ("employee_list", "Employee List", True),
        ("business_registration", "Business Registration Certificate", True),
    ],
    "Professional Tax Registration": [
        ("business_registration", "Business Registration Certificate", True),
        ("address_proof", "Address Proof", True),
    ],
    "FSSAI License": [
        ("business_registration", "Business Registration Certificate", True),
        ("food_safety_plan", "Food Safety Plan", True),
        ("layout", "Unit Layout", True),
    ],
    "Udyam Registration": [
        ("pan_card", "PAN Card", True),
        ("business_registration", "Business Registration Certificate", True),
    ],
    "ESI Registration": [
        ("employee_list", "Employee List", True),
        ("bank_details", "Bank Details", True),
    ],
    "Final Operational Clearance": [
        ("factory_licence", "Factory Licence", True),
        ("fire_noc", "Fire Safety NOC", True),
    ],
}

DEMO_STATUSES = {
    "GST Registration": "APPROVED",
    "Business Registration": "APPROVED",
    "Pollution Consent": "ACTION_REQUIRED",
    "Factory Licence": "ACTION_REQUIRED",
    "Fire Safety NOC": "ACTION_REQUIRED",
    "Trade Licence": "READY_TO_APPLY",
    "Labour Registration": "READY_TO_APPLY",
    "Professional Tax Registration": "READY_TO_APPLY",
    "FSSAI License": "READY_TO_APPLY",
    "Udyam Registration": "APPROVED",
    "ESI Registration": "READY_TO_APPLY",
    "Final Operational Clearance": "NOT_STARTED",
}


def seed_if_empty(db: Session) -> None:
    if db.query(Requirement).first():
        return
    _seed_catalog(db)
    _seed_demo_business(db)


def _load(name: str) -> dict:
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def _seed_catalog(db: Session) -> None:
    for item in _load("requirements.json")["requirements"]:
        db.add(Requirement(**item))
    db.flush()

    reqs = {r.name: r for r in db.query(Requirement).all()}
    for req_name, docs in REQUIRED_DOCS.items():
        req = reqs.get(req_name)
        if not req:
            continue
        for doc_type, doc_name, mandatory in docs:
            db.add(
                RequirementDocument(
                    requirement_id=req.id,
                    document_type=doc_type,
                    document_name=doc_name,
                    mandatory=mandatory,
                )
            )

    for edge in _load("dependencies.json")["dependencies"]:
        src = reqs.get(edge["depends_on"])
        dst = reqs.get(edge["requirement"])
        if src and dst:
            db.add(
                Dependency(
                    requirement_id=dst.id,
                    depends_on_requirement_id=src.id,
                    description=edge["description"],
                )
            )

    for scheme in _load("schemes.json")["schemes"]:
        db.add(Scheme(**scheme))
    db.commit()


def _seed_demo_business(db: Session) -> None:
    business = Business(
        name="Arun Manufacturing Pvt. Ltd.",
        business_type="Private Limited Company",
        sector="Food Manufacturing",
        state="Tamil Nadu",
        district="Coimbatore",
        investment=5_000_000,
        employees=25,
        stage="Starting Business",
    )
    db.add(business)
    db.flush()

    reqs = db.query(Requirement).order_by(Requirement.id.asc()).all()
    now = datetime.utcnow()
    for index, req in enumerate(reqs, start=1):
        status = DEMO_STATUSES.get(req.name, "NOT_STARTED")
        app = Application(
            business_id=business.id,
            requirement_id=req.id,
            application_number=f"INX-2026-{index:05d}",
            status=status,
            submitted_date=now - timedelta(days=20) if status == "APPROVED" else None,
            deadline=now + timedelta(days=30 if req.name == "Pollution Consent" else 60),
            last_updated=now,
            readiness_score=40 if status == "ACTION_REQUIRED" else (100 if status == "APPROVED" else 85),
            risk_level="HIGH" if status == "ACTION_REQUIRED" else "LOW",
        )
        db.add(app)
        db.flush()
        _seed_docs_for_application(db, business, app, req)

    db.add(
        Grievance(
            business_id=business.id,
            application_id=db.query(Application)
            .filter(Application.requirement_id == next(r.id for r in reqs if r.name == "Pollution Consent"))
            .first()
            .id,
            category="Application Delay",
            description="Waiting on missing Project Report before Pollution Consent can move forward.",
            priority="HIGH",
            status="OPEN",
        )
    )
    db.commit()

    for app in db.query(Application).filter(Application.business_id == business.id).all():
        if app.status in {"APPROVED", "SUBMITTED", "UNDER_REVIEW", "INSPECTION"}:
            continue
        refresh_application(db, app)
        # Restore demo narrative statuses after scoring.
        desired = DEMO_STATUSES.get(app.requirement.name)
        if desired == "APPROVED":
            app.status = "APPROVED"
            app.readiness_score = 100
            app.risk_level = "LOW"
            app.blocking_reason = None
        db.add(app)
    db.commit()


def _seed_docs_for_application(db: Session, business: Business, app: Application, req: Requirement) -> None:
    required = db.query(RequirementDocument).filter(RequirementDocument.requirement_id == req.id).all()
    for item in required:
        if req.name == "Pollution Consent" and item.document_type == "project_report":
            continue
        verified = req.name in {"GST Registration", "Business Registration", "Udyam Registration", "Pollution Consent"}
        if req.name == "Pollution Consent":
            verified = True
        status = "VERIFIED" if verified or app.status in {"APPROVED", "READY_TO_APPLY"} else "UPLOADED"
        if app.status == "ACTION_REQUIRED" and req.name != "Pollution Consent":
            status = "UPLOADED"
        db.add(
            Document(
                business_id=business.id,
                application_id=app.id,
                document_name=item.document_name,
                document_type=item.document_type,
                file_path="seeded://demo",
                original_filename=f"{item.document_type}.pdf",
                status=status,
                validation_score=100 if status == "VERIFIED" else None,
                extracted_text="Arun Manufacturing Pvt. Ltd. Coimbatore Tamil Nadu" if status == "VERIFIED" else None,
            )
        )

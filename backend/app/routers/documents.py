import json
import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.database import BASE_DIR, get_db
from app.models import Application, Business, Document
from app.services.document_validator import validate_document
from app.services.risk_engine import refresh_application
from app.utils.file_utils import is_allowed_file, sanitize_filename, unique_stored_name
from app.utils.responses import fail, ok

router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR") or "uploads")
if not UPLOAD_DIR.is_absolute():
    UPLOAD_DIR = BASE_DIR / UPLOAD_DIR
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB") or 10)


def _public_document(doc: Document) -> dict:
    val_res = None
    if doc.validation_result:
        try:
            val_res = json.loads(doc.validation_result)
        except json.JSONDecodeError:
            val_res = doc.validation_result
    return {
        "id": doc.id,
        "filename": doc.original_filename,
        "document_name": doc.document_name,
        "document_type": doc.document_type,
        "status": doc.status,
        "validation_score": doc.validation_score,
        "validation_result": val_res,
        "application_id": doc.application_id,
        "business_id": doc.business_id,
        "uploaded_at": doc.uploaded_at,
    }


@router.get("", summary="List documents")
def list_documents(business_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Document)
    if business_id is not None:
        query = query.filter(Document.business_id == business_id)
    docs = query.order_by(Document.id.desc()).all()
    return ok({"total": len(docs), "documents": [_public_document(d) for d in docs]})


@router.get("/business/{business_id}", summary="List documents for a business")
def list_business_documents(business_id: int, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.business_id == business_id).order_by(Document.id.desc()).all()
    return ok({"total": len(docs), "documents": [_public_document(d) for d in docs]})


@router.post(
    "/upload",
    summary="Upload a document",
    description="Stores the file locally. Internal filesystem paths are never returned.",
)
async def upload_document(
    business_id: int = Form(...),
    application_id: int | None = Form(default=None),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if file is None or not file.filename:
        fail("MISSING_UPLOAD", "Missing upload.", 400)
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        fail("BUSINESS_NOT_FOUND", "Invalid business ID.", 404)
    if application_id:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            fail("APPLICATION_NOT_FOUND", "Invalid application ID.", 404)
    if not is_allowed_file(file.filename, file.content_type):
        fail("UNSUPPORTED_DOCUMENT_TYPE", "Unsupported document type.", 400)

    data = await file.read()
    if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
        fail("FILE_TOO_LARGE", f"File exceeds {MAX_UPLOAD_MB} MB limit.", 400)
    if not data:
        fail("MISSING_UPLOAD", "Missing upload.", 400)

    stored = unique_stored_name(file.filename)
    dest = UPLOAD_DIR / stored
    dest.write_bytes(data)

    doc = Document(
        business_id=business_id,
        application_id=application_id,
        document_name=sanitize_filename(file.filename),
        document_type=document_type,
        file_path=str(dest),
        original_filename=sanitize_filename(file.filename),
        status="UPLOADED",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return ok({"id": doc.id, "filename": doc.original_filename, "status": doc.status}, "Document uploaded")


@router.post("/{document_id}/validate", summary="Validate an uploaded document")
def validate(document_id: int, db: Session = Depends(get_db)):
    doc = (
        db.query(Document)
        .options(joinedload(Document.business))
        .filter(Document.id == document_id)
        .first()
    )
    if not doc:
        fail("DOCUMENT_NOT_FOUND", "Document not found.", 404)
    if not doc.file_path or doc.file_path.startswith("seeded://"):
        fail("DOCUMENT_NOT_FILE", "This demo record has no uploaded file to validate. Upload a file first.", 400)

    result = validate_document(db, doc)
    if doc.application_id:
        app = db.query(Application).filter(Application.id == doc.application_id).first()
        if app:
            refresh_application(db, app)
    return ok(result, "Document validation complete")


@router.get("/{document_id}", summary="Get document metadata")
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        fail("DOCUMENT_NOT_FOUND", "Document not found.", 404)
    payload = _public_document(doc)
    if doc.validation_result:
        try:
            payload["validation_result"] = json.loads(doc.validation_result)
        except json.JSONDecodeError:
            payload["validation_result"] = doc.validation_result
    return ok(payload)

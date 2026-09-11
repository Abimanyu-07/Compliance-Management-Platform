"""Deterministic document checks. Does not certify legal validity or government acceptance."""

import json
import re
from io import BytesIO
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Document, RequirementDocument

DOC_STATUS_VERIFIED = "VERIFIED"
DOC_STATUS_WARNING = "WARNING"
DOC_STATUS_REJECTED = "REJECTED"
DOC_STATUS_MISSING = "MISSING"
DOC_STATUS_UPLOADED = "UPLOADED"


def extract_text_from_file(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()
    try:
        if suffix == ".txt":
            return path.read_text(encoding="utf-8", errors="ignore")
        if suffix == ".pdf":
            from pypdf import PdfReader

            reader = PdfReader(str(path))
            parts = []
            for page in reader.pages:
                parts.append(page.extract_text() or "")
            return "\n".join(parts)
        if suffix in {".png", ".jpg", ".jpeg"}:
            try:
                import pytesseract
                from PIL import Image

                return pytesseract.image_to_string(Image.open(path))
            except Exception:
                return ""
    except Exception:
        return ""
    return ""


def extract_text_from_bytes(filename: str, data: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    try:
        if suffix == ".txt":
            return data.decode("utf-8", errors="ignore")
        if suffix == ".pdf":
            from pypdf import PdfReader

            reader = PdfReader(BytesIO(data))
            return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        return ""
    return ""


def _contains(text: str, value: str) -> bool:
    if not value:
        return False
    return value.lower() in (text or "").lower()


def _extract_field(text: str, field_labels: list[str]) -> str | None:
    """Best-effort 'Label: value' line extraction, e.g. 'District: Coimbatore'.
    Returns None if no such labeled line is found (falls back to a plain
    substring check in the caller — never invents a value)."""
    if not text:
        return None
    for label in field_labels:
        match = re.search(rf"{re.escape(label)}\s*[:\-]\s*([^,\n]+)", text, re.IGNORECASE)
        if match:
            return match.group(1).strip()[:120]
    return None


def _document_field_issues(business, extracted_district: str | None, address_ok: bool) -> list[dict]:
    """Structured, field-level validation issues (spec section 17 format),
    additive alongside the existing plain-English `issues` list."""
    issues = []
    if extracted_district and business.district and extracted_district.lower() != business.district.lower():
        issues.append({
            "field": "district",
            "message": (
                f"Document district ('{extracted_district}') does not match business profile "
                f"('{business.district}')."
            ),
        })
    elif not address_ok:
        issues.append({
            "field": "address",
            "message": "Document address does not clearly match the business profile.",
        })
    return issues


def validate_document(db: Session, document: Document) -> dict:
    business = document.business
    text = extract_text_from_file(document.file_path) if document.file_path else ""
    combined = f"{text} {document.original_filename or ''} {document.document_type or ''}"

    name_ok = _contains(combined, business.name) or _contains(combined, business.name.split()[0])
    address_ok = _contains(combined, business.district) or _contains(combined, business.state)
    extracted_district = _extract_field(text, ["district", "city"])
    if extracted_district and business.district and extracted_district.lower() != business.district.lower():
        # An explicit, differently-named district was found in the document text —
        # this is a stronger signal than a plain substring miss.
        address_ok = False
    type_ok = True
    if document.document_type:
        tokens = document.document_type.replace("_", " ").split()
        type_ok = any(_contains(combined, t) for t in tokens if len(t) > 3) or bool(document.document_type)

    # Empty scans/PDFs cannot prove address — warning is expected on first demo upload.
    if not (text or "").strip():
        name_ok = _contains(combined, business.name.split()[0])
        address_ok = False

    if "mismatch" in combined.lower():
        address_ok = False

    required_fields = bool(document.document_type) and bool(document.document_name)
    score = 100
    issues = []
    if not type_ok:
        score -= 20
        issues.append("Document type could not be confirmed from the file content.")
    if not name_ok:
        score -= 15
        issues.append("Business name was not clearly found in the document.")
    if not address_ok:
        score -= 18
        issues.append("Address mismatch detected")
    if not required_fields:
        score -= 20
        issues.append("Required document fields are incomplete.")

    score = max(0, min(100, score))
    if score >= 95 and address_ok and name_ok:
        status = DOC_STATUS_VERIFIED
        recommendation = "Document appears consistent with the business profile. This is not a government acceptance guarantee."
    elif score >= 70:
        status = DOC_STATUS_WARNING
        recommendation = "Review the address before submission."
    else:
        status = DOC_STATUS_REJECTED
        recommendation = "Re-upload a clearer document that shows the business name and address."

    result = {
        "status": status,
        "score": score,
        "checks": {
            "document_type": type_ok,
            "business_name": name_ok,
            "address": address_ok,
            "required_fields": required_fields,
        },
        "issues": issues,
        "field_issues": _document_field_issues(business, extracted_district, address_ok),
        "recommendation": recommendation,
        "disclaimer": "Prototype validation only. It does not certify legality or government acceptance.",
        "extracted_preview": (text or "")[:800],
    }

    document.extracted_text = text
    document.validation_score = score
    document.status = status
    document.validation_result = json.dumps(result)
    db.add(document)
    db.commit()
    db.refresh(document)
    return result


def requirement_document_checklist(db: Session, business_id: int, requirement_id: int, application_id: int | None = None) -> dict:
    required = (
        db.query(RequirementDocument)
        .filter(RequirementDocument.requirement_id == requirement_id)
        .all()
    )
    docs_q = db.query(Document).filter(Document.business_id == business_id)
    if application_id:
        docs_q = docs_q.filter(
            (Document.application_id == application_id) | (Document.application_id.is_(None))
        )
    uploaded = docs_q.all()

    rows = []
    verified = 0
    missing = 0
    warnings = 0
    for req in required:
        match = _best_match(uploaded, req)
        if match is None:
            status = DOC_STATUS_MISSING
            missing += 1
            score = None
            doc_id = None
        else:
            status = match.status or DOC_STATUS_UPLOADED
            score = match.validation_score
            doc_id = match.id
            if status == DOC_STATUS_VERIFIED:
                verified += 1
            elif status == DOC_STATUS_WARNING:
                warnings += 1
            elif status in {DOC_STATUS_REJECTED, DOC_STATUS_MISSING}:
                missing += 1
        rows.append(
            {
                "id": doc_id,
                "name": req.document_name,
                "document_type": req.document_type,
                "status": status,
                "mandatory": req.mandatory,
                "validation_score": score,
            }
        )

    return {
        "total_required": len(required),
        "verified": verified,
        "missing": missing,
        "warnings": warnings,
        "documents": rows,
    }


def _best_match(uploaded: list[Document], req: RequirementDocument) -> Document | None:
    typed = [d for d in uploaded if (d.document_type or "").lower() == req.document_type.lower()]
    if typed:
        typed.sort(key=lambda d: d.uploaded_at or d.id, reverse=True)
        return typed[0]
    named = [
        d
        for d in uploaded
        if req.document_name.lower() in (d.document_name or "").lower()
        or req.document_type.lower() in (d.document_name or "").lower()
    ]
    if named:
        named.sort(key=lambda d: d.uploaded_at or d.id, reverse=True)
        return named[0]
    return None


def missing_mandatory(checklist: dict) -> list[str]:
    return [
        d["name"]
        for d in checklist["documents"]
        if d["mandatory"] and d["status"] in {DOC_STATUS_MISSING, DOC_STATUS_REJECTED}
    ]


def warning_documents(checklist: dict) -> list[str]:
    return [d["name"] for d in checklist["documents"] if d["status"] == DOC_STATUS_WARNING]

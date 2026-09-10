from sqlalchemy.orm import Session

from app.models import Application
from app.services.dependency_engine import blocking_dependencies
from app.services.document_validator import missing_mandatory, requirement_document_checklist, warning_documents
from app.services.risk_engine import score_application


def get_next_best_action(db: Session, business_id: int) -> dict:
    apps = (
        db.query(Application)
        .filter(Application.business_id == business_id)
        .all()
    )
    if not apps:
        return {
            "priority": "MEDIUM",
            "title": "Create a business profile",
            "description": "No applications found for this business.",
            "reason": "A compliance profile is required before next-best-action can be generated.",
            "actions": [{"label": "Create Business", "route": "/onboarding"}],
        }

    # 1) Mandatory document missing
    for app in _priority_apps(apps):
        checklist = requirement_document_checklist(db, business_id, app.requirement_id, app.id)
        missing = missing_mandatory(checklist)
        if missing:
            name = app.requirement.name if app.requirement else "approval"
            return {
                "priority": "HIGH",
                "title": f"Complete {name} Documentation",
                "description": f"{missing[0]} is missing.",
                "reason": _dependency_reason(db, apps, app) or "Mandatory evidence is incomplete.",
                "related_application_id": app.id,
                "related_requirement_id": app.requirement_id,
                "actions": [
                    {"label": "Upload Document", "route": "/documents"},
                    {"label": "View Application", "route": f"/approvals/{app.requirement_id}"},
                ],
            }

    # 2) Validation warning
    for app in _priority_apps(apps):
        checklist = requirement_document_checklist(db, business_id, app.requirement_id, app.id)
        warnings = warning_documents(checklist)
        if warnings:
            name = app.requirement.name if app.requirement else "approval"
            return {
                "priority": "HIGH",
                "title": f"Fix {name} document issue",
                "description": f"{warnings[0]} has a validation warning.",
                "reason": "Inconsistent documents increase rejection risk.",
                "related_application_id": app.id,
                "related_requirement_id": app.requirement_id,
                "actions": [
                    {"label": "Review Document", "route": "/documents"},
                    {"label": "View Application", "route": f"/approvals/{app.requirement_id}"},
                ],
            }

    # 3) After docs are complete, proceed along the critical path (Factory Licence demo)
    factory = next((a for a in apps if a.requirement and a.requirement.name == "Factory Licence"), None)
    pollution = next((a for a in apps if a.requirement and a.requirement.name == "Pollution Consent"), None)
    if factory and factory.status not in {"APPROVED"} and pollution and pollution.status in {
        "READY_TO_APPLY",
        "SUBMITTED",
        "UNDER_REVIEW",
        "INSPECTION",
        "APPROVED",
    }:
        return {
            "priority": "HIGH",
            "title": "Proceed with Factory Licence",
            "description": "Pollution Consent documentation is complete. Prepare the next approval in the chain.",
            "reason": "Factory Licence is sequenced after Pollution Consent in this prototype.",
            "related_application_id": factory.id,
            "related_requirement_id": factory.requirement_id,
            "actions": [
                {"label": "View Factory Licence", "route": f"/approvals/{factory.requirement_id}"},
                {"label": "View Dependencies", "route": "/dependencies"},
            ],
        }

    # 4) Blocked by dependency
    for app in _priority_apps(apps):
        blocked = blocking_dependencies(db, business_id, app.requirement_id)
        if blocked and app.status not in {"APPROVED"}:
            parent = blocked[0]
            return {
                "priority": "HIGH",
                "title": f"Complete {parent['name']}",
                "description": f"{app.requirement.name} is blocked until {parent['name']} is approved.",
                "reason": "This application is blocking a downstream approval." if False else "A prerequisite approval is incomplete.",
                "related_application_id": app.id,
                "related_requirement_id": parent["requirement_id"],
                "actions": [
                    {"label": "View Blocking Approval", "route": f"/approvals/{parent['requirement_id']}"},
                    {"label": "View Dependencies", "route": "/dependencies"},
                ],
            }

    # 5) Deadline
    upcoming = [a for a in apps if a.deadline and a.status not in {"APPROVED", "REJECTED"}]
    upcoming.sort(key=lambda a: a.deadline)
    if upcoming:
        ev = score_application(db, upcoming[0])
        if ev.get("days_to_deadline") is not None and ev["days_to_deadline"] <= 14:
            name = upcoming[0].requirement.name if upcoming[0].requirement else "approval"
            return {
                "priority": "HIGH",
                "title": f"Prioritize renewal / deadline for {name}",
                "description": f"Deadline is in {ev['days_to_deadline']} days.",
                "reason": "An upcoming deadline requires attention.",
                "related_application_id": upcoming[0].id,
                "related_requirement_id": upcoming[0].requirement_id,
                "actions": [{"label": "View Application", "route": f"/approvals/{upcoming[0].requirement_id}"}],
            }

    # 6) ACTION_REQUIRED
    action = next((a for a in apps if a.status == "ACTION_REQUIRED"), None)
    if action:
        name = action.requirement.name if action.requirement else "approval"
        return {
            "priority": "HIGH",
            "title": f"Resolve {name} issue",
            "description": action.blocking_reason or "This application needs attention.",
            "reason": "The application is in ACTION_REQUIRED.",
            "related_application_id": action.id,
            "related_requirement_id": action.requirement_id,
            "actions": [{"label": "View Application", "route": f"/approvals/{action.requirement_id}"}],
        }

    nxt = next((a for a in apps if a.status in {"READY_TO_APPLY", "DRAFT", "NOT_STARTED"}), None)
    if nxt:
        name = nxt.requirement.name if nxt.requirement else "next approval"
        return {
            "priority": "MEDIUM",
            "title": f"Continue with {name}",
            "description": "No blocking document issues were found.",
            "reason": "Proceed to the next applicable approval.",
            "related_application_id": nxt.id,
            "related_requirement_id": nxt.requirement_id,
            "actions": [{"label": "View Application", "route": f"/approvals/{nxt.requirement_id}"}],
        }

    return {
        "priority": "LOW",
        "title": "Compliance profile is in good shape",
        "description": "No urgent actions were identified in this prototype scan.",
        "reason": "Keep tracking renewals and official portal updates.",
        "actions": [{"label": "Open Dashboard", "route": "/dashboard"}],
    }


def _priority_apps(apps: list[Application]) -> list[Application]:
    rank = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}

    def key(a: Application):
        pr = a.requirement.priority if a.requirement else "MEDIUM"
        return (0 if a.requirement and a.requirement.name == "Pollution Consent" else 1, rank.get(pr, 3), a.id)

    return sorted(apps, key=key)


def _dependency_reason(db: Session, apps: list[Application], app: Application) -> str | None:
    dependents = [
        a
        for a in apps
        if a.requirement_id
        and blocking_dependencies(db, a.business_id, a.requirement_id)
        and any(b["requirement_id"] == app.requirement_id for b in blocking_dependencies(db, a.business_id, a.requirement_id))
    ]
    if dependents:
        return "This application is blocking a downstream approval."
    return None

from sqlalchemy.orm import Session

from app.models import Application, Dependency, Requirement

TERMINAL_OK = {"APPROVED"}


def blocking_dependencies(db: Session, business_id: int, requirement_id: int) -> list[dict]:
    edges = db.query(Dependency).filter(Dependency.requirement_id == requirement_id).all()
    blocked = []
    for edge in edges:
        parent_app = (
            db.query(Application)
            .filter(
                Application.business_id == business_id,
                Application.requirement_id == edge.depends_on_requirement_id,
            )
            .first()
        )
        parent_req = db.query(Requirement).filter(Requirement.id == edge.depends_on_requirement_id).first()
        parent_status = parent_app.status if parent_app else "NOT_STARTED"
        if parent_status not in TERMINAL_OK:
            blocked.append(
                {
                    "requirement_id": edge.depends_on_requirement_id,
                    "name": parent_req.name if parent_req else "Unknown",
                    "status": parent_status,
                    "description": edge.description,
                }
            )
    return blocked


def build_graph(db: Session, business_id: int) -> dict:
    apps = db.query(Application).filter(Application.business_id == business_id).all()
    app_by_req = {a.requirement_id: a for a in apps}
    reqs = db.query(Requirement).all()
    req_by_id = {r.id: r for r in reqs}
    edges = db.query(Dependency).all()

    nodes = []
    blocked_approvals = []
    critical = []
    completed = []

    for req in reqs:
        app = app_by_req.get(req.id)
        if not app:
            continue
        blockers = blocking_dependencies(db, business_id, req.id)
        status = app.status
        if blockers and status not in TERMINAL_OK:
            display_status = "BLOCKED"
            blocked_approvals.append({"id": req.id, "name": req.name, "blocked_by": blockers})
        else:
            display_status = status
        if app.status in TERMINAL_OK:
            completed.append({"id": req.id, "name": req.name, "status": app.status})
        nodes.append(
            {
                "id": req.id,
                "name": req.name,
                "status": display_status,
                "application_id": app.id,
                "application_status": app.status,
            }
        )

    edge_payload = []
    for edge in edges:
        if edge.requirement_id in app_by_req and edge.depends_on_requirement_id in app_by_req:
            source_name = req_by_id.get(edge.depends_on_requirement_id)
            target_name = req_by_id.get(edge.requirement_id)
            edge_payload.append(
                {
                    "source": edge.depends_on_requirement_id,
                    "target": edge.requirement_id,
                    "source_name": source_name.name if source_name else None,
                    "target_name": target_name.name if target_name else None,
                    "description": edge.description,
                }
            )
            critical.append(
                {
                    "from": source_name.name if source_name else edge.depends_on_requirement_id,
                    "to": target_name.name if target_name else edge.requirement_id,
                }
            )

    return {
        "nodes": nodes,
        "edges": edge_payload,
        "blocked_approvals": blocked_approvals,
        "critical_dependencies": critical,
        "completed_dependencies": completed,
        "disclaimer": "Prototype sequencing only. Confirm statutory order with the relevant authority.",
    }

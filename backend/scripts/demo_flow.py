from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=False)


def main():
    r = client.get("/api/dashboard/1")
    assert r.status_code == 200, r.text
    data = r.json()["data"]
    print("dashboard", data["total_approvals"], data["pending_actions"], data["next_best_action"]["title"])

    a = client.get("/api/approvals/3")
    print("approval3", a.status_code, a.json()["data"]["name"])

    d = client.get("/api/approvals/3/documents")
    print("docs", d.json()["data"]["missing"], [x["name"] + ":" + x["status"] for x in d.json()["data"]["documents"]])

    u = client.post(
        "/api/documents/upload",
        data={"business_id": 1, "application_id": 3, "document_type": "project_report"},
        files={"file": ("project_report.pdf", b"%PDF-1.4 empty", "application/pdf")},
    )
    print("upload", u.status_code, u.json())
    vid = u.json()["data"]["id"]
    v = client.post(f"/api/documents/{vid}/validate")
    print("validate", v.json()["data"]["status"], v.json()["data"]["score"], v.json()["data"]["issues"])

    txt = open("sample_docs/project_report.txt", "rb").read()
    u2 = client.post(
        "/api/documents/upload",
        data={"business_id": 1, "application_id": 3, "document_type": "project_report"},
        files={"file": ("project_report.txt", txt, "text/plain")},
    )
    v2 = client.post(f"/api/documents/{u2.json()['data']['id']}/validate")
    print("validate2", v2.json()["data"]["status"], v2.json()["data"]["score"])

    cr = client.post("/api/applications", json={"business_id": 1, "requirement_id": 3})
    print("create app", cr.json()["data"])

    rec = client.get("/api/recommendations/1")
    print("nba2", rec.json()["data"]["title"])

    dep = client.get("/api/dependencies/1")
    print("edges", [(e["source_name"], e["target_name"]) for e in dep.json()["data"]["edges"]])

    dash = client.get("/api/dashboard/1")
    print("pending2", dash.json()["data"]["pending_actions"], dash.json()["data"]["next_best_action"]["title"])

    w = client.get("/api/approvals/3/where-to-apply")
    print("where", w.json()["data"])

    print("OK")


if __name__ == "__main__":
    main()

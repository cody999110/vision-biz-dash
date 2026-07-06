from __future__ import annotations

from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.services.dataset_store import dataset_store

client = TestClient(app)
SAMPLES = Path(__file__).resolve().parents[1] / "samples"


def test_create_upload_and_company_view_revenue() -> None:
    create_resp = client.post(
        "/api/v1/import/datasets",
        json={
            "name": "测试收入 · 收入成本",
            "company": "测试公司A",
            "domain": "revenue",
            "template_code": "tpl_revenue_cost_detail",
        },
    )
    assert create_resp.status_code == 200
    dataset_id = create_resp.json()["id"]

    csv_content = (SAMPLES / "sample_revenue.csv").read_bytes()
    upload_resp = client.post(
        f"/api/v1/import/datasets/{dataset_id}/upload",
        files={"file": ("sample_revenue.csv", BytesIO(csv_content), "text/csv")},
    )
    assert upload_resp.status_code == 200
    assert upload_resp.json()["can_activate"] is True

    companies_resp = client.get("/api/v1/import/datasets/companies")
    assert companies_resp.status_code == 200
    companies = companies_resp.json()["items"]
    target = next((c for c in companies if c["name"] == "测试公司A"), None)
    assert target is not None
    assert target["datasets"]["revenue"] == dataset_id

    # Without dataset_id the dashboard stays on demo (mock) data.
    demo_resp = client.get("/api/v1/dashboard/top-customers")
    assert demo_resp.status_code == 200
    assert demo_resp.json()["is_live_data"] is False

    # With the dataset_id the dashboard returns the uploaded company's data.
    live_resp = client.get(f"/api/v1/dashboard/top-customers?dataset_id={dataset_id}")
    assert live_resp.status_code == 200
    payload = live_resp.json()
    assert payload["is_live_data"] is True
    assert len(payload["items"]) > 0

    dataset_store.delete(dataset_id)

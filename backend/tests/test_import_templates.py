from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_import_templates() -> None:
    response = client.get("/api/v1/import/templates")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 4
    assert len(payload["items"]) == 4


def test_list_import_templates_by_domain() -> None:
    response = client.get("/api/v1/import/templates", params={"domain": "expense"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    codes = {item["code"] for item in payload["items"]}
    assert codes == {"tpl_expense_detail", "tpl_budget"}


def test_get_import_template_detail() -> None:
    response = client.get("/api/v1/import/templates/tpl_expense_detail")
    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == "tpl_expense_detail"
    assert payload["column_count"] == 15
    assert payload["columns"][0]["key"] == "trans_date"


def test_download_csv_template() -> None:
    response = client.get("/api/v1/import/templates/tpl_expense_detail/download")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    body = response.content.decode("utf-8-sig")
    lines = body.strip().splitlines()
    assert lines[0].startswith("trans_date")
    assert "发生日期" in lines[1]


def test_download_xlsx_template() -> None:
    response = client.get("/api/v1/import/templates/tpl_revenue_cost_detail/download.xlsx")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert len(response.content) > 1000


def test_template_not_found() -> None:
    response = client.get("/api/v1/import/templates/unknown/download")
    assert response.status_code == 404

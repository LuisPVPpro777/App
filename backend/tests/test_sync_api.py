"""Backend tests for /api/sync/{key} endpoints (protocol + agenda singleton)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://objective-checklist-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(autouse=True)
def cleanup(client):
    # ensure clean state before each test for both keys
    client.delete(f"{API}/sync/protocol", timeout=10)
    client.delete(f"{API}/sync/agenda", timeout=10)
    yield
    client.delete(f"{API}/sync/protocol", timeout=10)
    client.delete(f"{API}/sync/agenda", timeout=10)


class TestSyncProtocol:
    def test_get_empty_returns_null(self, client):
        r = client.get(f"{API}/sync/protocol", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body == {"data": None, "updated_at": None}

    def test_put_then_get_persists(self, client):
        payload = {"data": {"date": "2026-01-15", "checks": {"wakeup": True}, "streak": 3}}
        r = client.put(f"{API}/sync/protocol", json=payload, timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body["ok"] is True
        assert isinstance(body["updated_at"], str) and len(body["updated_at"]) > 0
        first_ts = body["updated_at"]

        g = client.get(f"{API}/sync/protocol", timeout=10)
        assert g.status_code == 200
        gb = g.json()
        assert gb["data"] == payload["data"]
        assert gb["updated_at"] == first_ts

    def test_put_overwrite_updates_timestamp(self, client):
        client.put(f"{API}/sync/protocol", json={"data": {"v": 1}}, timeout=10)
        first = client.get(f"{API}/sync/protocol", timeout=10).json()["updated_at"]
        # second write
        r = client.put(f"{API}/sync/protocol", json={"data": {"v": 2}}, timeout=10)
        assert r.status_code == 200
        second = r.json()["updated_at"]
        assert second != first
        assert client.get(f"{API}/sync/protocol", timeout=10).json()["data"] == {"v": 2}

    def test_delete_clears(self, client):
        client.put(f"{API}/sync/protocol", json={"data": {"x": 1}}, timeout=10)
        d = client.delete(f"{API}/sync/protocol", timeout=10)
        assert d.status_code == 200
        assert d.json() == {"ok": True}
        g = client.get(f"{API}/sync/protocol", timeout=10).json()
        assert g["data"] is None
        assert g["updated_at"] is None


class TestSyncAgenda:
    def test_put_then_get(self, client):
        payload = {"data": {"weekStart": "2026-01-12", "sessions": {"0": [22], "2": [15]}}}
        r = client.put(f"{API}/sync/agenda", json=payload, timeout=10)
        assert r.status_code == 200
        assert r.json()["ok"] is True
        g = client.get(f"{API}/sync/agenda", timeout=10).json()
        assert g["data"] == payload["data"]


class TestSyncValidation:
    def test_invalid_key_get(self, client):
        r = client.get(f"{API}/sync/foobar", timeout=10)
        assert r.status_code == 400

    def test_invalid_key_put(self, client):
        r = client.put(f"{API}/sync/foobar", json={"data": {}}, timeout=10)
        assert r.status_code == 400

    def test_invalid_key_delete(self, client):
        r = client.delete(f"{API}/sync/foobar", timeout=10)
        assert r.status_code == 400

    def test_missing_data_field_rejected(self, client):
        # SyncPayload requires `data` field
        r = client.put(f"{API}/sync/protocol", json={}, timeout=10)
        assert r.status_code == 422


class TestIsolation:
    def test_protocol_and_agenda_independent(self, client):
        client.put(f"{API}/sync/protocol", json={"data": {"src": "protocol"}}, timeout=10)
        client.put(f"{API}/sync/agenda", json={"data": {"src": "agenda"}}, timeout=10)
        assert client.get(f"{API}/sync/protocol", timeout=10).json()["data"] == {"src": "protocol"}
        assert client.get(f"{API}/sync/agenda", timeout=10).json()["data"] == {"src": "agenda"}
        client.delete(f"{API}/sync/protocol", timeout=10)
        # agenda untouched
        assert client.get(f"{API}/sync/agenda", timeout=10).json()["data"] == {"src": "agenda"}

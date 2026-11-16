import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_profile_and_preferences():
    # 1. Get profile (guest user)
    res = client.get("/api/user/profile", headers={"X-Member-Id": "MBR-GUEST"})
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "MBR-GUEST"
    assert "email" in data
    assert "preferences" in data

    # 2. Update preferences
    update_res = client.put(
        "/api/user/preferences",
        headers={"X-Member-Id": "MBR-GUEST"},
        json={
            "display_name": "Rifki Qurio Learner",
            "theme": "warm",
            "preferences": {"pomodoro_work": 30, "pomodoro_break": 10}
        }
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["display_name"] == "Rifki Qurio Learner"
    assert updated_data["theme"] == "warm"
    assert updated_data["preferences"]["pomodoro_work"] == 30

def test_study_notes_api():
    # Save a note
    res = client.post(
        "/api/notes",
        headers={"X-Member-Id": "MBR-TESTNOTE"},
        json={
            "document_id": None,
            "scope": "global",
            "content": "Ini adalah catatan belajar global Qurio."
        }
    )
    assert res.status_code == 200
    note_data = res.json()
    assert note_data["scope"] == "global"
    assert "catatan belajar global" in note_data["content"]

    # Retrieve note
    list_res = client.get("/api/notes", headers={"X-Member-Id": "MBR-TESTNOTE"})
    assert list_res.status_code == 200
    notes = list_res.json()
    assert len(notes) >= 1
    assert any(n["id"] == note_data["id"] for n in notes)

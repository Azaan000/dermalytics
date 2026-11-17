import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_list_doctors(client):
    response = client.get("/api/v1/doctors")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "doctors" in data["data"]
    doctors = data["data"]["doctors"]
    assert len(doctors) >= 8
    first_doc = doctors[0]
    assert "full_name" in first_doc
    assert "pmdc_number" in first_doc
    assert "city" in first_doc
    assert "area" in first_doc
    assert "consultation_fee" in first_doc

def test_filter_doctors_by_city(client):
    response = client.get("/api/v1/doctors?city=Karachi")
    assert response.status_code == 200
    doctors = response.json()["data"]["doctors"]
    assert len(doctors) >= 4
    for doc in doctors:
        assert doc["city"].lower() == "karachi"

def test_filter_doctors_by_proximity(client):
    # Clifton coordinates: 24.8138, 67.0300
    response = client.get("/api/v1/doctors?user_lat=24.8138&user_lon=67.0300")
    assert response.status_code == 200
    doctors = response.json()["data"]["doctors"]
    assert len(doctors) >= 1
    assert doctors[0]["distance_km"] is not None
    # Closest doctor should be Dr. Fatima (Clifton)
    assert doctors[0]["distance_km"] < 10.0

def test_doctor_login_and_pending_reviews(client):
    # Login as seeded demo doctor
    login_res = client.post("/api/v1/auth/login", json={
        "email": "doctor@dermalytics.com",
        "password": "Doctor@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    assert login_res.json()["data"]["user"]["role"] == "doctor"

    # Fetch pending reviews as doctor
    headers = {"Authorization": f"Bearer {token}"}
    pending_res = client.get("/api/v1/doctors/reviews/pending", headers=headers)
    assert pending_res.status_code == 200
    assert "data" in pending_res.json()

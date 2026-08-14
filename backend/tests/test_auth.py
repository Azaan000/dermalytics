import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    db = SessionLocal()
    # Ensure demo user exists
    user = db.query(User).filter(User.email == "demo@dermalytics.com").first()
    if not user:
        user = User(
            email="demo@dermalytics.com",
            username="demouser",
            password_hash=get_password_hash("DemoPass123!"),
            first_name="Demo",
            last_name="Patient",
            is_active=True,
            is_verified=True,
            is_admin=False
        )
        db.add(user)
        db.commit()
    db.close()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["platform"] == "Dermalytics"

def test_login_demo_user():
    response = client.post("/api/v1/auth/login", json={
        "email": "demo@dermalytics.com",
        "password": "DemoPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "demo@dermalytics.com"

def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={
        "email": "demo@dermalytics.com",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401
    assert response.json()["status"] == "error"
    assert response.json()["error"]["code"] == "AUTH_1001"

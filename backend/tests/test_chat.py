import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_config_endpoint():
    response = client.get("/api/v1/chat/config")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "popular_models" in data["data"]

def test_chat_local_fallback_melanoma():
    response = client.post("/api/v1/chat", json={
        "messages": [
            {"role": "user", "content": "What are the signs of malignant melanoma?"}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Melanoma" in data["data"]["reply"]
    assert "ABCDE" in data["data"]["reply"]

def test_chat_local_fallback_hair():
    response = client.post("/api/v1/chat", json={
        "messages": [
            {"role": "user", "content": "Explain Norwood Scale and hair density."}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Norwood" in data["data"]["reply"]

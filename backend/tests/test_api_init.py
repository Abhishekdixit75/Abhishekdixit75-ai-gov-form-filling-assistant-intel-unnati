

# import pytest (removed)
from fastapi.testclient import TestClient
import sys
import os

# Add parent dir to path
sys.path.append(os.getcwd())

from api.main import app

client = TestClient(app)

def test_init_session_requirements():
    response = client.post(
        "/session/init",
        data={"form_type": "income_certificate"}
    )
    assert response.status_code == 200
    data = response.json()
    print("Response:", data)
    
    assert "session_id" in data
    assert "required_documents" in data
    # Check if 'aadhaar' is in requirements as per our update
    assert "aadhaar" in data["required_documents"]
    assert "pan" in data["required_documents"]
    assert "photo" not in data["required_documents"]

if __name__ == "__main__":
    test_init_session_requirements()
    print("✅ test_init_session_requirements passed!")

import pytest
import sys
import os

from app import create_app, db

@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_register(client):
    data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "password123"
    }
    response = client.post('/register', json=data)
    assert response.status_code == 201
    assert b"User registered" in response.data or b"success" in response.data

def test_login(client):
    # Daftar dulu
    client.post('/register', json={
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "password123"
    })

    login_data = {
        "email": "testuser@example.com",
        "password": "password123"
    }
    response = client.post('/login', json=login_data)
    assert response.status_code == 200
    json_data = response.get_json()
    assert "access_token" in json_data or "token" in json_data

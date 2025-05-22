import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

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
    
def test_login_gagal_password_salah(client):
    # Daftar dulu (bisa juga dibuat user di fixture jika sering dipakai)
    client.post('/register', json={
        "username": "login_test_user",
        "email": "login_test@example.com",
        "password": "correct_password"
    })

    login_data = {
        "email": "login_test@example.com",
        "password": "wrong_password"
    }
    response = client.post('/login', json=login_data)
    assert response.status_code == 401 # Atau 400, tergantung implementasi Anda
    json_data = response.get_json()
    assert "access_token" not in json_data # Pastikan tidak ada token
    assert "error" in json_data or b"Invalid credentials" in response.data
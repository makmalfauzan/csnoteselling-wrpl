import pytest

# Ganti dengan user_id yang valid di database test kamu
TEST_USER_ID = 1  

def test_get_profile_existing_user(client):
    response = client.get('/api/user/profile', query_string={"user_id": TEST_USER_ID})
    print("GET profile existing user:", response.json)

    assert response.status_code == 200
    json_data = response.json

    assert "username" in json_data
    assert "email" in json_data
    assert "role" in json_data
    assert "full_name" in json_data
    assert "bio" in json_data
    assert "created_at" in json_data

def test_get_profile_user_not_found(client):
    response = client.get('/api/user/profile', query_string={"user_id": 9999999})  # user_id yang hampir pasti tidak ada
    print("GET profile user not found:", response.json)

    assert response.status_code == 404
    assert response.json["error"] == "User not found"

def test_update_profile_success(client):
    update_data = {
        "user_id": TEST_USER_ID,
        "full_name": "Nama Lengkap Test",
        "bio": "Ini adalah bio test"
    }

    response = client.put('/api/user/update-profile', json=update_data)
    print("PUT update profile success:", response.json)

    assert response.status_code == 200
    assert response.json["message"] == "Profil berhasil diperbarui"

    # Optional: cek apakah update berhasil lewat GET profile
    get_resp = client.get('/api/user/profile', query_string={"user_id": TEST_USER_ID})
    profile_data = get_resp.json
    assert profile_data["full_name"] == update_data["full_name"]
    assert profile_data["bio"] == update_data["bio"]

def test_update_profile_missing_fields(client):
    incomplete_data = {
        "user_id": TEST_USER_ID,
        "full_name": "Nama Lengkap Test"
        # bio tidak dikirim
    }
    response = client.put('/api/user/update-profile', json=incomplete_data)
    print("PUT update profile missing fields:", response.json)

    assert response.status_code == 400
    assert response.json["error"] == "Semua field harus diisi"

def test_register(client):
    response = client.post('/api/register', json={
        'username': 'tester1',
        'email': 'tester@example.com',
        'password': 'pass123',
        'role': 'buyer'  # optional karena default-nya buyer
    })
    assert response.status_code in (200, 201)

def test_login(client):
    # Data user yang sudah ada di database untuk test login
    username = "tester1"  
    password = "pass123"  

    # Login dengan data benar
    response = client.post('/api/login', json={
        "username": username,
        "password": password
    })

    print("Login benar - Status code:", response.status_code)
    print("Login benar - Response JSON:", response.json)

    assert response.status_code == 200
    assert response.json["message"] == "Login sukses"
    assert response.json["username"] == username
    assert "user_id" in response.json
    assert "role" in response.json

    # Login dengan username salah
    response_wrong_user = client.post('/api/login', json={
        "username": "user_tidak_ada",
        "password": password
    })

    print("Login user salah - Status code:", response_wrong_user.status_code)
    print("Login user salah - Response JSON:", response_wrong_user.json)

    assert response_wrong_user.status_code == 401
    assert response_wrong_user.json["error"] == "User tidak ditemukan"

    # Login dengan password salah
    response_wrong_pass = client.post('/api/login', json={
        "username": username,
        "password": "password_salah"
    })

    print("Login password salah - Status code:", response_wrong_pass.status_code)
    print("Login password salah - Response JSON:", response_wrong_pass.json)

    assert response_wrong_pass.status_code == 401
    assert response_wrong_pass.json["error"] == "Password salah"

def test_login_wrong_password(client):
    username = "tester1"
    wrong_password = "password_salah"

    response = client.post('/api/login', json={
        "username": username,
        "password": wrong_password
    })

    print("Login dengan password salah - Status code:", response.status_code)
    print("Response:", response.json)

    assert response.status_code == 401
    assert response.json["error"] == "Password salah"

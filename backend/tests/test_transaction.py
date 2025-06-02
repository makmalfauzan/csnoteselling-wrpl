import pytest
from decimal import Decimal

# Contoh data item produk yang valid
valid_items = [
    {"id": 1, "quantity": 2},
    {"id": 2, "quantity": 1}
]

@pytest.fixture
def user_with_sufficient_balance():
    return {
        "user_id": 1,
        "items": valid_items
    }

@pytest.fixture
def user_with_insufficient_balance():
    return {
        "user_id": 2,
        "items": valid_items
    }

@pytest.fixture
def user_with_pending_transaction():
    return {
        "user_id": 3,
        "items": valid_items
    }

@pytest.fixture
def user_without_wallet():
    return {
        "user_id": 9999,
        "items": valid_items
    }

def test_checkout_success_completed(client, user_with_sufficient_balance):
    """Test checkout dengan saldo cukup -> transaksi COMPLETED"""
    response = client.post('/api/checkout', json=user_with_sufficient_balance)
    assert response.status_code == 200
    json_data = response.json
    assert json_data['success'] is True
    assert json_data['payment_status'] == 'COMPLETED'
    assert 'new_balance' in json_data
    assert 'seller_balances' in json_data

def test_checkout_insufficient_balance(client, user_with_insufficient_balance):
    """Test checkout dengan saldo kurang -> transaksi PENDING"""
    response = client.post('/api/checkout', json=user_with_insufficient_balance)
    assert response.status_code == 200
    json_data = response.json
    assert json_data['success'] is True
    assert json_data['payment_status'] == 'PENDING'
    assert 'new_balance' in json_data
    assert 'seller_balances' in json_data
    assert json_data['message'].startswith("Saldo tidak mencukupi")


def test_checkout_wallet_not_found(client, user_without_wallet):
    """Test checkout gagal karena wallet user tidak ditemukan"""
    response = client.post('/api/checkout', json=user_without_wallet)
    assert response.status_code == 404
    json_data = response.json
    assert 'error' in json_data
    assert json_data['error'] == "Saldo tidak ditemukan"

def test_checkout_missing_fields(client):
    """Test checkout gagal karena input tidak lengkap"""
    response = client.post('/api/checkout', json={"user_id": 1})
    assert response.status_code == 400
    json_data = response.json
    assert 'error' in json_data
    assert json_data['error'] == "User ID dan item diperlukan"

from flask import Blueprint, jsonify
from db_connection import get_db_connection
from flask_cors import CORS
from decimal import Decimal

# Buat Blueprint untuk wallet
wallets_bp = Blueprint('wallets', __name__)
CORS(wallets_bp)

# **API untuk mengambil saldo user**
@wallets_bp.route('/<int:user_id>', methods=['GET'])
def get_wallet_balance(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT balance FROM wallets WHERE user_id = %s", (user_id,))
        wallet = cursor.fetchone()

        if not wallet:
            return jsonify({"error": "Saldo tidak ditemukan"}), 404

        return jsonify({"saldo": wallet["balance"]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# API untuk pembayaran (mengurangi saldo)
@wallets_bp.route('/pay', methods=['POST'])
def process_payment():
    from flask import request
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        data = request.get_json()
        user_id = data.get("user_id")
        amount = data.get("amount")

        # Cek saldo user
        cursor.execute("SELECT balance FROM wallets WHERE user_id = %s", (user_id,))
        wallet = cursor.fetchone()

        if not wallet:
            return jsonify({"error": "Wallet tidak ditemukan"}), 404

        if wallet["balance"] < amount:
            return jsonify({"error": "Saldo tidak cukup"}), 400

        # Kurangi saldo
        new_balance = wallet["balance"] - Decimal(str(amount))
        cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_balance, user_id))
        conn.commit()

        return jsonify({"success": True, "new_balance": new_balance})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

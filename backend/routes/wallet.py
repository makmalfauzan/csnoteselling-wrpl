from flask import Blueprint, jsonify
from db_connection import get_db_connection
from flask_cors import CORS

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

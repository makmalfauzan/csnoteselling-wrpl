from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from flask_cors import CORS

payment_bp = Blueprint('payment', __name__)
CORS(payment_bp)

# **Endpoint untuk mendapatkan saldo user**
@payment_bp.route('/wallet', methods=['GET'])
def get_wallet_balance():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID diperlukan"}), 400

        cursor.execute("SELECT balance FROM wallets WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()

        if result:
            return jsonify({"balance": result['balance']})
        else:
            return jsonify({"error": "Saldo tidak ditemukan"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# **Endpoint untuk mengupdate saldo setelah pembayaran**
@payment_bp.route('/wallet/update', methods=['POST'])
def update_wallet_balance():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        data = request.json
        user_id = data.get("user_id")
        new_balance = data.get("new_balance")

        if not user_id or new_balance is None:
            return jsonify({"error": "User ID dan saldo baru diperlukan"}), 400

        cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_balance, user_id))
        conn.commit()

        return jsonify({"message": "Saldo berhasil diperbarui"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# **Endpoint untuk mengambil daftar materi yang dibeli berdasarkan daftar cart**
@payment_bp.route('/cart/items', methods=['GET'])
def get_cart_items():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        material_ids = request.args.get("ids")
        if not material_ids:
            return jsonify({"error": "Tidak ada ID yang diberikan"}), 400

        material_ids = material_ids.split(",")
        placeholders = ", ".join(["%s"] * len(material_ids))
        query = f"""
        SELECT 
            m.material_id, 
            m.title, 
            m.price 
        FROM materials m
        WHERE m.material_id IN ({placeholders})
        """

        cursor.execute(query, tuple(material_ids))
        materials = cursor.fetchall()

        return jsonify(materials)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

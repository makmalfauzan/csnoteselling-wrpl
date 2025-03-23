from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from flask_cors import CORS
from datetime import datetime
from decimal import Decimal

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


# **Endpoint untuk checkout transaksi**
@payment_bp.route('/checkout', methods=['POST'])
def checkout():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        data = request.json
        user_id = data.get("user_id")
        items = data.get("items")  # List produk yang dibeli

        if not user_id or not items:
            return jsonify({"error": "User ID dan item diperlukan"}), 400

        # Ambil saldo user
        cursor.execute("SELECT balance FROM wallets WHERE user_id = %s", (user_id,))
        wallet = cursor.fetchone()

        if not wallet:
            return jsonify({"error": "Saldo tidak ditemukan"}), 404

        balance = Decimal(str(wallet["balance"]))
        total_cost = Decimal("0")

        # **Ambil harga tiap produk dan hitung total biaya**
        for item in items:
            material_id = item.get("id")  # Pastikan cocok dengan frontend
            quantity = item.get("quantity", 1)  # Default 1 jika tidak dikirim

            cursor.execute("SELECT price, seller_id FROM materials WHERE material_id = %s", (material_id,))
            material = cursor.fetchone()

            if not material:
                return jsonify({"error": f"Produk {material_id} tidak ditemukan"}), 404

            amount = Decimal(str(material["price"])) * quantity
            total_cost += amount

        # **Cek apakah saldo mencukupi**
        if balance < total_cost:
            return jsonify({"error": "Saldo tidak mencukupi"}), 400

        # **Kurangi saldo user**
        new_balance = balance - total_cost
        cursor.execute("UPDATE wallets SET balance = %s WHERE user_id = %s", (new_balance, user_id))

        # **Buat transaksi untuk setiap item**
        transaction_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        for item in items:
            material_id = item.get("id")
            quantity = item.get("quantity", 1)

            cursor.execute("SELECT price, seller_id FROM materials WHERE material_id = %s", (material_id,))
            material = cursor.fetchone()

            if material:
                amount = Decimal(str(material["price"])) * quantity
                seller_id = material["seller_id"]

                cursor.execute("""
                    INSERT INTO transactions (material_id, buyer_id, seller_id, amount, transaction_date, payment_status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (material_id, user_id, seller_id, amount, transaction_date, "COMPLETED"))

        conn.commit()
        return jsonify({"success": True, "message": "Transaksi berhasil!", "new_balance": str(new_balance)})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

from flask import Blueprint, jsonify
from db_connection import get_db_connection  # Pastikan koneksi database sudah ada

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/api/dbuyerorders/recent", methods=["GET"])
def get_recent_orders():
    """Mengambil daftar transaksi terbaru dengan status COMPLETED."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT transaction_id, user_id, total_amount, created_at
            FROM transactions
            WHERE payment_status = 'COMPLETED'
            ORDER BY created_at DESC
            LIMIT 5
        """)
        orders = cursor.fetchall()
        return jsonify(orders), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

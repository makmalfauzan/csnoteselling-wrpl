from flask import Blueprint, jsonify
from db_connection import get_db_connection

seller_bp = Blueprint("seller_bp", __name__)

@seller_bp.route("/api/materials/seller_products/<int:seller_id>", methods=["GET"])
def get_seller_products(seller_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)  # 🔹 Fix: Gunakan dictionary cursor

        # 🔹 Cek apakah user ini adalah SELLER
        cursor.execute("SELECT role FROM users WHERE user_id = %s", (seller_id,))
        user = cursor.fetchone()

        if not user or user.get("role") != "SELLER":  # 🔹 Fix: Gunakan .get() agar aman
            return jsonify({"error": "User bukan SELLER atau tidak ditemukan"}), 403

        # 🔹 Hitung jumlah produk yang dipublish oleh seller
        cursor.execute("SELECT COUNT(*) AS total_products FROM materials WHERE seller_id = %s", (seller_id,))
        result = cursor.fetchone()

        total_products = result["total_products"] if result else 0  # 🔹 Fix: Pastikan result tidak None

        return jsonify({"total_products": total_products})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

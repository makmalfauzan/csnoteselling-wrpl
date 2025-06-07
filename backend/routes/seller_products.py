from flask import Blueprint, jsonify, request
from ..db_connection import get_db_connection

seller_products_bp = Blueprint("seller_products_bp", __name__)

@seller_products_bp.route("/api/materials/seller/<int:seller_id>", methods=["GET"])
def get_seller_products(seller_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Ambil produk yang diunggah oleh seller
        query = """
            SELECT m.material_id, m.title, c.course_name, m.category, m.materi, m.price, m.description, m.uploaded_at
            FROM materials m
            JOIN courses c ON m.course_id = c.course_id
            WHERE m.seller_id = %s
        """
        cursor.execute(query, (seller_id,))
        products = cursor.fetchall()
        
        return jsonify({"products": products})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

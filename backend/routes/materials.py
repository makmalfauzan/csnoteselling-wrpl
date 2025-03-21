from flask import Blueprint, jsonify
from db_connection import get_db_connection
from flask_cors import CORS

# Membuat Blueprint untuk materials
materials_bp = Blueprint('materials', __name__)
CORS(materials_bp)

@materials_bp.route('/', methods=['GET'])
def get_materials():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Menggunakan JOIN untuk mengambil nama seller dari tabel users
        query = """
        SELECT 
    m.material_id, 
    m.title, 
    m.category, 
    m.description, 
    m.price, 
    m.status, 
    m.uploaded_at, 
    u.username AS seller  -- Ambil username seller berdasarkan seller_id
    FROM materials m
    LEFT JOIN users u ON m.seller_id = u.user_id  -- Hubungkan seller_id dengan user_id
    WHERE u.role = 'SELLER';  -- Pastikan hanya user dengan role SELLER

        """

        cursor.execute(query)
        materials = cursor.fetchall()
        return jsonify(materials)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

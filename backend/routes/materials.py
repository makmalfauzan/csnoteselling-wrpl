from flask import Blueprint, jsonify, request
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
        # Ambil parameter filter dari URL
        course_id = request.args.get("course")
        search_query = request.args.get("q", "")
        min_price = request.args.get("minPrice")
        max_price = request.args.get("maxPrice")

        # Query dasar
        query = """
        SELECT 
            m.material_id, 
            m.title, 
            m.category, 
            m.description, 
            m.price, 
            m.status, 
            m.uploaded_at, 
            m.course_id,  -- Tambahkan course_id agar bisa difilter
            u.username AS seller  -- Ambil username seller berdasarkan seller_id
        FROM materials m
        LEFT JOIN users u ON m.seller_id = u.user_id  -- Hubungkan seller_id dengan user_id
        WHERE u.role = 'SELLER'  -- Pastikan hanya user dengan role SELLER
        """
        
        params = []

        # Filter berdasarkan course_id jika dipilih
        if course_id:
            query += " AND m.course_id = %s"
            params.append(course_id)

        # Filter berdasarkan search query (judul)
        if search_query:
            query += " AND m.title LIKE %s"
            params.append(f"%{search_query}%")

        # Filter berdasarkan harga minimal
        if min_price:
            query += " AND m.price >= %s"
            params.append(min_price)

        # Filter berdasarkan harga maksimal
        if max_price:
            query += " AND m.price <= %s"
            params.append(max_price)

        # Urutkan berdasarkan tanggal upload terbaru
        query += " ORDER BY m.uploaded_at DESC"

        cursor.execute(query, params)
        materials = cursor.fetchall()

        return jsonify(materials)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

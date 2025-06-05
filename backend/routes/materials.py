from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from flask_cors import CORS

# Membuat Blueprint untuk materials
materials_bp = Blueprint('materials', __name__)
CORS(materials_bp)

# **Endpoint untuk mendapatkan daftar produk dengan filter**
@materials_bp.route('/materials', methods=['GET'])
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
            m.course_id,  
            u.username AS seller  
        FROM materials m
        LEFT JOIN users u ON m.seller_id = u.user_id  
        WHERE u.role = 'SELLER'  
        """
        
        params = []

        # Filter berdasarkan course_id jika dipilih
        if course_id and course_id != "":
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


# **Endpoint untuk mendapatkan detail produk berdasarkan material_id**
@materials_bp.route('/<int:material_id>', methods=['GET'])
def get_material_detail(material_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Query untuk mengambil detail produk berdasarkan material_id
        query = """
        SELECT 
            m.material_id, 
            m.title, 
            m.category, 
            m.description, 
            m.price, 
            m.status, 
            m.uploaded_at, 
            u.username AS seller  
        FROM materials m
        LEFT JOIN users u ON m.seller_id = u.user_id  
        WHERE m.material_id = %s
        """

        cursor.execute(query, (material_id,))
        material = cursor.fetchone()

        if not material:
            return jsonify({"error": "Produk tidak ditemukan"}), 404

        return jsonify(material)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@materials_bp.route('/batch', methods=['GET'])
def get_multiple_materials():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        ids = request.args.get("ids")
        if not ids:
            return jsonify({"error": "No material IDs provided"}), 400

        material_ids = ids.split(",")  # Pisahkan ID yang dikirim sebagai string "1,2,3"
        placeholders = ", ".join(["%s"] * len(material_ids))  # Buat placeholder untuk query
        query = f"""
        SELECT 
            m.material_id, 
            m.title, 
            m.category, 
            m.description, 
            m.price, 
            m.status, 
            m.uploaded_at, 
            u.username AS seller  
        FROM materials m
        LEFT JOIN users u ON m.seller_id = u.user_id  
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

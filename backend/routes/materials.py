from flask import Blueprint, jsonify
from db_connection import get_db_connection

# Membuat Blueprint untuk materials
materials_bp = Blueprint('materials', __name__)

@materials_bp.route('/', methods=['GET'])
def get_materials():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT material_id, title, category, description, price, status, uploaded_at FROM materials")
        materials = cursor.fetchall()
        return jsonify(materials)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

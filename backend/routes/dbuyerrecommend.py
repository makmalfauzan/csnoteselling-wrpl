from flask import Blueprint, jsonify
from db_connection import get_db_connection

# Ubah nama blueprint dari buyer_bp -> dbuyerrecommend_bp
dbuyerrecommend_bp = Blueprint('dbuyerrecommend', __name__)

@dbuyerrecommend_bp.route('/recommended', methods=['GET'])
def get_recommended():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    sql = """
    SELECT
        materi,
        title,
        price
    FROM materials
    ORDER BY RAND()
    LIMIT 4
    """
    
    cursor.execute(sql)
    data = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(data)